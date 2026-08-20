-- 1. TABEL BANNER
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  judul TEXT NOT NULL,
  deskripsi TEXT DEFAULT '',
  posisi TEXT DEFAULT 'hero',      -- hero | sidebar | footer
  status TEXT DEFAULT 'aktif',     -- aktif | nonaktif
  image_url TEXT,
  link_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banner_status ON banners(status);