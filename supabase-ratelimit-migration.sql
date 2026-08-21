-- Rate limits table for serverless-compatible rate limiting
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
  v_entry RECORD;
BEGIN
  SELECT rl.count, rl.reset_at INTO v_entry FROM rate_limits rl WHERE rl.key = p_key;

  IF NOT FOUND OR v_entry.reset_at < v_now THEN
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (p_key, 1, v_now + make_interval(ms => p_window_ms))
    ON CONFLICT (key) DO UPDATE SET
      count = 1,
      reset_at = v_now + make_interval(ms => p_window_ms);
    RETURN QUERY SELECT TRUE::BOOLEAN, (p_max - 1)::INTEGER;
  ELSIF v_entry.count >= p_max THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, 0::INTEGER;
  ELSE
    UPDATE rate_limits SET count = v_entry.count + 1 WHERE key = p_key;
    RETURN QUERY SELECT TRUE::BOOLEAN, (p_max - v_entry.count - 1)::INTEGER;
  END IF;
END;
$$;
