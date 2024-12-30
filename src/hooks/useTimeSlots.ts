import { useState, useEffect, useCallback } from 'react';
import { Service } from '../types/services';
import { TimeSlotData } from '../types/queue';
import { Customer } from '../types';
import { generateTimeSlots } from '../utils/timeSlots';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useTimeSlots(
  service: Service | null,
  customers: Customer[],
  selectedDate: Date
) {
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([]);

  const updateSlots = useCallback(() => {
    if (!service) {
      setTimeSlots([]);
      return;
    }

    const slots = generateTimeSlots(selectedDate, service, customers);
    setTimeSlots(slots);
  }, [service, customers, selectedDate]);

  useEffect(() => {
    updateSlots();
    const timer = setInterval(updateSlots, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [updateSlots]);

  return timeSlots;
}