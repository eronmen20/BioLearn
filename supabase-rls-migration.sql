-- =============================================================
-- BioLearn RLS (Row Level Security) Migration
-- Run in Supabase SQL Editor
--
-- NOTE: This app uses custom HMAC tokens, NOT Supabase Auth.
-- Service role key (used by all API routes) always bypasses RLS.
-- RLS provides defense-in-depth: if anon key leaks, attacker
-- can only READ public data, never WRITE/DELETE/UPDATE.
-- =============================================================

-- =============================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =============================================================
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bab ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE praktikum ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE struktur_fungsi ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_bab ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_bab_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- HELPER: Check if current user is admin
-- (uses auth.uid() to match users table)
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()::text AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================
-- 2. ANNOUNCEMENTS
--    Public: read published only
--    Admin: full access
-- =============================================================
DROP POLICY IF EXISTS "announcements_public_read" ON announcements;
CREATE POLICY "announcements_public_read" ON announcements
  FOR SELECT USING (
    status = 'published'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "announcements_admin_insert" ON announcements;
CREATE POLICY "announcements_admin_insert" ON announcements
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "announcements_admin_update" ON announcements;
CREATE POLICY "announcements_admin_update" ON announcements
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "announcements_admin_delete" ON announcements;
CREATE POLICY "announcements_admin_delete" ON announcements
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 3. BAB (Chapters)
--    Public: read all (not archived)
--    Admin: full access
-- =============================================================
DROP POLICY IF EXISTS "bab_public_read" ON bab;
CREATE POLICY "bab_public_read" ON bab
  FOR SELECT USING (
    is_archived = false
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "bab_admin_insert" ON bab;
CREATE POLICY "bab_admin_insert" ON bab
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "bab_admin_update" ON bab;
CREATE POLICY "bab_admin_update" ON bab
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "bab_admin_delete" ON bab;
CREATE POLICY "bab_admin_delete" ON bab
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 4. KELAS (Classes)
--    Public: read all
--    Admin: full access
-- =============================================================
DROP POLICY IF EXISTS "kelas_public_read" ON kelas;
CREATE POLICY "kelas_public_read" ON kelas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "kelas_admin_insert" ON kelas;
CREATE POLICY "kelas_admin_insert" ON kelas
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "kelas_admin_update" ON kelas;
CREATE POLICY "kelas_admin_update" ON kelas
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "kelas_admin_delete" ON kelas;
CREATE POLICY "kelas_admin_delete" ON kelas
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 5. MATERI (Content)
--    Public: read all
--    Admin: full access
-- =============================================================
DROP POLICY IF EXISTS "materi_public_read" ON materi;
CREATE POLICY "materi_public_read" ON materi
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "materi_admin_insert" ON materi;
CREATE POLICY "materi_admin_insert" ON materi
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "materi_admin_update" ON materi;
CREATE POLICY "materi_admin_update" ON materi
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "materi_admin_delete" ON materi;
CREATE POLICY "materi_admin_delete" ON materi
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 6. PRAKTIKUM (Labs)
--    Public: read all
--    Admin: full access
-- =============================================================
DROP POLICY IF EXISTS "praktikum_public_read" ON praktikum;
CREATE POLICY "praktikum_public_read" ON praktikum
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "praktikum_admin_insert" ON praktikum;
CREATE POLICY "praktikum_admin_insert" ON praktikum
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "praktikum_admin_update" ON praktikum;
CREATE POLICY "praktikum_admin_update" ON praktikum
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "praktikum_admin_delete" ON praktikum;
CREATE POLICY "praktikum_admin_delete" ON praktikum
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 7. PROGRESS (User learning progress)
--    Users: read/write own data only
--    Admin: full access
-- =============================================================
DROP POLICY IF EXISTS "progress_user_read" ON progress;
CREATE POLICY "progress_user_read" ON progress
  FOR SELECT USING (
    user_id = auth.uid()::text
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "progress_user_upsert" ON progress;
CREATE POLICY "progress_user_upsert" ON progress
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::text
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "progress_user_update" ON progress;
CREATE POLICY "progress_user_update" ON progress
  FOR UPDATE USING (
    user_id = auth.uid()::text
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "progress_admin_delete" ON progress;
CREATE POLICY "progress_admin_delete" ON progress
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 8. SITE_SETTINGS
--    Public: read all
--    Admin: write
-- =============================================================
DROP POLICY IF EXISTS "site_settings_public_read" ON site_settings;
CREATE POLICY "site_settings_public_read" ON site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_admin_insert" ON site_settings;
CREATE POLICY "site_settings_admin_insert" ON site_settings
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_settings_admin_update" ON site_settings;
CREATE POLICY "site_settings_admin_update" ON site_settings
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "site_settings_admin_delete" ON site_settings;
CREATE POLICY "site_settings_admin_delete" ON site_settings
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 9. STRUKTUR_FUNGSI (Flashcards)
--    Public: read all
--    Admin: full access
-- =============================================================
DROP POLICY IF EXISTS "struktur_fungsi_public_read" ON struktur_fungsi;
CREATE POLICY "struktur_fungsi_public_read" ON struktur_fungsi
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "struktur_fungsi_admin_insert" ON struktur_fungsi;
CREATE POLICY "struktur_fungsi_admin_insert" ON struktur_fungsi
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "struktur_fungsi_admin_update" ON struktur_fungsi;
CREATE POLICY "struktur_fungsi_admin_update" ON struktur_fungsi
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "struktur_fungsi_admin_delete" ON struktur_fungsi;
CREATE POLICY "struktur_fungsi_admin_delete" ON struktur_fungsi
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 10. SUB_BAB (Sub-chapters)
--     Public: read all
--     Admin: full access
-- =============================================================
DROP POLICY IF EXISTS "sub_bab_public_read" ON sub_bab;
CREATE POLICY "sub_bab_public_read" ON sub_bab
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "sub_bab_admin_insert" ON sub_bab;
CREATE POLICY "sub_bab_admin_insert" ON sub_bab
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "sub_bab_admin_update" ON sub_bab;
CREATE POLICY "sub_bab_admin_update" ON sub_bab
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "sub_bab_admin_delete" ON sub_bab;
CREATE POLICY "sub_bab_admin_delete" ON sub_bab
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 11. SUB_BAB_QUIZ (Quizzes)
--     Public: read all
--     Admin: full access
-- =============================================================
DROP POLICY IF EXISTS "sub_bab_quiz_public_read" ON sub_bab_quiz;
CREATE POLICY "sub_bab_quiz_public_read" ON sub_bab_quiz
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "sub_bab_quiz_admin_insert" ON sub_bab_quiz;
CREATE POLICY "sub_bab_quiz_admin_insert" ON sub_bab_quiz
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "sub_bab_quiz_admin_update" ON sub_bab_quiz;
CREATE POLICY "sub_bab_quiz_admin_update" ON sub_bab_quiz
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "sub_bab_quiz_admin_delete" ON sub_bab_quiz;
CREATE POLICY "sub_bab_quiz_admin_delete" ON sub_bab_quiz
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 12. USERS
--     Users: read own profile (no password)
--     Admin: full access
--     NOTE: password column is still accessible via service role
-- =============================================================
DROP POLICY IF EXISTS "users_own_read" ON users;
CREATE POLICY "users_own_read" ON users
  FOR SELECT USING (
    id = auth.uid()::text
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "users_admin_insert" ON users;
CREATE POLICY "users_admin_insert" ON users
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users_admin_update" ON users;
CREATE POLICY "users_admin_update" ON users
  FOR UPDATE USING (
    id = auth.uid()::text
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "users_admin_delete" ON users;
CREATE POLICY "users_admin_delete" ON users
  FOR DELETE USING (public.is_admin());

-- =============================================================
-- 13. VERIFICATION_CODES
--     No public access (server-only via service role)
-- =============================================================
DROP POLICY IF EXISTS "verification_codes_no_public" ON verification_codes;
CREATE POLICY "verification_codes_no_public" ON verification_codes
  FOR ALL USING (false);

-- =============================================================
-- 14. ACTIVITY_LOGS
--     No public access (admin-only via service role)
-- =============================================================
DROP POLICY IF EXISTS "activity_logs_no_public" ON activity_logs;
CREATE POLICY "activity_logs_no_public" ON activity_logs
  FOR ALL USING (false);
