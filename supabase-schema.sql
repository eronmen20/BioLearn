-- BioLearn Content Management System
-- Run this in Supabase SQL Editor

-- ── Bab (Chapters) ──
CREATE TABLE IF NOT EXISTS bab (
  id TEXT PRIMARY KEY,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#6c5ce7',
  video_id TEXT,
  video_title_id TEXT,
  video_title_en TEXT,
  hotspotted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sub Bab (Sub-chapters) ──
CREATE TABLE IF NOT EXISTS sub_bab (
  id SERIAL PRIMARY KEY,
  bab_id TEXT REFERENCES bab(id) ON DELETE CASCADE,
  key TEXT NOT NULL, -- e.g. 'sub.sel1'
  title_id TEXT,
  title_en TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bab_id, key)
);

-- ── Materi (Content) ──
CREATE TABLE IF NOT EXISTS materi (
  id SERIAL PRIMARY KEY,
  bab_id TEXT REFERENCES bab(id) ON DELETE CASCADE,
  sub_bab_key TEXT,
  type TEXT DEFAULT 'text', -- text, html, video, animation, image
  content_id TEXT NOT NULL, -- Indonesian content (HTML)
  content_en TEXT, -- English content (HTML)
  summary_id TEXT, -- Short summary Indonesian
  summary_en TEXT, -- Short summary English
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- flexible data: video_url, animation_config, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Quiz ──
CREATE TABLE IF NOT EXISTS quiz (
  id SERIAL PRIMARY KEY,
  bab_id TEXT REFERENCES bab(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_en TEXT NOT NULL,
  options_id JSONB NOT NULL, -- ["opt1", "opt2", "opt3", "opt4"]
  options_en JSONB NOT NULL,
  correct_answer INTEGER NOT NULL, -- index 0-3
  explanation_id TEXT,
  explanation_en TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Flashcard ──
CREATE TABLE IF NOT EXISTS flashcard (
  id SERIAL PRIMARY KEY,
  bab_id TEXT REFERENCES bab(id) ON DELETE CASCADE,
  front_id TEXT NOT NULL,
  front_en TEXT NOT NULL,
  back_id TEXT NOT NULL,
  back_en TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Praktikum ──
CREATE TABLE IF NOT EXISTS praktikum (
  id SERIAL PRIMARY KEY,
  bab_id TEXT REFERENCES bab(id) ON DELETE CASCADE,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_id TEXT,
  description_en TEXT,
  steps JSONB DEFAULT '[]', -- [{step: 1, instruction: "..."}]
  difficulty TEXT DEFAULT 'sedang', -- mudah, sedang, sulit
  status TEXT DEFAULT 'draft', -- draft, published
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Media Library ──
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'image', -- image, video, document
  url TEXT NOT NULL,
  size_bytes INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Site Settings ──
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('theme', '{"mode": "light", "accent": "#6c5ce7"}'),
  ('general', '{"siteName": "BioLearn", "siteDesc": "Platform Pembelajaran Biologi Interaktif", "timezone": "Asia/Jakarta", "language": "id"}'),
  ('homepage', '{"heroEnabled": true, "statsEnabled": true, "chaptersEnabled": true}')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE bab ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_bab ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard ENABLE ROW LEVEL SECURITY;
ALTER TABLE praktikum ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policies: public read, service role write
CREATE POLICY "Public read bab" ON bab FOR SELECT USING (true);
CREATE POLICY "Public read sub_bab" ON sub_bab FOR SELECT USING (true);
CREATE POLICY "Public read materi" ON materi FOR SELECT USING (true);
CREATE POLICY "Public read quiz" ON quiz FOR SELECT USING (true);
CREATE POLICY "Public read flashcard" ON flashcard FOR SELECT USING (true);
CREATE POLICY "Public read praktikum" ON praktikum FOR SELECT USING (true);
CREATE POLICY "Public read media" ON media FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
