import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface QueueSubscriptionOptions {
  onCustomerChange: () => void;
  onBarberChange?: () => void;
  barberId?: string;
}

export function useQueueSubscription({ 
  onCustomerChange, 
  onBarberChange,
  barberId 
}: QueueSubscriptionOptions) {
  const handleCustomerChange = useCallback(async (payload: any) => {
    const event = payload.eventType;
    const status = payload.new?.status;
    
    // Immediate callback for UI update
    onCustomerChange();
    
    // Show appropriate toast message
    if (event === 'INSERT') {
      toast.success('Novo cliente entrou na fila');
    } else if (event === 'UPDATE') {
      if (status === 'in-service') {
        toast.success('Cliente está sendo atendido');
      } else if (status === 'completed') {
        toast.success('Atendimento finalizado');
      }
    } else if (event === 'DELETE') {
      toast.info('Cliente removido da fila');
    }
  }, [onCustomerChange]);

  useEffect(() => {
    const filter = barberId ? { filter: `barber_id=eq.${barberId}` } : {};
    
    const customerChannel = supabase
      .channel('customers-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'customers',
          ...filter
        },
        handleCustomerChange
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Inscrito nas atualizações de clientes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Falha ao se inscrever nas atualizações');
          toast.error('Erro de conexão. As atualizações podem estar atrasadas.');
        }
      });

    const barberChannel = onBarberChange ? supabase
      .channel('barbers-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'barbers' },
        onBarberChange
      )
      .subscribe() : null;

    return () => {
      customerChannel.unsubscribe();
      if (barberChannel) barberChannel.unsubscribe();
    };
  }, [barberId, handleCustomerChange, onBarberChange]);
}