import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();

    // Get total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get users by role
    const { count: totalSiswa } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "user");

    const { count: totalAdmin } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    // Get total progress records (as proxy for learning activity)
    const { count: totalProgress } = await supabase
      .from("progress")
      .select("*", { count: "exact", head: true });

    // Get recent users (last 10)
    const { data: recentUsers } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get users registered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: usersToday } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalSiswa: totalSiswa || 0,
        totalAdmin: totalAdmin || 0,
        totalProgress: totalProgress || 0,
        usersToday: usersToday || 0,
        // These are from static data, not DB
        totalMateri: 0,
        totalQuiz: 0,
        totalFlashcard: 0,
        totalPraktikum: 0,
        totalAiRequest: 0,
      },
      recentUsers: recentUsers || [],
    });
  } catch (e) {
    console.error("[Admin Stats]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
