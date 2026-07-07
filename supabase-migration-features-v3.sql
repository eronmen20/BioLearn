-- BioLearn v3 Features Migration
-- 1. Archive flag on bab (hide non-bakteri chapters, keep toggleable from admin)
-- 2. announcements table (system announcements shown to all users)
-- 3. flashcard.sub_bab_key (place flashcard per sub-bab)

-- ── 1. bab.is_archived ──
ALTER TABLE bab ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE bab ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Archive all non-bakteri bab by default (bakteri stays active & promoted)
UPDATE bab SET is_archived = TRUE, archived_at = NOW()
WHERE id <> 'bakteri' AND is_archived IS DISTINCT FROM TRUE;

-- Index for fast archived filtering
CREATE INDEX IF NOT EXISTS idx_bab_is_archived ON bab(is_archived);

-- ── 2. announcements table ──
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published', -- 'draft' | 'published'
  category TEXT DEFAULT 'info',              -- 'info' | 'new_feature' | 'new_content' | 'maintenance' | 'urgent'
  icon TEXT DEFAULT '📣',
  bab_id TEXT,                              -- optional link to specific bab
  starts_at TIMESTAMPTZ,                    -- optional scheduling
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policies: public read for published, service role write
DROP POLICY IF EXISTS "Public read announcements" ON announcements;
CREATE POLICY "Public read announcements" ON announcements
  FOR SELECT USING (status = 'published');

-- Seed: a welcome announcement so bell has content on first deploy
INSERT INTO announcements (title, body, pinned, status, category, icon)
VALUES (
  'Selamat datang di BioLearn!',
  'Materi BAB Bakteri sudah bisa kamu akses dengan lengkap — termasuk ringkasan, video, animasi, dan kuis refleksi. Materi bab lainnya akan kami perbarui secara berkala. Stay tuned! 🦠✨',
  TRUE,
  'published',
  'info',
  '🎉'
) ON CONFLICT DO NOTHING;

-- ── 3. flashcard.sub_bab_key ──
ALTER TABLE flashcard ADD COLUMN IF NOT EXISTS sub_bab_key TEXT;

-- Index for per-sub-bab card lookup
CREATE INDEX IF NOT EXISTS idx_flashcard_sub_bab_key ON flashcard(sub_bab_key);
CREATE INDEX IF NOT EXISTS idx_flashcard_bab_sub ON flashcard(bab_id, sub_bab_key);

-- ── Ensure updated_at triggers exist for announcements ──
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON announcements;
CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
