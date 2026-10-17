-- =============================================================
-- BioLearn rate-limit RPC FIX
--
-- The original supabase-ratelimit-migration.sql used
--   make_interval(ms => p_window_ms)
-- which is INVALID in Postgres: make_interval has no `ms`
-- parameter (only years, months, days, hours, mins, secs).
-- The RPC therefore always threw 42883, which the old
-- fail-open app code silently ignored — meaning NO rate
-- limiting was ever actually active. The app now fails
-- closed, so this corrected version MUST be applied.
--
-- Run this entire file in the Supabase SQL Editor.
-- =============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RPC function for atomic rate limiting (avoids race conditions)
CREATE OR REPLACE FUNCTION check_rate_limit(p_key TEXT, p_max INTEGER, p_window_ms BIGINT)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window INTERVAL := p_window_ms * interval '1 millisecond';
  v_entry RECORD;
BEGIN
  SELECT rl.count, rl.reset_at INTO v_entry FROM rate_limits rl WHERE rl.key = p_key;

  IF NOT FOUND OR v_entry.reset_at < v_now THEN
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (p_key, 1, v_now + v_window)
    ON CONFLICT (key) DO UPDATE SET
      count = 1,
      reset_at = v_now + v_window;
    RETURN QUERY SELECT TRUE::BOOLEAN, (p_max - 1)::INTEGER;
  ELSIF v_entry.count >= p_max THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, 0::INTEGER;
  ELSE
    UPDATE rate_limits SET count = v_entry.count + 1 WHERE key = p_key;
    RETURN QUERY SELECT TRUE::BOOLEAN, (p_max - v_entry.count - 1)::INTEGER;
  END IF;
END;
$$;
