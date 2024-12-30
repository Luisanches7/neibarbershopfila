import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Customer } from '../types';

export function useCustomerSubscription(barberId: string | null) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!barberId) return;

    // Initial fetch
    const fetchCustomers = async () => {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('barber_id', barberId);
      if (data) setCustomers(data);
    };
    fetchCustomers();

    // Subscribe to changes
    const channel = supabase
      .channel(`customers-${barberId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'customers',
          filter: `barber_id=eq.${barberId}`
        },
        () => {
          fetchCustomers();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [barberId]);

  return customers;
}