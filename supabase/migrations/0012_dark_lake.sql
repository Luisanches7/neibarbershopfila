/*
  # Fix Queue Ordering Based on Scheduled Time

  1. Changes
    - Update queue position ordering to prioritize scheduled times
    - Sort customers with scheduled times chronologically
    - Place walk-ins after scheduled customers
    - Fix position calculation in triggers

  2. Notes
    - Scheduled customers are ordered by their appointment time
    - Walk-ins are placed after scheduled customers
    - Maintains chronological order within each group
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS auto_update_customer_status_trigger ON customers;
DROP TRIGGER IF EXISTS maintain_queue_order ON customers;
DROP FUNCTION IF EXISTS auto_update_customer_status();
DROP FUNCTION IF EXISTS update_positions_on_schedule_change();
DROP FUNCTION IF EXISTS reorder_queue_positions();

-- Create improved queue position function
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
          -- First order by whether there's a scheduled time (scheduled first)
          CASE WHEN scheduled_time IS NULL THEN 1 ELSE 0 END,
          -- Then by the scheduled time or created_at
          COALESCE(scheduled_time, created_at),
          -- Finally by created_at to break ties
          created_at
      ) as new_position
    FROM customers
    WHERE status = 'waiting'
  ) as subquery
  WHERE c.id = subquery.id
  AND c.status = 'waiting';
END;
$$ LANGUAGE plpgsql;

-- Create new customer status function
CREATE OR REPLACE FUNCTION auto_update_customer_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set initial status to waiting
  NEW.status := 'waiting';
  
  -- Set start_time and estimated_end_time to null for new customers
  NEW.start_time := null;
  NEW.estimated_end_time := null;
  
  -- Initial position will be updated by the reorder function
  NEW.position := null;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new customers
CREATE TRIGGER auto_update_customer_status_trigger
BEFORE INSERT ON customers
FOR EACH ROW
EXECUTE FUNCTION auto_update_customer_status();

-- Create trigger to maintain queue order
CREATE OR REPLACE FUNCTION trigger_reorder_queue()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM reorder_queue_positions();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for various events that should cause reordering
CREATE TRIGGER reorder_on_insert
AFTER INSERT ON customers
FOR EACH ROW
EXECUTE FUNCTION trigger_reorder_queue();

CREATE TRIGGER reorder_on_update
AFTER UPDATE OF status, scheduled_time ON customers
FOR EACH ROW
EXECUTE FUNCTION trigger_reorder_queue();

CREATE TRIGGER reorder_on_delete
AFTER DELETE ON customers
FOR EACH ROW
EXECUTE FUNCTION trigger_reorder_queue();

-- Reorder existing queue
SELECT reorder_queue_positions();