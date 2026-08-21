import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/admin-guard";

// Helper: normalize sort_order for a bab (eliminate gaps and duplicates)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function normalizeSortOrder(supabase: any, table: string, babId: string) {
  const { data: rows } = await supabase
    .from(table)
    .select("id, sort_order")
    .eq("bab_id", babId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (!rows || rows.length === 0) return;

  for (let i = 0; i < rows.length; i++) {
    const expected = i + 1;
    if ((rows[i].sort_order as number) !== expected) {
      await supabase.from(table).update({ sort_order: expected }).eq("id", rows[i].id);
    }
  }
}

// GET - List materi (optionally filtered by bab_id)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    let query = supabase.from("materi").select("*").order("sort_order", { ascending: true });
    if (babId) query = query.eq("bab_id", babId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ materi: data || [] });
  } catch (e) {
    console.error("[API Materi GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create materi (auto-shift sort_order)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const body = await req.json();

    if (!body.bab_id) {
      return NextResponse.json({ error: "bab_id wajib diisi" }, { status: 400 });
    }

    const newSortOrder = body.sort_order || 0;

    // Normalize first to eliminate gaps/duplicates
    await normalizeSortOrder(supabase, "materi", body.bab_id);

    // Auto-shift: increment sort_order for all existing records in same bab where sort_order >= newSortOrder
    if (newSortOrder > 0) {
      const { data: toShift } = await supabase
        .from("materi")
        .select("id, sort_order")
        .eq("bab_id", body.bab_id)
        .gte("sort_order", newSortOrder)
        .order("sort_order", { ascending: false });

      if (toShift && toShift.length > 0) {
        for (const row of toShift) {
          await supabase
            .from("materi")
            .update({ sort_order: (row.sort_order as number) + 1 })
            .eq("id", row.id);
        }
      }
    }

    const { data, error } = await supabase.from("materi").insert({
      bab_id: body.bab_id,
      sub_bab_key: body.sub_bab_key || null,
      type: body.type || "html",
      content_id: body.content_id || "",
      content_en: body.content_en || "",
      summary_id: body.summary_id || "",
      summary_en: body.summary_en || "",
      sort_order: newSortOrder,
      metadata: body.metadata || {},
    }).select("id").single();

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "create",
      target_type: "materi",
      target_id: data?.id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API Materi POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update materi (auto-shift sort_order)
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID materi wajib diisi untuk update" }, { status: 400 });
    }

    // Auto-shift sort_order when it changes
    if (body.sort_order !== undefined && body.bab_id) {
      // Normalize first to eliminate gaps/duplicates
      await normalizeSortOrder(supabase, "materi", body.bab_id);

      const { data: current } = await supabase
        .from("materi")
        .select("sort_order, bab_id")
        .eq("id", body.id)
        .single();

      const oldSort = (current?.sort_order as number) || 0;
      const newSort = body.sort_order as number;
      const babId = (current?.bab_id as string) || body.bab_id;

      if (oldSort !== newSort && oldSort > 0 && newSort > 0) {
        if (newSort < oldSort) {
          // Moving UP: shift items between [newSort, oldSort-1] DOWN by +1
          const { data: toShift } = await supabase
            .from("materi")
            .select("id, sort_order")
            .eq("bab_id", babId)
            .gte("sort_order", newSort)
            .lt("sort_order", oldSort)
            .neq("id", body.id)
            .order("sort_order", { ascending: false });

          if (toShift) {
            for (const row of toShift) {
              await supabase
                .from("materi")
                .update({ sort_order: (row.sort_order as number) + 1 })
                .eq("id", row.id);
            }
          }
        } else {
          // Moving DOWN: shift items between [oldSort+1, newSort] UP by -1
          const { data: toShift } = await supabase
            .from("materi")
            .select("id, sort_order")
            .eq("bab_id", babId)
            .gt("sort_order", oldSort)
            .lte("sort_order", newSort)
            .neq("id", body.id)
            .order("sort_order", { ascending: true });

          if (toShift) {
            for (const row of toShift) {
              await supabase
                .from("materi")
                .update({ sort_order: (row.sort_order as number) - 1 })
                .eq("id", row.id);
            }
          }
        }
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (body.bab_id !== undefined) updateData.bab_id = body.bab_id;
    if (body.sub_bab_key !== undefined) updateData.sub_bab_key = body.sub_bab_key;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.content_id !== undefined) updateData.content_id = body.content_id;
    if (body.content_en !== undefined) updateData.content_en = body.content_en;
    if (body.summary_id !== undefined) updateData.summary_id = body.summary_id;
    if (body.summary_en !== undefined) updateData.summary_en = body.summary_en;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const { error } = await supabase
      .from("materi")
      .update(updateData)
      .eq("id", body.id);

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "update",
      target_type: "materi",
      target_id: body.id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Materi PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete materi
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("materi").delete().eq("id", id);
    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "delete",
      target_type: "materi",
      target_id: id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Materi DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
