import React from 'react';
import { Customer } from '../../types';
import { updateCustomerStatus } from '../../services/customerService';
import StatusSelect from './StatusSelect';
import { useQueue } from '../../contexts/QueueContext';

interface QueueControlsProps {
  customer: Customer;
}

export default function QueueControls({ customer }: QueueControlsProps) {
  const [loading, setLoading] = React.useState(false);
  const { refreshQueue } = useQueue();

  const handleStatusChange = async (newStatus: Customer['status']) => {
    if (!window.confirm(`Mudar status para ${newStatus}?`)) return;
    
    setLoading(true);
    try {
      await updateCustomerStatus(customer.id, newStatus);
      await refreshQueue();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between mt-2">
      <StatusSelect
        status={customer.status}
        onChange={handleStatusChange}
        disabled={loading}
      />
    </div>
  );
}