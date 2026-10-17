import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/admin-guard";
import { isValidUserRole } from "@/lib/user-roles";

function sanitizeSearch(s: string): string {
  return s.replace(/[%()]/g, "").replace(/[*,]/g, " ");
}

// GET - List all users with optional role filter
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("users")
      .select("id, name, email, role, email_verified, created_at", { count: "exact" });

    if (role) {
      query = query.eq("role", role);
    }

    if (search) {
      const safeSearch = sanitizeSearch(search);
      query = query.or(`name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      users: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (e) {
    console.error("[Admin Users GET]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user role
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = getDb();
    const { id, role, name } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID user wajib diisi" }, { status: 400 });
    }

    // Whitelist the role — previously any attacker-controlled string could
    // become a "role" via mass assignment, and an admin could typo/lock
    // themselves (and every admin) out of /admin entirely.
    const updates: Record<string, unknown> = {};
    if (role !== undefined) {
      if (!isValidUserRole(role)) {
        return NextResponse.json({ error: "Role tidak valid. Gunakan 'user' atau 'admin'." }, { status: 400 });
      }
      updates.role = role;
    }
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim() || name.length > 100) {
        return NextResponse.json({ error: "Nama tidak valid" }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
    }

    // Guard-rail: an admin cannot lock every admin out by demoting the last
    // remaining one.
    if (updates.role === "user") {
      const { count } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        return NextResponse.json({ error: "Minimal harus ada 1 admin" }, { status: 400 });
      }
    }

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "update",
      target_type: "users",
      target_id: id,
      detail: { role, name },
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Admin Users PUT]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID user wajib diisi" }, { status: 400 });
    }

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "delete",
      target_type: "users",
      target_id: id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Admin Users DELETE]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
