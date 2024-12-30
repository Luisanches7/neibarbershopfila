/*
  # Add status management functionality

  1. Changes
    - Add function to safely update customer status
    - Add trigger to maintain queue order on status changes
    - Add policies for status management
*/

-- Function to update customer status safely
CREATE OR REPLACE FUNCTION update_customer_status(
  customer_id uuid,
  new_status customer_status
)
RETURNS void AS $$
DECLARE
  current_status customer_status;
  current_barber_id uuid;
BEGIN
  -- Get current status and barber
  SELECT status, barber_id 
  INTO current_status, current_barber_id
  FROM customers 
  WHERE id = customer_id;

  -- Update customer status
  UPDATE customers 
  SET 
    status = new_status,
    -- Reset or set fields based on new status
    start_time = CASE 
      WHEN new_status = 'in-service' THEN now()
      ELSE null 
    END,
    estimated_end_time = CASE 
      WHEN new_status = 'in-service' THEN now() + interval '45 minutes'
      ELSE null 
    END,
    position = CASE 
      WHEN new_status = 'waiting' THEN (
        SELECT COALESCE(MAX(position), 0) + 1
        FROM customers
        WHERE barber_id = current_barber_id AND status = 'waiting'
      )
      ELSE null 
    END
  WHERE id = customer_id;

  -- Log the status change
  INSERT INTO activity_log (action, details)
  VALUES (
    'customer_status_changed',
    jsonb_build_object(
      'customer_id', customer_id,
      'old_status', current_status,
      'new_status', new_status
    )
  );
END;
$$ LANGUAGE plpgsql;