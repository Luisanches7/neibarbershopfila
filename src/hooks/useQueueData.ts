import { useCallback, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer, Barber } from '../types';
import { toast } from 'react-hot-toast';

export function useQueueData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgress = useRef(false);

  const fetchData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;

    try {
      const [customersResponse, barbersResponse] = await Promise.all([
        supabase
          .from('customers')
          .select('*')
          .order('barber_id')
          .order('scheduled_time', { ascending: true, nullsFirst: false })
          .order('created_at'),
        supabase
          .from('barbers')
          .select('*')
          .order('name')
      ]);

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
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  return { customers, barbers, loading, error, fetchData };
}