-- BioLearn: Schema untuk tabel bab dan materi
-- Jalankan di Supabase SQL Editor

-- Tabel Bab
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

-- Tabel Materi (terhubung ke bab)
CREATE TABLE IF NOT EXISTS materi (
  id BIGSERIAL PRIMARY KEY,
  bab_id TEXT NOT NULL REFERENCES bab(id) ON DELETE CASCADE,
  sub_bab_key TEXT,
  type TEXT DEFAULT 'html', -- html, video, animation, image, quiz
  content_id TEXT,
  content_en TEXT,
  summary_id TEXT,
  summary_en TEXT,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_materi_bab_id ON materi(bab_id);
CREATE INDEX IF NOT EXISTS idx_materi_sub_bab_key ON materi(sub_bab_key);
CREATE INDEX IF NOT EXISTS idx_materi_type ON materi(type);

-- Insert data awal bab dari bab-data.ts (jika belum ada)
INSERT INTO bab (id, icon, color, video_id, video_title_id, video_title_en, hotspotted) VALUES
  ('sel', '🔬', '#6c5ce7', 't8zUakMdYlc', 'Struktur dan Fungsi Sel — IPA Biologi', 'Cell Structure and Function — Biology', 'sel'),
  ('pencernaan', '🍽️', '#00b894', 'iDf0BpBVh5c', 'Sistem Pencernaan Manusia', 'Human Digestive System', 'pencernaan'),
  ('ekosistem', '🌿', '#00cec9', 'O4fYikSF3do', 'Ekologi & Ekosistem', 'Ecology & Ecosystem', 'ekosistem'),
  ('genetika', '🧬', '#e17055', NULL, 'Genetika & Pewarisan Sifat', 'Genetics & Heredity', 'genetika'),
  ('evolusi', '🦎', '#fdcb6e', NULL, 'Evolusi Makhluk Hidup', 'Evolution of Living Things', 'evolusi'),
  ('tumbuhan', '🌱', '#55a3f5', NULL, 'Struktur & Fungsi Tumbuhan', 'Plant Structure & Function', 'tumbuhan'),
  ('manusia', '🫀', '#ff7675', NULL, 'Sistem Organ Manusia', 'Human Organ Systems', 'manusia'),
  ('virus', '🦠', '#a29bfe', NULL, 'Virus & Mikroorganisme', 'Viruses & Microorganisms', 'virus')
ON CONFLICT (id) DO NOTHING;

-- RLS (Row Level Security) — opsional, aktifkan jika perlu
-- ALTER TABLE bab ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE materi ENABLE ROW LEVEL SECURITY;

-- Policy untuk service role (admin bisa semua)
-- CREATE POLICY "Admin full access on bab" ON bab FOR ALL USING (true);
-- CREATE POLICY "Admin full access on materi" ON materi FOR ALL USING (true);
