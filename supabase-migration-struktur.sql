-- Struktur & Fungsi: Interactive anatomy diagrams with flashcards
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS struktur_fungsi (
  id BIGSERIAL PRIMARY KEY,
  bab_id TEXT NOT NULL REFERENCES bab(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  image_url TEXT,
  image_alt TEXT,
  flashcards JSONB DEFAULT '[]',
  -- Format flashcards: [{ "name": "...", "name_en": "...", "description": "...", "description_en": "...", "x": 50, "y": 50 }]
  -- x, y = posisi titik pada gambar (persentase 0-100)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_struktur_bab_id ON struktur_fungsi(bab_id);
