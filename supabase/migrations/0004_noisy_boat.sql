/*
  # Update Activity Log Permissions and Structure

  1. Changes
    - Remove foreign key constraint from performed_by
    - Make performed_by nullable
    - Add public access policies
    - Simplify activity logging
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow admin access to activity_log" ON activity_log;

-- Remove foreign key constraint
ALTER TABLE activity_log 
  DROP CONSTRAINT IF EXISTS activity_log_performed_by_fkey;

-- Make performed_by nullable
ALTER TABLE activity_log 
  ALTER COLUMN performed_by DROP NOT NULL;

-- Create new policies
CREATE POLICY "Allow public to insert logs"
  ON activity_log
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to view logs"
  ON activity_log
  FOR SELECT
  TO public
  USING (true);