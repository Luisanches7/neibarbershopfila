import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Service } from '../types/services';
import { toast } from 'react-hot-toast';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceMap, setServiceMap] = useState<Record<string, Service>>({});

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('duration');

        if (error) throw error;
        setServices(data);
        
        // Create a map of services by ID for easy lookup
        const map = data.reduce((acc, service) => {
          acc[service.id] = service;
          return acc;
        }, {} as Record<string, Service>);
        setServiceMap(map);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return { services, serviceMap, loading };
}