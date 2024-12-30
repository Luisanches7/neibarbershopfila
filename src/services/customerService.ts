import { supabase } from '../lib/supabase';
import { Customer } from '../types';
import { toast } from 'react-hot-toast';
import { updateQueuePositions } from './queueService';

export async function updateCustomerStatus(
  customerId: string,
  newStatus: Customer['status']
) {
  try {
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (fetchError) throw fetchError;

    const updates: Partial<Customer> = {
      status: newStatus,
    };

    // Set additional fields based on new status
    if (newStatus === 'in-service') {
      const startTime = new Date();
      const estimatedEndTime = new Date(startTime.getTime() + 45 * 60000); // 45 minutes
      updates.start_time = startTime.toISOString();
      updates.estimated_end_time = estimatedEndTime.toISOString();
      updates.position = null;
    } else if (newStatus === 'waiting') {
      updates.start_time = null;
      updates.estimated_end_time = null;
    } else if (newStatus === 'completed') {
      updates.position = null;
      updates.start_time = null;
      updates.estimated_end_time = null;
    }

    const { error: updateError } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId);

    if (updateError) throw updateError;

    // Update queue positions for the affected barber
    if (customer) {
      await updateQueuePositions(customer.barber_id);
    }

    toast.success(`Status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating customer status:', error);
    toast.error('Failed to update status');
    throw error;
  }
}

export async function updateCustomerScheduledTime(
  customerId: string,
  scheduledTime: string
) {
  try {
    const { data: customer, error: updateError } = await supabase
      .from('customers')
      .update({ scheduled_time: scheduledTime })
      .eq('id', customerId)
      .select()
      .single();

    if (updateError) throw updateError;

    if (customer) {
      await updateQueuePositions(customer.barber_id);
    }

    toast.success('Appointment time updated');
  } catch (error) {
    console.error('Error updating scheduled time:', error);
    toast.error('Failed to update appointment time');
    throw error;
  }
}