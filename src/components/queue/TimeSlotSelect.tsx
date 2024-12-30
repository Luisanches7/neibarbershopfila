import React from 'react';
import { Calendar } from 'lucide-react';
import { Customer, Barber } from '../../types';
import { Service } from '../../types/services';
import { generateTimeSlotsForBarber } from '../../utils/timeSlots';
import { parseTimeSlot, formatTimeSlot } from '../../utils/dateTime';

interface TimeSlotSelectProps {
  customer: Customer;
  barber: Barber;
  service: Service;
  customers: Customer[];
  onTimeChange: (time: string) => void;
  disabled?: boolean;
}

export default function TimeSlotSelect({
  customer,
  barber,
  service,
  customers,
  onTimeChange,
  disabled
}: TimeSlotSelectProps) {
  const timeSlots = React.useMemo(() => {
    // Include current customer's slot as available
    const otherCustomers = customers.filter(c => c.id !== customer.id);
    return generateTimeSlotsForBarber(new Date(), service, barber, otherCustomers);
  }, [customer, barber, service, customers]);

  const currentTime = customer.scheduled_time 
    ? formatTimeSlot(new Date(customer.scheduled_time))
    : '';

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTime = e.target.value;
    if (!selectedTime) return;

    try {
      const date = parseTimeSlot(selectedTime);
      onTimeChange(date.toISOString());
    } catch (error) {
      console.error('Invalid time format:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <select
        value={currentTime}
        onChange={handleTimeChange}
        disabled={disabled}
        className="block w-full rounded-md border-gray-300 shadow-sm 
          focus:border-blue-500 focus:ring-blue-500 text-sm
          disabled:bg-gray-50 disabled:text-gray-500"
      >
        <option value="">{currentTime || 'Select time'}</option>
        {timeSlots
          .filter(slot => slot.available || slot.time === currentTime)
          .map(slot => (
            <option key={slot.time} value={slot.time}>
              {slot.time} {slot.isPeak ? '(Peak)' : ''}
            </option>
          ))}
      </select>
    </div>
  );
}