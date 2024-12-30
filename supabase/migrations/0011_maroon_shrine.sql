/*
  # Fix Queue Position Ordering

  1. Changes
    - Update auto_update_customer_status function to order by scheduled_time
    - Add chronological ordering for queue positions
    - Handle null scheduled_time by falling back to created_at

  2. Notes
    - Positions are now determined by scheduled_time first, then created_at
    - Maintains FIFO order for customers without scheduled times
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS auto_update_customer_status_trigger ON customers;
DROP FUNCTION IF EXISTS auto_update_customer_status();

-- Create updated function with chronological ordering
CREATE OR REPLACE FUNCTION auto_update_customer_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set status to waiting
  NEW.status := 'waiting';
  
  -- Calculate position based on scheduled_time, falling back to created_at
  NEW.position := (
    SELECT COUNT(*) + 1
    FROM customers
    WHERE barber_id = NEW.barber_id
    AND status = 'waiting'
    AND (
      -- Compare scheduled times if both exist
      (scheduled_time IS NOT NULL AND NEW.scheduled_time IS NOT NULL AND scheduled_time <= NEW.scheduled_time)
      OR
      -- If current customer has no scheduled time, compare with created_at
      (NEW.scheduled_time IS NULL AND (scheduled_time IS NULL AND created_at <= NEW.created_at))
      OR
      -- If existing customer has no scheduled time but new one does, new one comes after
      (scheduled_time IS NULL AND NEW.scheduled_time IS NOT NULL)
    )
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

-- Function to reorder existing queue positions
CREATE OR REPLACE FUNCTION reorder_queue_positions()
RETURNS void AS $$
BEGIN
  UPDATE customers c
  SET position = subquery.new_position
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY barber_id 
        ORDER BY 
          CASE 
            WHEN scheduled_time IS NOT NULL THEN 0
            ELSE 1
          END,
          COALESCE(scheduled_time, created_at),
          created_at
      ) as new_position
    FROM customers
    WHERE status = 'waiting'
  ) as subquery
  WHERE c.id = subquery.id
  AND c.status = 'waiting';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain order when scheduled_time is updated
CREATE OR REPLACE FUNCTION update_positions_on_schedule_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.scheduled_time IS DISTINCT FROM NEW.scheduled_time THEN
    PERFORM reorder_queue_positions();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_queue_order
AFTER UPDATE OF scheduled_time
ON customers
FOR EACH ROW
EXECUTE FUNCTION update_positions_on_schedule_change();