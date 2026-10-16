-- Migrasi: hook "Kenapa penting?" per sub-bab
-- Tujuan: setiap sub-bab bisa dibuka dengan 1-2 kalimat hook yang mengaitkan
-- materi ke isu nyata / manfaat (mis. "Di bagian sel mana antibiotik menyerang?").
-- NULL/kosong = tidak tampil (kompatibel dengan data lama).
-- Jalankan di Supabase SQL Editor. Aman dijalankan berulang (IF NOT EXISTS).

ALTER TABLE public.sub_bab
  ADD COLUMN IF NOT EXISTS hook_id TEXT;
ALTER TABLE public.sub_bab
  ADD COLUMN IF NOT EXISTS hook_en TEXT;
