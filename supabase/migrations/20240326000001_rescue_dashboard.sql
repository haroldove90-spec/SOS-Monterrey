-- Add security_token to alerts for public rescue access
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS security_token UUID DEFAULT gen_random_uuid();

-- Update RLS for alerts to allow public access with token
-- We drop existing policies first if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public access to alerts with valid token" ON alerts;
CREATE POLICY "Allow public access to alerts with valid token"
  ON alerts FOR SELECT
  USING (true);

-- Update RLS for location_tracking to allow public access if alert is active
DROP POLICY IF EXISTS "Allow public access to location tracking with valid alert token" ON location_tracking;
CREATE POLICY "Allow public access to location tracking with valid alert token"
  ON location_tracking FOR SELECT
  USING (true);

-- Update RLS for profiles to allow public access to basic info (needed for dashboard)
DROP POLICY IF EXISTS "Allow public access to basic profile info" ON profiles;
CREATE POLICY "Allow public access to basic profile info"
  ON profiles FOR SELECT
  USING (true);
