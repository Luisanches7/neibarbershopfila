import { useMemo } from 'react';
import { Customer, Barber } from '../types';
import { Service } from '../types/services';
import { TimeSlotData } from '../types/queue';
import { generateTimeSlotsForBarber } from '../utils/timeSlots';

export function useTimeSlotGeneration(
  date: Date,
  service: Service | null,
  barber: Barber | null,
  customers: Customer[]
): TimeSlotData[] {
  return useMemo(() => {
    if (!service || !barber) return [];
    return generateTimeSlotsForBarber(date, service, barber, customers);
  }, [date, service, barber, customers]);
}