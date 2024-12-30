import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../contexts/QueueContext';
import { useServices } from '../hooks/useServices';
import { z } from 'zod';
import { Scissors } from 'lucide-react';
import ServiceSelection from './ServiceSelection';
import { Service } from '../types/services';
import { Customer, Barber } from '../types';

const customerSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Número de telefone inválido'),
  barber_id: z.string().uuid('Selecione um barbeiro'),
  service_id: z.string().uuid('Selecione um serviço'),
  scheduled_time: z.string().min(1, 'Selecione um horário')
});

export default function CustomerRegistration() {
  const navigate = useNavigate();
  const { barbers, customers, addCustomer } = useQueue();
  const { services, loading: loadingServices } = useServices();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const barberId = formData.get('barber_id') as string;
    
    if (!selectedBarber || selectedBarber.id !== barberId) {
      setErrors(prev => ({ ...prev, barber_id: 'Please select a barber' }));
      setLoading(false);
      return;
    }

    const data = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      barber_id: barberId,
      service_id: selectedService?.id || '',
      scheduled_time: selectedTime || ''
    };

    try {
      const validated = customerSchema.parse(data);
      const scheduledDate = new Date();
      const [hours, minutes, period] = selectedTime!.split(/:|\s/);
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      scheduledDate.setHours(hour, parseInt(minutes), 0, 0);

      await addCustomer({
        ...validated,
        status: 'waiting',
        position: null,
        start_time: null,
        estimated_end_time: null,
        scheduled_time: scheduledDate.toISOString()
      });
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBarberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const barber = barbers.find(b => b.id === e.target.value);
    setSelectedBarber(barber || null);
    setSelectedTime(null); // Reset time when barber changes
  };

  if (loadingServices) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center mb-6">
          <Scissors className="w-8 h-8 text-blue-600 mr-2" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">Entrar na Fila</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-blue-500 focus:ring-blue-500 
                disabled:bg-gray-50 disabled:text-gray-500"
              required
              disabled={loading}
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              WhatsApp
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-blue-500 focus:ring-blue-500
                disabled:bg-gray-50 disabled:text-gray-500"
              required
              disabled={loading}
              placeholder="(00) 00000-0000"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="barber_id" className="block text-sm font-medium text-gray-700">
              Barbeiro
            </label>
            <select
              id="barber_id"
              name="barber_id"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-blue-500 focus:ring-blue-500
                disabled:bg-gray-50 disabled:text-gray-500"
              required
              disabled={loading}
              onChange={handleBarberChange}
              value={selectedBarber?.id || ''}
            >
              <option value="">Selecione um barbeiro</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
            {errors.barber_id && (
              <p className="mt-1 text-sm text-red-600">{errors.barber_id}</p>
            )}
          </div>

          <ServiceSelection
            services={services}
            selectedService={selectedService}
            selectedTime={selectedTime}
            selectedBarber={selectedBarber}
            customers={customers}
            onServiceChange={setSelectedService}
            onTimeChange={setSelectedTime}
            disabled={loading}
          />
          
          {errors.service_id && (
            <p className="mt-1 text-sm text-red-600">{errors.service_id}</p>
          )}
          {errors.scheduled_time && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduled_time}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent 
              rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? 'Entrando na fila...' : 'Entrar na Fila'}
          </button>
        </form>
      </div>
    </div>
  );
}