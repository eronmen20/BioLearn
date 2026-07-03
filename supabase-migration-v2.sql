-- BioLearn: Comprehensive Migration v2
-- Jalankan di Supabase SQL Editor (jalankan per-blok jika ada error)
-- =============================================

-- 1. TABEL KELAS (jika belum ada)
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

-- 2. TAMBAH kolom kelas_id ke tabel bab
ALTER TABLE bab ADD COLUMN IF NOT EXISTS kelas_id TEXT REFERENCES kelas(id) ON DELETE SET NULL;
ALTER TABLE bab ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update bab existing dengan kelas_id default
UPDATE bab SET kelas_id = 'x' WHERE kelas_id IS NULL;

-- 3. TABEL SUB-BAB (per-sub-bab content: video, gambar, animasi)
CREATE TABLE IF NOT EXISTS sub_bab (
  id BIGSERIAL PRIMARY KEY,
  bab_id TEXT NOT NULL REFERENCES bab(id) ON DELETE CASCADE,
  key TEXT NOT NULL, -- e.g. 'sub.sel1', 'sub.sel2'
  title_id TEXT,
  title_en TEXT,
  summary_id TEXT,
  summary_en TEXT,
  content_id TEXT, -- full HTML content
  content_en TEXT,
  video_url TEXT,
  image_url TEXT,
  animation_url TEXT,
  animation_type TEXT, -- 'lottie', 'gif', 'mp4', 'interactive'
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
  sub_bab_key TEXT, -- NULL = quiz refleksi akhir bab
  is_reflection BOOLEAN DEFAULT FALSE, -- TRUE = quiz refleksi keseluruhan bab
  question_id TEXT, -- question text (ID)
  question_en TEXT,
  question_image_url TEXT, -- gambar untuk soal
  options_id JSONB DEFAULT '[]', -- array of option texts
  options_en JSONB DEFAULT '[]',
  correct_answer INTEGER DEFAULT 0, -- index of correct option (0-3)
  explanation_id TEXT,
  explanation_en TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_sub_bab ON sub_bab_quiz(bab_id, sub_bab_key);
CREATE INDEX IF NOT EXISTS idx_quiz_reflection ON sub_bab_quiz(bab_id, is_reflection);

-- 5. UPDATE TABEL PROGRESS (tambah sub-bab completion tracking)
-- Cek apakah tabel progress sudah ada, kalau belum buat
CREATE TABLE IF NOT EXISTS progress (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  bab_id TEXT NOT NULL,
  quizzes INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  subs JSONB DEFAULT '{}', -- {"sub.sel1": {"done": true, "quiz_score": 80}, ...}
  reflection_done BOOLEAN DEFAULT FALSE, -- quiz refleksi selesai
  reflection_score INTEGER DEFAULT 0, -- score quiz refleksi
  completion_pct REAL DEFAULT 0, -- persentase penyelesaian (0-100)
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bab_id)
);

-- 6. TABEL SETTINGS (untuk theme presets)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default theme presets
INSERT INTO site_settings (key, value) VALUES
  ('theme_presets', '[
    {"name": "Ungu", "primary": "#6c5ce7", "secondary": "#a29bfe", "bg": "#f5f3ff"},
    {"name": "Hijau", "primary": "#00b894", "secondary": "#55efc4", "bg": "#f0fdf4"},
    {"name": "Biru", "primary": "#0984e3", "secondary": "#74b9ff", "bg": "#eff6ff"},
    {"name": "Merah", "primary": "#d63031", "secondary": "#ff7675", "bg": "#fef2f2"},
    {"name": "Orange", "primary": "#e17055", "secondary": "#fab1a0", "bg": "#fff7ed"}
  ]'::jsonb),
  ('active_theme', '{"preset": "Ungu"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 7. SETUP STORAGE BUCKET
-- Jalankan di Supabase Dashboard > Storage > New Bucket
-- Bucket name: biolearn-assets
-- Public: yes
-- Atau jalankan SQL ini:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('biolearn-assets', 'biolearn-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow authenticated uploads
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'biolearn-assets');

CREATE POLICY IF NOT EXISTS "Allow public reads" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'biolearn-assets');

CREATE POLICY IF NOT EXISTS "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'biolearn-assets');
