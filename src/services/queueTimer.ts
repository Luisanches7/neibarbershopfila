import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { logQueueActivity } from './activityLogger';
import { updateQueuePositions } from './queueService';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function retry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retry(operation, retries - 1);
    }
    throw error;
  }
}

export async function checkAndUpdateQueueTimers() {
  try {
    const { data: expiredCustomers, error: fetchError } = await retry(() =>
      supabase
        .from('customers')
        .select('*')
        .eq('status', 'in-service')
        .lt('estimated_end_time', new Date().toISOString())
    );

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return;
    }

    if (!expiredCustomers?.length) return;

    for (const customer of expiredCustomers) {
      try {
        const { error: updateError } = await retry(() =>
          supabase
            .from('customers')
            .update({ 
              status: 'completed',
              position: null,
              start_time: null,
              estimated_end_time: null
            })
            .eq('id', customer.id)
        );

        if (updateError) {
          console.error('Update error:', updateError);
          continue;
        }

        // Update queue positions after completing service
        await updateQueuePositions(customer.barber_id);

        await retry(() =>
          logQueueActivity({
            action: 'customer_completed',
            details: {
              customerId: customer.id,
              customerName: customer.full_name,
              barberId: customer.barber_id,
              completedAt: new Date().toISOString()
            }
          })
        );

        toast.success(`${customer.full_name}'s service has been completed`);
      } catch (error) {
        console.error(`Error processing customer ${customer.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in queue timer check:', error);
    toast.error('Queue update failed. Will retry automatically.');
  }
}