import React from 'react';
import { Clock, User, Calendar } from 'lucide-react';
import type { Customer, Barber } from '../../types';
import { formatTime, calculateRemainingTime, calculateWaitTime } from '../../utils/timer';
import { formatTimeSlot } from '../../utils/timeFormatting';
import { useServices } from '../../hooks/useServices';
import ServiceBadge from '../ServiceBadge';
import QueueControls from './QueueControls';

interface QueueItemProps {
  barber: Barber;
  inService: Customer | undefined;
  waiting: Customer[];
}

export default function QueueItem({ barber, inService, waiting }: QueueItemProps) {
  const { serviceMap } = useServices();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const timer = setInterval(() => forceUpdate(), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{barber.name}</h2>
      
      {inService && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Em Atendimento</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <span className="font-medium text-gray-900">{inService.full_name}</span>
              </div>
              <div className="flex items-center space-x-2" role="timer">
                <Clock className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <span className="tabular-nums">
                  {formatTime(calculateRemainingTime(inService.estimated_end_time))}
                </span>
              </div>
            </div>
            {inService.service_id && serviceMap[inService.service_id] && (
              <ServiceBadge 
                service={serviceMap[inService.service_id]} 
                className="text-blue-600"
              />
            )}
            {inService.scheduled_time && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Agendado para {formatTimeSlot(new Date(inService.scheduled_time))}</span>
              </div>
            )}
            <QueueControls customer={inService} />
          </div>
        </div>
      )}

      {waiting.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Lista de Espera ({waiting.length})
          </h3>
          {waiting.map((customer) => (
            <div
              key={customer.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{customer.full_name}</p>
                    <p className="text-sm text-gray-500">Posição: {customer.position}</p>
                  </div>
                  <div className="text-sm text-gray-600 tabular-nums">
                    Espera: {formatTime(calculateWaitTime(customer.position || 0))}
                  </div>
                </div>
                {customer.service_id && serviceMap[customer.service_id] && (
                  <ServiceBadge 
                    service={serviceMap[customer.service_id]} 
                    className="text-gray-600"
                  />
                )}
                {customer.scheduled_time && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Agendado para {formatTimeSlot(new Date(customer.scheduled_time))}</span>
                  </div>
                )}
                <QueueControls customer={customer} />
              </div>
            </div>
          ))}
        </div>
      ) : !inService && (
        <p className="text-gray-500 text-center py-4">
          Nenhum cliente na fila
        </p>
      )}
    </div>
  );
}