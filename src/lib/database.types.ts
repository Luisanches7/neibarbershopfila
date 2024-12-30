export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      barbers: {
        Row: {
          id: string
          name: string
          status: 'available' | 'busy' | 'offline'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: 'available' | 'busy' | 'offline'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'available' | 'busy' | 'offline'
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          full_name: string
          phone: string
          barber_id: string
          status: 'waiting' | 'in-service' | 'completed'
          position: number | null
          start_time: string | null
          estimated_end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          barber_id: string
          status?: 'waiting' | 'in-service' | 'completed'
          position?: number | null
          start_time?: string | null
          estimated_end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          barber_id?: string
          status?: 'waiting' | 'in-service' | 'completed'
          position?: number | null
          start_time?: string | null
          estimated_end_time?: string | null
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          action: string
          details: Json
          performed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          details?: Json
          performed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          details?: Json
          performed_by?: string | null
          created_at?: string
        }
      }
    }
  }
}