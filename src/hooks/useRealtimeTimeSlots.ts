import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Customer, Barber } from '../types';
import { Service } from '../types/services';
import { TimeSlotData } from '../types/queue';
import { generateTimeSlotsForBarber } from '../utils/timeSlots';

export function useRealtimeTimeSlots(
  date: Date,
  service: Service | null,
  barber: Barber | null,
  customers: Customer[]
) {
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([]);

  // Memoize the slot generation function
  const generateSlots = useCallback(() => {
    if (!service || !barber) {
      return [];
    }
    return generateTimeSlotsForBarber(date, service, barber, customers);
  }, [date, service, barber, customers]);

  // Initial slot calculation
  useEffect(() => {
    setTimeSlots(generateSlots());
  }, [generateSlots]);

  // Subscribe to customer changes
  useEffect(() => {
    if (!barber) return;

    const channel = supabase
      .channel('time-slots')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'customers',
          filter: `barber_id=eq.${barber.id}`
        },
        async () => {
          // Fetch latest customers data instead of using the prop
          const { data: latestCustomers } = await supabase
            .from('customers')
            .select('*')
            .eq('barber_id', barber.id);

          if (service && latestCustomers) {
            const updatedSlots = generateTimeSlotsForBarber(
              date,
              service,
              barber,
              latestCustomers
            );
            setTimeSlots(updatedSlots);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [date, service, barber]); // Remove customers from dependencies

  return timeSlots;
}