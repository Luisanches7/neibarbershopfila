import { Customer, Service, Barber } from '../types';
import { TIME_SLOT_INTERVAL, BUSINESS_START, BUSINESS_END, PEAK_HOURS } from './timeSlotConstants';
import {
  calculateServiceEndTime,
  isTimeSlotInPast,
  isPeakHour,
  hasBookingConflict,
  calculateEstimatedWaitTime,
  formatTimeSlot
} from './timeSlotCalculations';

export function generateTimeSlotsForBarber(
  date: Date,
  service: Service,
  barber: Barber,
  existingBookings: Customer[]
): { time: string; available: boolean; isPeak: boolean; estimatedWaitTime: number }[] {
  const slots: { time: string; available: boolean; isPeak: boolean; estimatedWaitTime: number }[] = [];
  
  // Filter bookings for this specific barber and exclude completed appointments
  const barberBookings = existingBookings.filter(booking => 
    booking.barber_id === barber.id && 
    booking.status !== 'completed'
  );
  
  // Convert existing bookings to time ranges
  const bookedRanges = barberBookings
    .filter(booking => booking.scheduled_time)
    .map(booking => {
      const startTime = new Date(booking.scheduled_time!);
      const endTime = calculateServiceEndTime(startTime, TIME_SLOT_INTERVAL);
      return { start: startTime, end: endTime };
    });

  // Generate slots at fixed intervals
  for (let hour = BUSINESS_START; hour < BUSINESS_END; hour += TIME_SLOT_INTERVAL / 60) {
    const slotDate = new Date(date);
    slotDate.setHours(Math.floor(hour));
    slotDate.setMinutes((hour % 1) * 60);
    slotDate.setSeconds(0, 0);

    const isPastSlot = isTimeSlotInPast(slotDate);
    const currentHour = slotDate.getHours();
    const isPeak = isPeakHour(currentHour, PEAK_HOURS);
    
    // Check if slot is booked by an active appointment
    const isBooked = hasBookingConflict(slotDate, TIME_SLOT_INTERVAL, bookedRanges);
    
    // Calculate wait time based on active customers
    const estimatedWaitTime = calculateEstimatedWaitTime(slotDate, barberBookings);

    slots.push({
      time: formatTimeSlot(slotDate),
      available: !isPastSlot && !isBooked,
      isPeak,
      estimatedWaitTime
    });
  }

  return slots;
}