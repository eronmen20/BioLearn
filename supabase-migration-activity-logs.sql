-- Activity logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  detail JSONB DEFAULT '{}',
  ip_address TEXT
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_type ON activity_logs(target_type);

-- RLS: only service role can access
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON activity_logs FOR ALL USING (true);
