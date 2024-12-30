import React from 'react';
import { useQueue } from '../contexts/QueueContext';
import QueueItem from './QueueItem';

export default function QueueDisplay() {
  const { customers, barbers, loading } = useQueue();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const timer = setInterval(() => forceUpdate(), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const customersByBarber = barbers.map(barber => ({
    barber,
    inService: customers.find(c => c.barber_id === barber.id && c.status === 'in-service'),
    waiting: customers.filter(c => c.barber_id === barber.id && c.status === 'waiting'),
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Status da Fila</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {customersByBarber.map(({ barber, inService, waiting }) => (
          <QueueItem
            key={barber.id}
            barber={barber}
            inService={inService}
            waiting={waiting}
          />
        ))}
      </div>
    </div>
  );
}