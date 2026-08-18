-- Patch data progress lama: tambahkan field 'questions' ke setiap sub di subs JSON
-- berdasarkan jumlah soal asli dari tabel sub_bab_quiz.

-- 1. Tambah kolom reflection_questions jika belum ada
ALTER TABLE progress ADD COLUMN IF NOT EXISTS reflection_questions INTEGER DEFAULT 0;

-- 2. Hitung jumlah soal per (bab_id, sub_bab_key) dari sub_bab_quiz
WITH quiz_counts AS (
  SELECT
    bab_id,
    sub_bab_key,
    COUNT(*) AS q_count
  FROM sub_bab_quiz
  WHERE sub_bab_key IS NOT NULL
  GROUP BY bab_id, sub_bab_key
),

-- 3. Rebuild subs JSON: tambahkan "questions" ke setiap entry
updated_subs AS (
  SELECT
    p.id,
    (
      SELECT jsonb_object_agg(
        sk,
        sv || jsonb_build_object('questions', COALESCE(qc.q_count, 100))
      )
      FROM jsonb_each(p.subs) AS sub(sk, sv)
      LEFT JOIN quiz_counts qc
        ON qc.bab_id = p.bab_id AND qc.sub_bab_key = sk
    ) AS new_subs
  FROM progress p
  WHERE p.subs IS NOT NULL AND p.subs != '{}'::jsonb
)

-- 4. Tulis hasil patch
UPDATE progress p
SET subs = us.new_subs
FROM updated_subs us
WHERE p.id = us.id;

-- 5. Patch reflection_questions dari jumlah soal refleksi
WITH reflection_counts AS (
  SELECT
    bab_id,
    COUNT(*) AS r_count
  FROM sub_bab_quiz
  WHERE is_reflection = TRUE
  GROUP BY bab_id
)
UPDATE progress p
SET reflection_questions = COALESCE(rc.r_count, 100)
FROM reflection_counts rc
WHERE rc.bab_id = p.bab_id;
