import { Customer } from '../types';

export function getCustomersByBarber(customers: Customer[], barberId: string) {
  return {
    inService: customers.find(c => c.barber_id === barberId && c.status === 'in-service'),
    waiting: customers.filter(c => c.barber_id === barberId && c.status === 'waiting'),
  };
}

export function sortCustomersBySchedule(customers: Customer[]) {
  return [...customers].sort((a, b) => {
    // First by scheduled time
    const aTime = a.scheduled_time ? new Date(a.scheduled_time).getTime() : 0;
    const bTime = b.scheduled_time ? new Date(b.scheduled_time).getTime() : 0;
    if (aTime !== bTime) return aTime - bTime;
    
    // Then by creation date
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}