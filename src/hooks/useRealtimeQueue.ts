import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer, Barber } from '../types';
import { toast } from 'react-hot-toast';

export function useRealtimeQueue() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchInitialData() {
      try {
        const [customersResponse, barbersResponse] = await Promise.all([
          supabase.from('customers').select('*').order('created_at'),
          supabase.from('barbers').select('*').order('name')
        ]);

        if (!mounted) return;

        if (customersResponse.error) throw customersResponse.error;
        if (barbersResponse.error) throw barbersResponse.error;

        setCustomers(customersResponse.data);
        setBarbers(barbersResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load queue data');
        toast.error('Failed to load queue data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Initial fetch
    fetchInitialData();

    // Set up real-time subscriptions
    const customersSubscription = supabase
      .channel('customers-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        async (payload) => {
          if (!mounted) return;

          // Optimistically update the local state
          if (payload.eventType === 'INSERT') {
            setCustomers(prev => [...prev, payload.new as Customer]);
          } else if (payload.eventType === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setCustomers(prev => prev.map(c => 
              c.id === payload.new.id ? { ...c, ...payload.new } : c
            ));
          }

          // Fetch fresh data to ensure consistency
          const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at');

          if (mounted && !error && data) {
            setCustomers(data);
          }
        }
      )
      .subscribe();

    const barbersSubscription = supabase
      .channel('barbers-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'barbers' },
        async (payload) => {
          if (!mounted) return;
          
          const { data, error } = await supabase
            .from('barbers')
            .select('*')
            .order('name');

          if (mounted && !error && data) {
            setBarbers(data);
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      mounted = false;
      customersSubscription.unsubscribe();
      barbersSubscription.unsubscribe();
    };
  }, []);

  return { customers, barbers, loading, error };
}