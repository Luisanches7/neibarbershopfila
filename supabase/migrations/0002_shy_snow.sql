/*
  # Fix database permissions

  1. Changes
    - Update RLS policies for customers table to allow public access
    - Update RLS policies for barbers table to allow public access
    - Update RLS policies for activity_log table to allow admin access

  2. Security
    - Enable public read/write access to customers table
    - Enable public read access to barbers table
    - Restrict activity_log access to admin users
*/

-- Update customers table policies
DROP POLICY IF EXISTS "Allow public to create customers" ON customers;
DROP POLICY IF EXISTS "Allow public to view customers" ON customers;

CREATE POLICY "Allow public access to customers"
  ON customers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update barbers table policies
DROP POLICY IF EXISTS "Allow public read access to barbers" ON barbers;

CREATE POLICY "Allow public access to barbers"
  ON barbers
  FOR SELECT
  TO public
  USING (true);

-- Update activity_log table policies
DROP POLICY IF EXISTS "Allow admin to view activity log" ON activity_log;

CREATE POLICY "Allow admin access to activity_log"
  ON activity_log
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.email() IN ('admin@barbershop.com')
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.email() IN ('admin@barbershop.com')
  ));