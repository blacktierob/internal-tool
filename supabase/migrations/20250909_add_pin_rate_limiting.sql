-- Server-side PIN login rate limiting
-- Creates a small table to track attempts per PIN hash and locks after threshold

CREATE TABLE IF NOT EXISTS pin_login_attempts (
  pin_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  lock_until TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ
);

-- Protect table by enabling RLS; access via SECURITY DEFINER RPCs above
ALTER TABLE pin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Helper function: check if attempts are allowed for a given pin_hash
-- Returns a JSON object: { "can_attempt": boolean, "retry_after_seconds": integer }
CREATE OR REPLACE FUNCTION pin_can_attempt(p_pin_hash TEXT)
RETURNS JSON AS $$
DECLARE
  rec RECORD;
  can_attempt BOOLEAN := TRUE;
  retry_after_seconds INTEGER := 0;
BEGIN
  SELECT * INTO rec FROM pin_login_attempts WHERE pin_hash = p_pin_hash;

  IF rec.lock_until IS NOT NULL AND rec.lock_until > now() THEN
    can_attempt := FALSE;
    retry_after_seconds := GREATEST(0, CAST(EXTRACT(EPOCH FROM (rec.lock_until - now())) AS INTEGER));
  END IF;

  RETURN json_build_object('can_attempt', can_attempt, 'retry_after_seconds', retry_after_seconds);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record an attempt; if success, reset counters; if failure, increment and lock after threshold
CREATE OR REPLACE FUNCTION record_pin_attempt(p_pin_hash TEXT, p_success BOOLEAN)
RETURNS BOOLEAN AS $$
DECLARE
  rec RECORD;
  v_attempts INTEGER;
  v_lock_until TIMESTAMPTZ;
  v_threshold INTEGER := 5;            -- Failures before lock
  v_lock_minutes INTEGER := 5;         -- Lock duration
BEGIN
  SELECT * INTO rec FROM pin_login_attempts WHERE pin_hash = p_pin_hash FOR UPDATE;

  IF p_success THEN
    IF FOUND THEN
      UPDATE pin_login_attempts
         SET attempts = 0,
             lock_until = NULL,
             last_attempt_at = now()
       WHERE pin_hash = p_pin_hash;
    ELSE
      INSERT INTO pin_login_attempts(pin_hash, attempts, lock_until, last_attempt_at)
      VALUES (p_pin_hash, 0, NULL, now());
    END IF;
    RETURN TRUE;
  END IF;

  -- Failure path
  IF NOT FOUND THEN
    INSERT INTO pin_login_attempts(pin_hash, attempts, lock_until, last_attempt_at)
    VALUES (p_pin_hash, 1, NULL, now());
    RETURN TRUE;
  ELSE
    v_attempts := COALESCE(rec.attempts, 0) + 1;
    v_lock_until := CASE WHEN v_attempts >= v_threshold THEN now() + make_interval(mins => v_lock_minutes) ELSE NULL END;
    UPDATE pin_login_attempts
       SET attempts = v_attempts,
           lock_until = v_lock_until,
           last_attempt_at = now()
     WHERE pin_hash = p_pin_hash;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: basic index to support lookups (PK already exists)
CREATE INDEX IF NOT EXISTS idx_pin_login_attempts_lock_until ON pin_login_attempts(lock_until);

-- Admin helper: list attempts (for Settings UI)
CREATE OR REPLACE FUNCTION pin_list_attempts()
RETURNS TABLE (
  pin_hash TEXT,
  attempts INTEGER,
  lock_until TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.pin_hash, a.attempts, a.lock_until, a.last_attempt_at
    FROM pin_login_attempts a
   ORDER BY a.last_attempt_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin helper: reset attempts for a given pin_hash
CREATE OR REPLACE FUNCTION pin_reset_attempts(p_pin_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pin_login_attempts
     SET attempts = 0,
         lock_until = NULL,
         last_attempt_at = now()
   WHERE pin_hash = p_pin_hash;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
