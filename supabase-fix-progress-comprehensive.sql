-- Fix progress: clamp score, handle key mismatch, recompute correct/total
-- Jalankan sekali saja di Supabase SQL Editor

-- 1. Clamp semua score di subs JSON ke 0-100
UPDATE progress
SET subs = (
  SELECT jsonb_object_agg(
    key,
    value - 'score' || jsonb_build_object(
      'score', LEAST(100, GREATEST(0, (value->>'score')::int))
    )
  )
  FROM jsonb_each(progress.subs) AS sub(key, value)
  WHERE (value->>'score')::int > 100 OR (value->>'score')::int < 0
)
WHERE EXISTS (
  SELECT 1 FROM jsonb_each(progress.subs) AS sub(key, value)
  WHERE (value->>'score')::int > 100 OR (value->>'score')::int < 0
);

-- 2. Patch questions: match by NORMALIZED key (lowercase, spasi→titik)
WITH quiz_counts AS (
  SELECT
    bab_id,
    sub_bab_key,
    COUNT(*) AS q_count
  FROM sub_bab_quiz
  WHERE sub_bab_key IS NOT NULL AND is_reflection = FALSE
  GROUP BY bab_id, sub_bab_key
),
normalized_counts AS (
  SELECT
    bab_id,
    LOWER(REPLACE(sub_bab_key, ' ', '.')) AS norm_key,
    q_count
  FROM quiz_counts
),
updated_subs AS (
  SELECT
    p.id,
    (
      SELECT jsonb_object_agg(
        sk,
        CASE
          WHEN (sv->>'questions')::int > 0 AND (sv->>'questions')::int != 100
          THEN sv  -- sudah ada questions valid, skip
          ELSE sv - 'questions' || jsonb_build_object(
            'questions',
            COALESCE(
              (SELECT nc.q_count FROM normalized_counts nc
               WHERE nc.bab_id = p.bab_id AND nc.norm_key = LOWER(REPLACE(sk, ' ', '.')) LIMIT 1),
              (SELECT nc.q_count FROM normalized_counts nc
               WHERE nc.bab_id = p.bab_id LIMIT 1),
              5
            )
          )
        END
      )
      FROM jsonb_each(p.subs) AS sub(sk, sv)
    ) AS new_subs
  FROM progress p
  WHERE p.subs IS NOT NULL AND p.subs != '{}'::jsonb
)
UPDATE progress p
SET subs = us.new_subs
FROM updated_subs us
WHERE p.id = us.id;

-- 3. Patch reflection_questions
WITH reflection_counts AS (
  SELECT bab_id, COUNT(*) AS r_count
  FROM sub_bab_quiz
  WHERE is_reflection = TRUE
  GROUP BY bab_id
)
UPDATE progress p
SET reflection_questions = COALESCE(rc.r_count, 5)
FROM reflection_counts rc
WHERE rc.bab_id = p.bab_id;

-- 4. Recompute correct/total dari data yang sudah bersih
UPDATE progress p SET
  correct = (
    SELECT COALESCE(SUM(
      ROUND(((sv->>'score')::int / 100.0) * (sv->>'questions')::int)
    ), 0)
    FROM jsonb_each(p.subs) AS sub(sk, sv)
  ),
  total = (
    SELECT COALESCE(SUM((sv->>'questions')::int), 0)
    FROM jsonb_each(p.subs) AS sub(sk, sv)
  )
WHERE p.subs IS NOT NULL AND p.subs != '{}'::jsonb;

-- 5. Tambah reflection ke correct/total jika done
UPDATE progress p SET
  correct = p.correct + ROUND((p.reflection_score / 100.0) * COALESCE(p.reflection_questions, 5)),
  total = p.total + COALESCE(p.reflection_questions, 5)
WHERE p.reflection_done = TRUE;
