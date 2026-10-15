-- Migrasi: tipe soal quiz (Pilihan Ganda & Benar/Salah)
-- Tujuan: kolom question_type menandai jenis soal per baris di sub_bab_quiz.
--   'single'     = Pilihan Ganda (default, kompatibel dengan semua data lama)
--   'true_false' = Benar / Salah (2 opsi)
-- Catatan: kode frontend & admin memperlakukan NULL/kolom-belum-ada sebagai
-- 'single', jadi migrasi ini aman dijalankan kapan saja.
-- Jalankan di Supabase SQL Editor. Aman dijalankan berulang (IF NOT EXISTS).

ALTER TABLE public.sub_bab_quiz
  ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'single';
