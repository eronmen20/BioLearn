import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

// Validate sub_bab key format — must be URL-safe identifier.
// No spaces, no &, no special chars except . _ -
// Examples: "sub.bakteri1", "sub.bakteri_karakteristik"
// Rejects: "Bakteri & Karakteristiknya", "sub bakteri 1", "bakteri@x"
function isValidSubBabKey(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  // Allow lowercase letters, digits, dot, underscore, hyphen
  // Max 80 chars to prevent abuse
  return /^[a-z0-9._-]{1,80}$/.test(key);
}

// Helper: normalize sort_order for a bab (eliminate gaps and duplicates)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function normalizeSortOrder(supabase: any, table: string, babId: string) {
  const { data: rows } = await supabase
    .from(table)
    .select("id, sort_order")
    .eq("bab_id", babId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true }); // tiebreak by id

  if (!rows || rows.length === 0) return;

  for (let i = 0; i < rows.length; i++) {
    const expected = i + 1;
    if ((rows[i].sort_order as number) !== expected) {
      await supabase.from(table).update({ sort_order: expected }).eq("id", rows[i].id);
    }
  }
}

// GET - List sub-bab (optionally filtered by bab_id)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    let query = supabase.from("sub_bab").select("*").order("sort_order", { ascending: true });
    if (babId) query = query.eq("bab_id", babId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ sub_bab: data || [] });
  } catch (e) {
    console.error("[API SubBab GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create sub-bab (auto-shift sort_order)
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.bab_id) {
      return NextResponse.json({ error: "bab_id wajib diisi" }, { status: 400 });
    }

    const newSortOrder = body.sort_order || 0;

    // Validate key format
    if (body.key && !isValidSubBabKey(body.key)) {
      return NextResponse.json(
        { error: `Key "${body.key}" tidak valid. Gunakan hanya huruf kecil, angka, titik, underscore, atau strip (contoh: sub.bakteri_karakteristik).` },
        { status: 400 }
      );
    }

    // Normalize first to eliminate gaps/duplicates
    await normalizeSortOrder(supabase, "sub_bab", body.bab_id);

    // Auto-shift: increment sort_order for all existing records in same bab where sort_order >= newSortOrder
    if (newSortOrder > 0) {
      const { data: toShift } = await supabase
        .from("sub_bab")
        .select("id, sort_order")
        .eq("bab_id", body.bab_id)
        .gte("sort_order", newSortOrder)
        .order("sort_order", { ascending: false }); // descending so we shift from end

      if (toShift && toShift.length > 0) {
        for (const row of toShift) {
          await supabase
            .from("sub_bab")
            .update({ sort_order: (row.sort_order as number) + 1 })
            .eq("id", row.id);
        }
      }
    }

    const { data, error } = await supabase
      .from("sub_bab")
      .insert({
        bab_id: body.bab_id,
        key: body.key || "",
        title_id: body.title_id || "",
        title_en: body.title_en || "",
        summary_id: body.summary_id || "",
        summary_en: body.summary_en || "",
        content_id: body.content_id || "",
        content_en: body.content_en || "",
        video_url: body.video_url || "",
        image_url: body.image_url || "",
        animation_url: body.animation_url || "",
        animation_type: body.animation_type || "",
        sort_order: newSortOrder,
      })
      .select("id")
      .single();

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "create",
      target_type: "sub_bab",
      target_id: data?.id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API SubBab POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update sub-bab (auto-shift sort_order + cascade key rename)
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID sub-bab wajib diisi" }, { status: 400 });
    }

    // Get current row to detect key change
    const { data: currentRow, error: currentError } = await supabase
      .from("sub_bab")
      .select("key, bab_id")
      .eq("id", body.id)
      .single();

    if (currentError) throw currentError;

    const oldKey = (currentRow?.key as string) || "";
    const newKey = body.key !== undefined ? body.key : oldKey;
    const babIdForCascade = (currentRow?.bab_id as string) || body.bab_id || "";

    // Detect key rename — needs cascade update
    const keyChanged =
      body.key !== undefined && body.key !== oldKey && oldKey !== "" && body.key !== "";

    // Validate new key format (whether changed or not, ensure stored value is valid)
    if (body.key !== undefined && body.key !== "" && !isValidSubBabKey(body.key)) {
      return NextResponse.json(
        { error: `Key "${body.key}" tidak valid. Gunakan hanya huruf kecil, angka, titik, underscore, atau strip (contoh: sub.bakteri_karakteristik).` },
        { status: 400 }
      );
    }

    // Cascade key rename: update sub_bab_quiz + materi rows that reference old key
    let cascadeQuizUpdated = 0;
    let cascadeMateriUpdated = 0;
    if (keyChanged && babIdForCascade) {
      // sub_bab_quiz
      const { data: quizRows, error: quizListError } = await supabase
        .from("sub_bab_quiz")
        .select("id")
        .eq("bab_id", babIdForCascade)
        .eq("sub_bab_key", oldKey);
      if (quizListError) throw quizListError;

      if (quizRows && quizRows.length > 0) {
        const { error: quizUpdateError, count: quizCount } = await supabase
          .from("sub_bab_quiz")
          .update({ sub_bab_key: newKey })
          .eq("bab_id", babIdForCascade)
          .eq("sub_bab_key", oldKey);
        if (quizUpdateError) throw quizUpdateError;
        cascadeQuizUpdated = quizRows.length;
        if (typeof quizCount === "number") cascadeQuizUpdated = quizCount;
      }

      // materi
      const { data: materiRows, error: materiListError } = await supabase
        .from("materi")
        .select("id")
        .eq("bab_id", babIdForCascade)
        .eq("sub_bab_key", oldKey);
      if (materiListError) throw materiListError;

      if (materiRows && materiRows.length > 0) {
        const { error: materiUpdateError, count: materiCount } = await supabase
          .from("materi")
          .update({ sub_bab_key: newKey })
          .eq("bab_id", babIdForCascade)
          .eq("sub_bab_key", oldKey);
        if (materiUpdateError) throw materiUpdateError;
        cascadeMateriUpdated = materiRows.length;
        if (typeof materiCount === "number") cascadeMateriUpdated = materiCount;
      }
    }

    // Auto-shift sort_order when it changes
    if (body.sort_order !== undefined && body.bab_id) {
      // Normalize first to eliminate gaps/duplicates
      await normalizeSortOrder(supabase, "sub_bab", body.bab_id);

      // Get current record's sort_order
      const { data: current } = await supabase
        .from("sub_bab")
        .select("sort_order, bab_id")
        .eq("id", body.id)
        .single();

      const oldSort = (current?.sort_order as number) || 0;
      const newSort = body.sort_order as number;
      const babId = current?.bab_id as string || body.bab_id;

      if (oldSort !== newSort && oldSort > 0 && newSort > 0) {
        if (newSort < oldSort) {
          // Moving UP: shift items between [newSort, oldSort-1] DOWN by +1
          const { data: toShift } = await supabase
            .from("sub_bab")
            .select("id, sort_order")
            .eq("bab_id", babId)
            .gte("sort_order", newSort)
            .lt("sort_order", oldSort)
            .neq("id", body.id)
            .order("sort_order", { ascending: false });

          if (toShift) {
            for (const row of toShift) {
              await supabase
                .from("sub_bab")
                .update({ sort_order: (row.sort_order as number) + 1 })
                .eq("id", row.id);
            }
          }
        } else {
          // Moving DOWN: shift items between [oldSort+1, newSort] UP by -1
          const { data: toShift } = await supabase
            .from("sub_bab")
            .select("id, sort_order")
            .eq("bab_id", babId)
            .gt("sort_order", oldSort)
            .lte("sort_order", newSort)
            .neq("id", body.id)
            .order("sort_order", { ascending: true });

          if (toShift) {
            for (const row of toShift) {
              await supabase
                .from("sub_bab")
                .update({ sort_order: (row.sort_order as number) - 1 })
                .eq("id", row.id);
            }
          }
        }
      }
    }

    const updateData: Record<string, unknown> = {};

    if (body.bab_id !== undefined) updateData.bab_id = body.bab_id;
    if (body.key !== undefined) updateData.key = body.key;
    if (body.title_id !== undefined) updateData.title_id = body.title_id;
    if (body.title_en !== undefined) updateData.title_en = body.title_en;
    if (body.summary_id !== undefined) updateData.summary_id = body.summary_id;
    if (body.summary_en !== undefined) updateData.summary_en = body.summary_en;
    if (body.content_id !== undefined) updateData.content_id = body.content_id;
    if (body.content_en !== undefined) updateData.content_en = body.content_en;
    if (body.video_url !== undefined) updateData.video_url = body.video_url;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.animation_url !== undefined) updateData.animation_url = body.animation_url;
    if (body.animation_type !== undefined) updateData.animation_type = body.animation_type;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    const { error } = await supabase.from("sub_bab").update(updateData).eq("id", body.id);

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "update",
      target_type: "sub_bab",
      target_id: body.id,
      ip_address: ip,
    });

    return NextResponse.json({
      success: true,
      cascade: {
        key_changed: keyChanged,
        old_key: keyChanged ? oldKey : null,
        new_key: keyChanged ? newKey : null,
        quiz_rows_updated: cascadeQuizUpdated,
        materi_rows_updated: cascadeMateriUpdated,
      },
    });
  } catch (e) {
    console.error("[API SubBab PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete sub-bab
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const id = new URL(req.url).searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("sub_bab").delete().eq("id", id);
    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "delete",
      target_type: "sub_bab",
      target_id: id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API SubBab DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
