/*
  # Add service selection support
  
  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `duration` (integer, minutes)
      - `description` (text)
      - `created_at` (timestamp)
  
  2. Changes
    - Add `service_id` to customers table
    - Add `scheduled_time` to customers table
  
  3. Security
    - Enable RLS on services table
    - Add policies for public access
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  duration integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add service_id and scheduled_time to customers
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES services(id),
ADD COLUMN IF NOT EXISTS scheduled_time timestamptz;

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public to view services"
  ON services
  FOR SELECT
  TO public
  USING (true);

-- Insert default services
INSERT INTO services (name, duration, description) VALUES
  ('Simple Service', 30, 'Clippers/Razor Cut, Beard Trim, or Eyebrow Grooming'),
  ('Complete Service', 50, 'Haircut + Beard/Eyebrow Grooming')
ON CONFLICT DO NOTHING;