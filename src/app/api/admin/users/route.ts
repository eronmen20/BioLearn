import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

// GET - List all users with optional role filter
export async function GET(req: NextRequest) {
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
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
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
  try {
    const supabase = getDb();
    const { id, role, name } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID user wajib diisi" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (role) updates.role = role;
    if (name) updates.name = name;

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
