import { Customer } from '../types';

export function calculateServiceEndTime(startTime: Date, serviceDuration: number): Date {
  return new Date(startTime.getTime() + serviceDuration * 60000);
}

export function isTimeSlotInPast(slotTime: Date): boolean {
  const now = new Date();
  now.setSeconds(0, 0);
  slotTime.setSeconds(0, 0);
  return slotTime < now;
}

export function isPeakHour(
  hour: number, 
  peakHours: { morning: { start: number; end: number }; afternoon: { start: number; end: number } }
): boolean {
  return (hour >= peakHours.morning.start && hour < peakHours.morning.end) ||
         (hour >= peakHours.afternoon.start && hour < peakHours.afternoon.end);
}

export function hasBookingConflict(
  slotStart: Date,
  slotDuration: number,
  bookedRanges: { start: Date; end: Date }[]
): boolean {
  const slotEnd = calculateServiceEndTime(slotStart, slotDuration);
  const now = new Date();
  
  return bookedRanges.some(range => {
    // Skip completed appointments if their end time is in the past
    if (range.end < now) return false;
    
    // Check if the slot overlaps with any active booking
    return (
      (slotStart >= range.start && slotStart < range.end) ||
      (slotEnd > range.start && slotEnd <= range.end) ||
      (slotStart <= range.start && slotEnd >= range.end)
    );
  });
}

export function calculateEstimatedWaitTime(
  slotTime: Date,
  customers: Customer[]
): number {
  // Only consider waiting and in-service customers for wait time
  return customers.filter(customer => 
    (customer.status === 'waiting' || customer.status === 'in-service') && 
    (!customer.scheduled_time || new Date(customer.scheduled_time) <= slotTime)
  ).length * 5;
}

export function formatTimeSlot(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}