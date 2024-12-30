/*
  # Initial Schema for Barbershop Queue Management System

  1. New Tables
    - `barbers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `customers`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `phone` (text)
      - `barber_id` (uuid, foreign key)
      - `status` (text)
      - `position` (integer)
      - `start_time` (timestamp)
      - `estimated_end_time` (timestamp)
      - `created_at` (timestamp)
    
    - `activity_log`
      - `id` (uuid, primary key)
      - `action` (text)
      - `details` (jsonb)
      - `performed_by` (uuid)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public access where appropriate
*/

-- Create enum types
CREATE TYPE customer_status AS ENUM ('waiting', 'in-service', 'completed');
CREATE TYPE barber_status AS ENUM ('available', 'busy', 'offline');

-- Create barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status barber_status DEFAULT 'available',
  created_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 50),
  phone text NOT NULL,
  barber_id uuid REFERENCES barbers(id),
  status customer_status DEFAULT 'waiting',
  position integer,
  start_time timestamptz,
  estimated_end_time timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for barbers table
CREATE POLICY "Allow public read access to barbers"
  ON barbers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin to manage barbers"
  ON barbers
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.email() IN ('admin@barbershop.com')
  ));

-- Policies for customers table
CREATE POLICY "Allow public to create customers"
  ON customers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to view customers"
  ON customers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin to manage customers"
  ON customers
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.email() IN ('admin@barbershop.com')
  ));

-- Policies for activity log
CREATE POLICY "Allow admin to view activity log"
  ON activity_log
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.email() IN ('admin@barbershop.com')
  ));

-- Function to update queue positions
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update positions for remaining customers
  UPDATE customers
  SET position = subquery.new_position
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY barber_id 
        ORDER BY created_at
      ) as new_position
    FROM customers
    WHERE status = 'waiting'
  ) as subquery
  WHERE customers.id = subquery.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating queue positions
CREATE TRIGGER update_queue_positions_trigger
AFTER INSERT OR DELETE OR UPDATE OF status
ON customers
FOR EACH ROW
EXECUTE FUNCTION update_queue_positions();

-- Function to automatically update customer status
CREATE OR REPLACE FUNCTION auto_update_customer_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there are no in-service customers for the selected barber
  IF NOT EXISTS (
    SELECT 1 FROM customers 
    WHERE barber_id = NEW.barber_id 
    AND status = 'in-service'
  ) THEN
    -- Set this customer as in-service
    NEW.status := 'in-service';
    NEW.start_time := now();
    NEW.estimated_end_time := now() + interval '45 minutes';
  ELSE
    -- Calculate position and estimated time
    NEW.position := (
      SELECT COUNT(*) + 1
      FROM customers
      WHERE barber_id = NEW.barber_id
      AND status = 'waiting'
    );
    NEW.estimated_end_time := (
      SELECT MAX(estimated_end_time) + interval '45 minutes'
      FROM customers
      WHERE barber_id = NEW.barber_id
      AND (status = 'waiting' OR status = 'in-service')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new customers
CREATE TRIGGER auto_update_customer_status_trigger
BEFORE INSERT
ON customers
FOR EACH ROW
EXECUTE FUNCTION auto_update_customer_status();

-- Insert initial barbers
INSERT INTO barbers (name, status)
VALUES 
  ('Nei', 'available'),
  ('João Vitor', 'available')
ON CONFLICT DO NOTHING;