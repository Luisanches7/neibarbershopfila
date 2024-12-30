import React from 'react';
import { TimeSlotData } from '../types/queue';
import { Clock, Users } from 'lucide-react';

interface TimeSlotGridProps {
  slots: TimeSlotData[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  disabled?: boolean;
}

export default function TimeSlotGrid({
  slots,
  selectedTime,
  onTimeSelect,
  disabled
}: TimeSlotGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500 space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 rounded-full mr-2" />
          Horário de Pico
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          Tempo Estimado de Espera
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {slots.map(({ time, available, isPeak, estimatedWaitTime }) => (
          <button
            key={time}
            type="button"
            disabled={!available || disabled}
            onClick={() => onTimeSelect(time)}
            className={`
              relative p-3 text-sm font-medium rounded-md transition-colors
              ${selectedTime === time
                ? 'bg-blue-600 text-white'
                : available
                  ? isPeak
                    ? 'bg-yellow-50 text-gray-900 border border-yellow-200 hover:bg-yellow-100'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <div className="flex flex-col items-center">
              <span>{time}</span>
              {available && (
                <div className="flex items-center mt-1 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {estimatedWaitTime}min
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}