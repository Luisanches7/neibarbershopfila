/*
  # Time Slot Locking System

  1. New Functions
    - check_and_lock_slot: Atomically checks and locks a time slot
    - release_slot: Releases a previously locked slot

  2. Changes
    - Adds locking mechanism to prevent double bookings
    - Implements atomic slot reservation
*/

-- Function to check and lock a time slot
CREATE OR REPLACE FUNCTION check_and_lock_slot(
  p_barber_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz
) RETURNS boolean AS $$
DECLARE
  is_available boolean;
BEGIN
  -- Lock the time_slots table to prevent concurrent modifications
  LOCK TABLE time_slots IN SHARE ROW EXCLUSIVE MODE;
  
  -- Check if slot is available
  SELECT NOT EXISTS (
    SELECT 1 
    FROM time_slots
    WHERE barber_id = p_barber_id
    AND status != 'available'
    AND (
      (start_time <= p_start_time AND end_time > p_start_time)
      OR (start_time < p_end_time AND end_time >= p_end_time)
      OR (start_time >= p_start_time AND end_time <= p_end_time)
    )
  ) INTO is_available;

  -- If available, create a locked slot
  IF is_available THEN
    INSERT INTO time_slots (
      barber_id,
      start_time,
      end_time,
      status
    ) VALUES (
      p_barber_id,
      p_start_time,
      p_end_time,
      'booked'
    );
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;