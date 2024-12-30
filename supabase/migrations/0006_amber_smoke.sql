/*
  # Update queue management for chronological ordering

  1. Changes
    - Add trigger to maintain chronological queue positions per barber
    - Update queue position calculation based on scheduled times
    - Ensure positions are barber-specific

  2. Security
    - Maintain existing RLS policies
*/

-- Function to update queue positions chronologically
CREATE OR REPLACE FUNCTION update_queue_positions_chronological()
RETURNS TRIGGER AS $$
BEGIN
  -- Update positions for waiting customers based on scheduled time
  UPDATE customers
  SET position = subquery.new_position
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY barber_id 
        ORDER BY 
          COALESCE(scheduled_time, created_at),
          created_at
      ) as new_position
    FROM customers
    WHERE 
      status = 'waiting'
      AND barber_id = COALESCE(NEW.barber_id, OLD.barber_id)
  ) as subquery
  WHERE customers.id = subquery.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_queue_positions_trigger ON customers;

-- Create new trigger for chronological ordering
CREATE TRIGGER update_queue_positions_chronological_trigger
AFTER INSERT OR DELETE OR UPDATE OF status, scheduled_time
ON customers
FOR EACH ROW
EXECUTE FUNCTION update_queue_positions_chronological();