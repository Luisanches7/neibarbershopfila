import { supabase } from '../lib/supabase';

interface ActivityLogEntry {
  action: string;
  details: Record<string, any>;
}

export async function logQueueActivity(entry: ActivityLogEntry) {
  try {
    const { error } = await supabase
      .from('activity_log')
      .insert([{
        action: entry.action,
        details: entry.details,
        // Remove performed_by field since we're not using auth
      }]);

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}