import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer, Barber } from '../types';
import { toast } from 'react-hot-toast';
import { useQueueData } from '../hooks/useQueueData';
import { useQueueSubscription } from '../hooks/useQueueSubscription';

interface QueueContextType {
  customers: Customer[];
  barbers: Barber[];
  loading: boolean;
  error: string | null;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  refreshQueue: () => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const { customers, barbers, loading, error, fetchData } = useQueueData();

  const refreshQueue = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Set up real-time subscriptions
  useQueueSubscription({
    onCustomerChange: refreshQueue,
    onBarberChange: refreshQueue
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .insert([customer]);

      if (error) throw error;
      await refreshQueue();
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast.error('Falha ao adicionar cliente à fila');
      throw error;
    }
  };

  const removeCustomer = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await refreshQueue();
      toast.success('Cliente removido da fila');
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast.error('Falha ao remover cliente');
    }
  };

  return (
    <QueueContext.Provider value={{
      customers,
      barbers,
      loading,
      error,
      addCustomer,
      removeCustomer,
      refreshQueue,
    }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}