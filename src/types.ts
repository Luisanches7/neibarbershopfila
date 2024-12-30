export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  barber_id: string;
  status: 'waiting' | 'in-service' | 'completed';
  position: number | null;
  start_time: string | null;
  estimated_end_time: string | null;
  created_at: string;
}

export interface Barber {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, any>;
  performed_by: string | null;
  created_at: string;
}