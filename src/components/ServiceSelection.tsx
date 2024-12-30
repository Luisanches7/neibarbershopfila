import React from 'react';
import { Service } from '../types/services';
import { Clock } from 'lucide-react';
import TimeSlotGrid from './TimeSlotGrid';
import { Barber } from '../types';
import { useTimeSlotGeneration } from '../hooks/useTimeSlotGeneration';
import { useCustomerSubscription } from '../hooks/useCustomerSubscription';

interface ServiceSelectionProps {
  services: Service[];
  selectedService: Service | null;
  selectedTime: string | null;
  selectedBarber: Barber | null;
  onServiceChange: (service: Service) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
}

export default function ServiceSelection({
  services,
  selectedService,
  selectedTime,
  selectedBarber,
  onServiceChange,
  onTimeChange,
  disabled
}: ServiceSelectionProps) {
  const customers = useCustomerSubscription(selectedBarber?.id ?? null);
  const timeSlots = useTimeSlotGeneration(
    new Date(),
    selectedService,
    selectedBarber,
    customers
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Serviço
        </label>
        <div className="mt-1 grid gap-3">
          {services.map((service) => (
            <label
              key={service.id}
              className={`
                relative flex cursor-pointer rounded-lg border p-4 shadow-sm
                focus:outline-none ${
                  selectedService?.id === service.id
                    ? 'border-blue-500 ring-2 ring-blue-500'
                    : 'border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="service-type"
                value={service.id}
                className="sr-only"
                checked={selectedService?.id === service.id}
                onChange={() => onServiceChange(service)}
                disabled={disabled}
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {service.name}
                    </p>
                    <p className="text-gray-500">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {service.duration} min
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {selectedService && selectedBarber && timeSlots.length > 0 && (
        <TimeSlotGrid
          slots={timeSlots}
          selectedTime={selectedTime}
          onTimeSelect={onTimeChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}