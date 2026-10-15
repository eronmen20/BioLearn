-- Migrasi: simpan pilihan jawaban Quiz Refleksi (hanya saat skor ≥80)
-- Tujuan: fitur "Review Soal" bisa menampilkan jawaban user (merah = jawabanmu,
-- hijau = jawaban yang tepat) walaupun halaman di-refresh / dibuka lagi,
-- dan tetap sinkron antar perangkat.
-- Jalankan di Supabase SQL Editor. Aman dijalankan berulang (IF NOT EXISTS).

ALTER TABLE public.progress
  ADD COLUMN IF NOT EXISTS reflection_answers jsonb;
