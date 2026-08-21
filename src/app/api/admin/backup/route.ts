import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const TABLES = [
  'bab', 'materi', 'users', 'progress', 'kelas',
  'sub_bab', 'sub_bab_quiz', 'struktur_fungsi', 'site_settings',
];

export async function GET() {
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
