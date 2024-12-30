import { supabase } from '../lib/supabase';
import type { Customer } from '../types';

export async function checkBarberStatus(barberId: string) {
  const { data: inServiceCustomers } = await supabase
    .from('customers')
    .select('*')
    .eq('barber_id', barberId)
    .eq('status', 'in-service');

  return (inServiceCustomers?.length ?? 0) === 0;
}