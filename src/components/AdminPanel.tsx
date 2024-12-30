import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../contexts/QueueContext';
import { useAuth } from '../hooks/useAuth';
import { useServices } from '../hooks/useServices';
import { Trash2, Phone } from 'lucide-react';
import { createWhatsAppLink } from '../utils/whatsapp';
import QueueControls from './queue/QueueControls';
import TimeSlotSelect from './queue/TimeSlotSelect';
import { updateCustomerScheduledTime } from '../services/customerService';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { customers, barbers, removeCustomer, loading } = useQueue();
  const { isAdmin, loading: authLoading } = useAuth();
  const { serviceMap, loading: servicesLoading } = useServices();
  const [updatingTime, setUpdatingTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  if (authLoading || loading || servicesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleRemoveCustomer = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este cliente?')) {
      await removeCustomer(id);
    }
  };

  const handleWhatsAppClick = (phone: string, name: string) => {
    const message = `Olá ${name}, sua vez está chegando na NeiBarber! Por favor, dirija-se ao estabelecimento.`;
    window.open(createWhatsAppLink(phone, message), '_blank');
  };

  const handleTimeChange = async (customerId: string, newTime: string) => {
    setUpdatingTime(customerId);
    try {
      await updateCustomerScheduledTime(customerId, newTime);
    } finally {
      setUpdatingTime(null);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <div className="min-w-full">
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barbeiro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => {
                  const barber = barbers.find((b) => b.id === customer.barber_id);
                  const service = customer.service_id ? serviceMap[customer.service_id] : null;
                  
                  if (!barber || !service) return null;

                  return (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.full_name}
                          </div>
                          <button
                            onClick={() => handleWhatsAppClick(customer.phone, customer.full_name)}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            {customer.phone}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{barber.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <QueueControls customer={customer} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TimeSlotSelect
                          customer={customer}
                          barber={barber}
                          service={service}
                          customers={customers}
                          onTimeChange={(time) => handleTimeChange(customer.id, time)}
                          disabled={updatingTime === customer.id}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveCustomer(customer.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          aria-label="Remover cliente"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {customers.map((customer) => {
              const barber = barbers.find((b) => b.id === customer.barber_id);
              const service = customer.service_id ? serviceMap[customer.service_id] : null;
              
              if (!barber || !service) return null;

              return (
                <div key={customer.id} className="bg-white p-4 rounded-lg shadow space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{customer.full_name}</h3>
                      <button
                        onClick={() => handleWhatsAppClick(customer.phone, customer.full_name)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-1"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        {customer.phone}
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomer(customer.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      aria-label="Remover cliente"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Barbeiro:</span>
                      <span className="ml-2 text-sm text-gray-900">{barber.name}</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-500">Status:</span>
                      <div className="mt-1">
                        <QueueControls customer={customer} />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500">Horário:</span>
                      <div className="mt-1">
                        <TimeSlotSelect
                          customer={customer}
                          barber={barber}
                          service={service}
                          customers={customers}
                          onTimeChange={(time) => handleTimeChange(customer.id, time)}
                          disabled={updatingTime === customer.id}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}