-- BioLearn User Feedback Table Migration
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  name TEXT,
  email TEXT,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  page_url TEXT,
  source TEXT DEFAULT 'inline',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying recent feedbacks
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON feedbacks(category);

-- Enable Row Level Security (RLS)
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated users to insert feedback
CREATE POLICY "Allow public insert to feedbacks"
  ON feedbacks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role full access on feedbacks"
  ON feedbacks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
