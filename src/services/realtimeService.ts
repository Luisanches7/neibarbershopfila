import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface SubscriptionHandlers {
  onCustomerChange?: () => void;
  onBarberChange?: () => void;
}

let customerChannel: RealtimeChannel | null = null;
let barberChannel: RealtimeChannel | null = null;

export function subscribeToQueueChanges({ onCustomerChange, onBarberChange }: SubscriptionHandlers) {
  try {
    // Unsubscribe from existing channels if any
    unsubscribeFromQueueChanges();

    // Subscribe to customer changes
    customerChannel = supabase
      .channel('customer-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          const event = payload.eventType;
          const status = payload.new?.status;
          
          // Show appropriate toast message based on the event
          if (event === 'INSERT') {
            toast.success('New customer joined the queue');
          } else if (event === 'UPDATE' && status === 'in-service') {
            toast.success('Customer is now being served');
          } else if (event === 'DELETE') {
            toast.info('Customer removed from queue');
          }

          onCustomerChange?.();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to customer changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to customer changes');
          toast.error('Connection error. Updates may be delayed.');
        }
      });

    // Subscribe to barber changes
    barberChannel = supabase
      .channel('barber-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'barbers' },
        () => {
          onBarberChange?.();
        }
      )
      .subscribe();

    return () => unsubscribeFromQueueChanges();
  } catch (error) {
    console.error('Error setting up realtime subscriptions:', error);
    toast.error('Failed to connect to real-time updates');
  }
}

export function unsubscribeFromQueueChanges() {
  customerChannel?.unsubscribe();
  barberChannel?.unsubscribe();
  customerChannel = null;
  barberChannel = null;
}