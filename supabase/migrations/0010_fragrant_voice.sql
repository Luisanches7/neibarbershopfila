/*
  # Fix Queue Behavior

  1. Changes
    - Drop existing auto_update_customer_status trigger and function
    - Create new function that always puts new customers in waiting status
    - Recreate trigger with updated logic

  2. Security
    - No changes to RLS policies
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS auto_update_customer_status_trigger ON customers;
DROP FUNCTION IF EXISTS auto_update_customer_status();

-- Create new function that always puts customers in waiting status
CREATE OR REPLACE FUNCTION auto_update_customer_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set status to waiting
  NEW.status := 'waiting';
  
  -- Calculate position
  NEW.position := (
    SELECT COUNT(*) + 1
    FROM customers
    WHERE barber_id = NEW.barber_id
    AND status = 'waiting'
  );
  
  -- Calculate estimated time based on waiting customers
  NEW.estimated_end_time := (
    SELECT MAX(estimated_end_time) + interval '45 minutes'
    FROM customers
    WHERE barber_id = NEW.barber_id
    AND (status = 'waiting' OR status = 'in-service')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER auto_update_customer_status_trigger
BEFORE INSERT
ON customers
FOR EACH ROW
EXECUTE FUNCTION auto_update_customer_status();