-- FIX: Tambah kolom yang hilang di tabel sub_bab
-- Jalankan di Supabase SQL Editor
-- =============================================

ALTER TABLE sub_bab ADD COLUMN IF NOT EXISTS summary_id TEXT;
ALTER TABLE sub_bab ADD COLUMN IF NOT EXISTS summary_en TEXT;
ALTER TABLE sub_bab ADD COLUMN IF NOT EXISTS content_id TEXT;
ALTER TABLE sub_bab ADD COLUMN IF NOT EXISTS content_en TEXT;
ALTER TABLE sub_bab ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE sub_bab ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE sub_bab ADD COLUMN IF NOT EXISTS animation_url TEXT;
ALTER TABLE sub_bab ADD COLUMN IF NOT EXISTS animation_type TEXT;

-- Verifikasi: cek kolom tabel sub_bab
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sub_bab' 
ORDER BY ordinal_position;
