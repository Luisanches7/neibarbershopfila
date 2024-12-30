import { supabase } from '../lib/supabase';
import { Customer } from '../types';
import { toast } from 'react-hot-toast';

export async function checkAndUpdateQueue() {
  const { data: inServiceCustomers } = await supabase
    .from('customers')
    .select('*')
    .eq('status', 'in-service');

  if (!inServiceCustomers) return;

  for (const customer of inServiceCustomers) {
    const endTime = new Date(customer.estimated_end_time || '');
    
    if (endTime <= new Date()) {
      await supabase
        .from('customers')
        .update({ status: 'completed' })
        .eq('id', customer.id);

      // Removed automatic promotion of next customer
    }
  }
}

// Function now only updates positions without changing status
export async function updateQueuePositions(barberId: string) {
  try {
    const { data: waitingCustomers, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('barber_id', barberId)
      .eq('status', 'waiting')
      .order('scheduled_time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    // Update positions without changing status
    for (let i = 0; i < (waitingCustomers?.length || 0); i++) {
      const customer = waitingCustomers?.[i];
      if (customer) {
        await supabase
          .from('customers')
          .update({ position: i + 1 })
          .eq('id', customer.id);
      }
    }
  } catch (error) {
    console.error('Error updating queue positions:', error);
    toast.error('Failed to update queue positions');
  }
}