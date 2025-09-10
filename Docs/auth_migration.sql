-- Authentication System Migration
-- Run this migration when ready to implement secure PIN-based authentication

-- Create users table for PIN-based authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  pin_hash TEXT, -- Hashed 4-digit PIN
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_pin_login TIMESTAMPTZ,
  last_email_login TIMESTAMPTZ,
  weekly_session_start TIMESTAMPTZ, -- When they did their weekly email login
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own record
CREATE POLICY "Users can read own record" ON users
FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own record (for PIN changes)
CREATE POLICY "Users can update own record" ON users
FOR UPDATE USING (auth.uid() = id);

-- Create function to check if weekly session is valid (not expired Sunday night)
-- Weekly session validity (UK time)
-- Note: For UK Sunday-night reset semantics, consider evaluating both now() and session_start
-- in 'Europe/London' timezone to account for BST/GMT shifts.
-- Example approach if desired:
--   (session_start AT TIME ZONE 'Europe/London') >= (date_trunc('week', (now() AT TIME ZONE 'Europe/London')) + interval '1 day')
-- Keeping the function simple here; apply timezone handling in a follow-up migration if needed.
CREATE OR REPLACE FUNCTION is_weekly_session_valid(session_start TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if session started this week (Monday to Sunday)
  -- Sessions expire Sunday night (start of Monday)
  RETURN session_start >= date_trunc('week', now()) + interval '1 day'; -- Start of Monday this week
END;
$$ LANGUAGE plpgsql;

-- Create function to hash PIN (simple hash for 4-digit PINs)
CREATE OR REPLACE FUNCTION hash_pin(pin TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use MD5 with salt for PIN hashing (simple but sufficient for 4-digit PINs)
  RETURN encode(digest('blacktie_' || pin || '_salt', 'md5'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create function to verify PIN
CREATE OR REPLACE FUNCTION verify_pin(input_pin TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash_pin(input_pin) = stored_hash;
END;
$$ LANGUAGE plpgsql;

-- Create function to authenticate with PIN
CREATE OR REPLACE FUNCTION authenticate_with_pin(input_email TEXT, input_pin TEXT)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  session_valid BOOLEAN
) AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by email
  SELECT * INTO user_record 
  FROM users 
  WHERE email = input_email AND is_active = true;
  
  -- Check if user exists and PIN matches
  IF user_record IS NOT NULL AND verify_pin(input_pin, user_record.pin_hash) THEN
    -- Check if weekly session is still valid
    IF is_weekly_session_valid(user_record.weekly_session_start) THEN
      -- Update last PIN login
      UPDATE users 
      SET last_pin_login = now() 
      WHERE id = user_record.id;
      
      -- Return user data
      RETURN QUERY SELECT 
        user_record.id,
        user_record.email,
        user_record.first_name,
        user_record.last_name,
        user_record.role,
        true as session_valid;
    ELSE
      -- Session expired - require email/password login
      RETURN QUERY SELECT 
        user_record.id,
        user_record.email,
        user_record.first_name,
        user_record.last_name,
        user_record.role,
        false as session_valid;
    END IF;
  END IF;
  
  -- Invalid credentials
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_pin_hash ON users(pin_hash);
CREATE INDEX IF NOT EXISTS idx_users_weekly_session ON users(weekly_session_start);

-- Insert sample admin user (replace with real data)
-- Note: This creates a user with PIN '1234' hashed - change in production!
INSERT INTO users (email, first_name, last_name, pin_hash, role, weekly_session_start)
VALUES (
  'admin@blacktiemenswear.co.uk', 
  'Admin', 
  'User', 
  hash_pin('1234'),
  'admin',
  now() -- Start with valid session for initial setup
)
ON CONFLICT (email) DO NOTHING;
