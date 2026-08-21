import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

const TABLES = [
  'bab', 'materi', 'progress', 'kelas',
  'sub_bab', 'sub_bab_quiz', 'struktur_fungsi', 'site_settings',
];

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = getDb();
    const backup: Record<string, unknown[]> = {};

    for (const table of TABLES) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        backup[table] = { error: error.message } as unknown as never[];
      } else {
        backup[table] = data ?? [];
      }
    }

    const { data: users, error: usersErr } = await supabase
      .from("users")
      .select("id, name, email, role, email_verified, created_at");
    if (usersErr) {
      backup["users"] = { error: usersErr.message } as unknown as never[];
    } else {
      backup["users"] = users ?? [];
    }

    return NextResponse.json({
      version: '1.0',
      exported_at: new Date().toISOString(),
      tables: backup,
    });
  } catch (e) {
    console.error("[API Backup GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
