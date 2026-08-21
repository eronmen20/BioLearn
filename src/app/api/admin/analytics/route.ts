import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const supabase = getDb();

    // Users data
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: totalSiswa } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "user");

    const { count: totalGuru } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "guru");

    const { count: totalAdmin } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: usersToday } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Users per month (last 6 months)
    const { data: allUsers } = await supabase
      .from("users")
      .select("created_at, role");

    const monthCounts: Record<string, number> = {};
    const roleCounts: Record<string, number> = {};
    const monthLabels = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d;
    });
    const labelMap = new Map<string, number>();
    monthLabels.forEach((d, i) =>
      labelMap.set(`${d.getFullYear()}-${d.getMonth()}`, i)
    );
    const registrationData = monthLabels.map(() => ({ label: "", value: 0 }));
    const locale = "id-ID";

    for (const u of allUsers || []) {
      const date = new Date(u.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const idx = labelMap.get(key);
      if (idx !== undefined) registrationData[idx].value++;
      else if (date.getTime() > monthLabels[monthLabels.length - 1].getTime()) {
        registrationData[monthLabels.length - 1].value++;
      }
      const roleLabel = u.role === "admin" ? "Admin" : u.role === "guru" ? "Guru" : "Siswa";
      roleCounts[roleLabel] = (roleCounts[roleLabel] || 0) + 1;
    }
    monthLabels.forEach((d, i) => {
      registrationData[i].label = d.toLocaleDateString(locale, { month: "short" });
    });
    const roleDistribution = Object.entries(roleCounts).map(([label, value]) => ({ label, value }));

    // Quiz data
    const { count: totalQuiz } = await supabase
      .from("sub_bab_quiz")
      .select("*", { count: "exact", head: true });

    const { count: totalReflection } = await supabase
      .from("sub_bab_quiz")
      .select("*", { count: "exact", head: true })
      .eq("is_reflection", true);

    const { count: totalProgress } = await supabase
      .from("progress")
      .select("*", { count: "exact", head: true });

    const { data: progressRows } = await supabase
      .from("progress")
      .select("correct, total, completion_pct");

    let lulus = 0;
    let gagal = 0;
    for (const p of progressRows || []) {
      const total = Math.max(0, Number(p.total) || 0);
      const correct = Math.max(0, Math.min(total, Number(p.correct) || 0));
      if (total > 0 && correct / total >= 0.8) lulus++;
      else if (total > 0) gagal++;
    }
    const scoreBins = {
      "0-59": 0,
      "60-79": 0,
      "80-100": 0,
    };
    for (const p of progressRows || []) {
      const total = Math.max(0, Number(p.total) || 0);
      const correct = Math.max(0, Math.min(total, Number(p.correct) || 0));
      if (total <= 0) continue;
      const pct = (correct / total) * 100;
      if (pct >= 80) scoreBins["80-100"]++;
      else if (pct >= 60) scoreBins["60-79"]++;
      else scoreBins["0-59"]++;
    }

    // Materi data
    const { count: totalMateri } = await supabase
      .from("sub_bab")
      .select("*", { count: "exact", head: true });

    const { count: totalBab } = await supabase
      .from("bab")
      .select("*", { count: "exact", head: true });

    // Sub-bab count per bab (content distribution)
    const { data: subBabAll } = await supabase.from("sub_bab").select("bab_id");

    const babContentMap = new Map<string, number>();
    for (const s of subBabAll || []) {
      babContentMap.set(s.bab_id, (babContentMap.get(s.bab_id) || 0) + 1);
    }

    const { data: babContentRows } = await supabase
      .from("bab")
      .select("id, title_id");

    const babDistribution = (babContentRows || []).map((b) => ({
      label: b.title_id || b.id,
      value: babContentMap.get(b.id) || 0,
    }));

    // Bab-wise progress (map bab_id -> avg completion)
    const { data: babRows } = await supabase.from("bab").select("id, video_title_id");
    const { data: progressForBab } = await supabase
      .from("progress")
      .select("bab_id, completion_pct");

    const babProgressMap = new Map<string, { sum: number; count: number }>();
    for (const p of progressForBab || []) {
      const cur = babProgressMap.get(p.bab_id) || { sum: 0, count: 0 };
      cur.sum += Number(p.completion_pct) || 0;
      cur.count++;
      babProgressMap.set(p.bab_id, cur);
    }
    const materiProgress = (babRows || [])
      .map((b) => {
        const agg = babProgressMap.get(b.id);
        return {
          label: b.video_title_id || b.id,
          value: agg?.count ? Math.round(agg.sum / agg.count) : 0,
        };
      })
      .filter((m) => m.value > 0);

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        siswa: totalSiswa || 0,
        guru: totalGuru || 0,
        admin: totalAdmin || 0,
        today: usersToday || 0,
        registrationData,
        roleDistribution,
      },
      quiz: {
        totalQuestions: totalQuiz || 0,
        totalReflection: totalReflection || 0,
        totalAttempted: totalProgress || 0,
        lulus,
        gagal,
        scoreBins: Object.entries(scoreBins).map(([label, value]) => ({ label, value })),
      },
      materi: {
        totalMateri: totalMateri || 0,
        totalBab: totalBab || 0,
        totalProgress: totalProgress || 0,
        materiProgress,
        babDistribution,
      },
      traffic: {
        totalUsers: totalUsers || 0,
        usersToday: usersToday || 0,
        totalProgress: totalProgress || 0,
        totalQuiz: totalQuiz || 0,
      },
    });
  } catch (e) {
    console.error("[Admin Analytics]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}