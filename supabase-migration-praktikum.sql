-- BioLearn v3 Praktikum Enhancement Migration
-- 1. sub_bab_key (target per sub-bab, optional — null/empty applies to all sub-babs in this bab)
-- 2. image_url + image_alt (so praktikum can have a hero image like struktur_fungsi)
-- 3. flashcards JSONB array (same shape as struktur_fungsi for hotspot overlays)

ALTER TABLE praktikum
  ADD COLUMN IF NOT EXISTS sub_bab_key TEXT;

ALTER TABLE praktikum
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE praktikum
  ADD COLUMN IF NOT EXISTS image_alt TEXT;

ALTER TABLE praktikum
  ADD COLUMN IF NOT EXISTS flashcards JSONB DEFAULT '[]';
  -- format: [{"name": "...", "name_en": "...", "description": "...", "description_en": "...", "x": 50, "y": 50}]

-- Steps column: existing. We extend schema logically to support bilingual steps,
-- but to keep migration minimal we just ensure column exists. Steps format:
--   [{"step": 1, "instruction": "...", "instruction_en": "..."}, ...]
-- Component reads both keys with fallback.

CREATE INDEX IF NOT EXISTS idx_praktikum_bab_sub ON praktikum(bab_id, sub_bab_key);
CREATE INDEX IF NOT EXISTS idx_praktikum_status ON praktikum(status);
