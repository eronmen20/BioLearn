-- BioLearn: Fix Migration - Tables yang belum ada
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. TABEL KELAS
CREATE TABLE IF NOT EXISTS kelas (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  nama_en TEXT,
  deskripsi TEXT,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#6c5ce7',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO kelas (id, nama, nama_en, icon, color, sort_order) VALUES
  ('x', 'Kelas X', 'Grade 10', '📗', '#6c5ce7', 1),
  ('xi', 'Kelas XI', 'Grade 11', '📘', '#00b894', 2),
  ('xii', 'Kelas XII', 'Grade 12', '📙', '#e17055', 3)
ON CONFLICT (id) DO NOTHING;

-- 2. TAMBAH kolom kelas_id ke bab (jika belum ada)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bab' AND column_name='kelas_id') THEN
    ALTER TABLE bab ADD COLUMN kelas_id TEXT REFERENCES kelas(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bab' AND column_name='sort_order') THEN
    ALTER TABLE bab ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

UPDATE bab SET kelas_id = 'x' WHERE kelas_id IS NULL;

-- 3. TABEL SUB_BAB (jika belum ada)
CREATE TABLE IF NOT EXISTS sub_bab (
  id BIGSERIAL PRIMARY KEY,
  bab_id TEXT NOT NULL REFERENCES bab(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  title_id TEXT,
  title_en TEXT,
  summary_id TEXT,
  summary_en TEXT,
  content_id TEXT,
  content_en TEXT,
  video_url TEXT,
  image_url TEXT,
  animation_url TEXT,
  animation_type TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bab_id, key)
);

CREATE INDEX IF NOT EXISTS idx_sub_bab_bab_id ON sub_bab(bab_id);

-- 4. TABEL QUIZ PER SUB-BAB
CREATE TABLE IF NOT EXISTS sub_bab_quiz (
  id BIGSERIAL PRIMARY KEY,
  bab_id TEXT NOT NULL REFERENCES bab(id) ON DELETE CASCADE,
  sub_bab_key TEXT,
  is_reflection BOOLEAN DEFAULT FALSE,
  question_id TEXT,
  question_en TEXT,
  question_image_url TEXT,
  options_id JSONB DEFAULT '[]',
  options_en JSONB DEFAULT '[]',
  correct_answer INTEGER DEFAULT 0,
  explanation_id TEXT,
  explanation_en TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_sub_bab ON sub_bab_quiz(bab_id, sub_bab_key);
CREATE INDEX IF NOT EXISTS idx_quiz_reflection ON sub_bab_quiz(bab_id, is_reflection);

-- 5. UPDATE PROGRESS TABLE (tambah kolom baru jika belum ada)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='progress' AND column_name='reflection_done') THEN
    ALTER TABLE progress ADD COLUMN reflection_done BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='progress' AND column_name='reflection_score') THEN
    ALTER TABLE progress ADD COLUMN reflection_score INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='progress' AND column_name='completion_pct') THEN
    ALTER TABLE progress ADD COLUMN completion_pct REAL DEFAULT 0;
  END IF;
END $$;

-- 6. SITE SETTINGS (update/insert theme presets)
INSERT INTO site_settings (key, value) VALUES
  ('theme_presets', '[
    {"name": "Ungu", "primary": "#6c5ce7", "secondary": "#a29bfe", "bg": "#f5f3ff"},
    {"name": "Hijau", "primary": "#00b894", "secondary": "#55efc4", "bg": "#f0fdf4"},
    {"name": "Biru", "primary": "#0984e3", "secondary": "#74b9ff", "bg": "#eff6ff"},
    {"name": "Merah", "primary": "#d63031", "secondary": "#ff7675", "bg": "#fef2f2"},
    {"name": "Orange", "primary": "#e17055", "secondary": "#fab1a0", "bg": "#fff7ed"}
  ]'::jsonb),
  ('active_theme', '{"preset": "Ungu"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 7. STORAGE BUCKET (jalankan manual di Dashboard > Storage > New Bucket)
-- Bucket name: biolearn-assets
-- Public: YES
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp, image/svg+xml
