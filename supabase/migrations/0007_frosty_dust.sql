/*
  # Queue Management System Enhancement

  1. New Tables
    - time_slots
      - slot_id (uuid, primary key)
      - barber_id (uuid, foreign key)
      - start_time (timestamptz)
      - end_time (timestamptz)
      - status (enum: available, booked, blocked)
      - created_at (timestamptz)

    - bookings
      - booking_id (uuid, primary key)
      - customer_id (uuid, foreign key)
      - barber_id (uuid, foreign key)
      - service_id (uuid, foreign key)
      - start_time (timestamptz)
      - end_time (timestamptz)
      - status (enum: scheduled, in_progress, completed, cancelled)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on new tables
    - Add policies for public access and admin management
*/

-- Create enum types
CREATE TYPE slot_status AS ENUM ('available', 'booked', 'blocked');
CREATE TYPE booking_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  slot_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid REFERENCES barbers(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status slot_status DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  booking_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  barber_id uuid REFERENCES barbers(id),
  service_id uuid REFERENCES services(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status booking_status DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for time_slots
CREATE POLICY "Allow public to view time slots"
  ON time_slots
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin to manage time slots"
  ON time_slots
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.email() IN ('admin@barbershop.com')
  ));

-- Policies for bookings
CREATE POLICY "Allow public to create bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to view bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (true);

-- Function to check slot availability
CREATE OR REPLACE FUNCTION check_slot_availability(
  p_barber_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz
) RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE barber_id = p_barber_id
    AND status IN ('scheduled', 'in_progress')
    AND (
      (start_time <= p_start_time AND end_time > p_start_time)
      OR (start_time < p_end_time AND end_time >= p_end_time)
      OR (start_time >= p_start_time AND end_time <= p_end_time)
    )
  );
END;
$$ LANGUAGE plpgsql;