import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

function parseSubs(raw: unknown): Record<string, { done?: boolean; score?: number; attempts?: number; questions?: number }> {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return (raw as Record<string, never>) || {};
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();

    // Users (for nama)
    const { data: users } = await supabase
      .from("users")
      .select("id, name, email, role")
      .order("created_at", { ascending: false });

    // Progress records
    const { data: progressRows } = await supabase
      .from("progress")
      .select("*")
      .order("updated_at", { ascending: false });

    // Bab titles
    const { data: babs } = await supabase
      .from("bab")
      .select("id, video_title_id, video_title_en");

    const userMap = new Map<string, { name: string }>();
    for (const u of users || []) {
      const nameEntry = { name: u.name || "Tanpa Nama" };
      // progress.user_id stores the user's id (UUID); some legacy rows store email
      userMap.set((u.id || "").toLowerCase(), nameEntry);
      userMap.set((u.email || "").toLowerCase(), nameEntry);
    }
    const babMap = new Map<string, string>();
    for (const b of babs || []) {
      babMap.set(b.id, b.video_title_id || b.video_title_en || b.id);
    }

    const nilai: any[] = [];
    const progress: any[] = [];
    const riwayat: any[] = [];

    for (const row of progressRows || []) {
      const key = (row.user_id || "").toLowerCase();
      const nama = userMap.get(key)?.name || row.user_id || "Tanpa Nama";
      const babTitle = babMap.get(row.bab_id) || row.bab_id;
      const subs = parseSubs(row.subs);
      const updatedAt = row.updated_at
        ? new Date(row.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
        : "—";

      // Nilai: one row per sub quiz inside subs
      for (const [subKey, sub] of Object.entries(subs)) {
        const score = Math.max(0, Math.min(100, Number(sub?.score) || 0));
        const questions = Math.max(1, Number(sub?.questions) || 1);
        const correct = Math.round((score / 100) * questions);
        const quizTitle = subKey.replace(/\b\w/g, (c) => c.toUpperCase());
        nilai.push({
          id: `${row.id}-${subKey}`,
          nama,
          email: row.user_id,
          kelas: "—",
          quiz: quizTitle,
          nilai: score,
          tanggal: updatedAt,
          status: score >= 80 ? "Lulus" : "Tidak Lulus",
        });
        riwayat.push({
          id: `${row.id}-${subKey}`,
          nama,
          email: row.user_id,
          kelas: "—",
          quiz: quizTitle,
          skor: correct,
          jumlah_soal: questions,
          waktu_pengerjaan: `${Math.max(1, Number(sub?.attempts) || 1)}x`,
          tanggal: updatedAt,
        });
      }

      const total = Math.max(1, Number(row.total) || 0);
      const correct = Math.max(0, Math.min(total, Number(row.correct) || 0));
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const pctStored = Math.max(0, Math.min(100, Number(row.completion_pct) || 0));
      const displayPct = pct > 0 ? pct : pctStored;
      const status = displayPct >= 100 ? "Selesai" : displayPct > 0 ? "Sedang Belajar" : "Belum Mulai";
      progress.push({
        id: row.id,
        nama,
        email: row.user_id,
        kelas: "—",
        materi: babTitle,
        progress: displayPct,
        terakhir_akses: updatedAt,
        status,
      });
    }

    return NextResponse.json({
      nilai,
      progress,
      riwayat,
      stats: {
        nilai: {
          total: nilai.length,
          avg: nilai.length ? Math.round(nilai.reduce((s, r) => s + r.nilai, 0) / nilai.length) : 0,
          highest: nilai.length ? Math.max(...nilai.map((r) => r.nilai)) : 0,
          lowest: nilai.length ? Math.min(...nilai.map((r) => r.nilai)) : 0,
        },
        progress: {
          activeStudents: new Set(progressRows?.map((r) => r.user_id) || []).size,
          avgProgress: progress.length ? Math.round(progress.reduce((s, r) => s + r.progress, 0) / progress.length) : 0,
          completedItems: progress.filter((r) => r.status === "Selesai").length,
        },
        riwayat: {
          total: riwayat.length,
          lulus: riwayat.filter((r) => (r.skor / r.jumlah_soal) * 100 >= 80).length,
          gagal: riwayat.filter((r) => (r.skor / r.jumlah_soal) * 100 < 80).length,
        },
      },
    });
  } catch (e) {
    console.error("[Admin Learning]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}