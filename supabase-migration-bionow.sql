-- Migrasi: BioNow — konten isu/fenomena dunia nyata yang terhubung ke materi
-- Setiap post: ringkasan + penjelasan ilmiah (HTML) + infografis + tautan ke
-- materi lengkap (bab_id + sub_bab_key, dipakai deep link ?sub=).
-- Jalankan di Supabase SQL Editor. Aman dijalankan berulang.

CREATE TABLE IF NOT EXISTS public.bionow_posts (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  badge TEXT DEFAULT 'Isu Terkini',
  title_id TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  summary_id TEXT NOT NULL DEFAULT '',
  summary_en TEXT NOT NULL DEFAULT '',
  body_id TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  infographic_url TEXT NOT NULL DEFAULT '',
  infographic_caption_id TEXT NOT NULL DEFAULT '',
  infographic_caption_en TEXT NOT NULL DEFAULT '',
  bab_id TEXT,
  sub_bab_key TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bionow_slug ON public.bionow_posts(slug);
CREATE INDEX IF NOT EXISTS idx_bionow_published ON public.bionow_posts(published, sort_order);

ALTER TABLE public.bionow_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bionow_public_read" ON public.bionow_posts;
CREATE POLICY "bionow_public_read" ON public.bionow_posts
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "bionow_admin_insert" ON public.bionow_posts;
CREATE POLICY "bionow_admin_insert" ON public.bionow_posts
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "bionow_admin_update" ON public.bionow_posts;
CREATE POLICY "bionow_admin_update" ON public.bionow_posts
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "bionow_admin_delete" ON public.bionow_posts;
CREATE POLICY "bionow_admin_delete" ON public.bionow_posts
  FOR DELETE USING (public.is_admin());
