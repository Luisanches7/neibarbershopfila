import { Customer } from '../types';

export function formatTimeSlot(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function calculateWaitTime(customers: Customer[], slotTime: Date): number {
  const queuedCustomers = customers.filter(customer => {
    const bookingTime = new Date(customer.scheduled_time!);
    return bookingTime <= slotTime && customer.status === 'waiting';
  });

  // Base wait time is 5 minutes per queued customer
  return queuedCustomers.length * 5;
}