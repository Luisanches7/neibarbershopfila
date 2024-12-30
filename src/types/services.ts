export interface Service {
  id: string;
  name: string;
  duration: number;
  description: string;
  created_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}