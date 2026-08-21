import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = getDb();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "images";
    const safeFolder = folder.replace(/[^a-zA-Z0-9\/_-]/g, "").replace(/\.\./g, "").replace(/^\/+|\/+$/g, "") || "images";

    if (!file) {
      return NextResponse.json({ error: "File wajib diisi" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "png";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const path = `${safeFolder}/${timestamp}-${randomStr}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from("biolearn-assets")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("biolearn-assets")
      .getPublicUrl(path);

    return NextResponse.json({ success: true, url: urlData.publicUrl, path });
  } catch (e) {
    console.error("[API Upload]", e);
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

    if (path.includes("..") || path.startsWith("/") || !/^[a-zA-Z0-9\/_.-]+$/.test(path)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const { error } = await supabase.storage.from("biolearn-assets").remove([path]);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Upload DELETE]", e);
    return NextResponse.json({ error: "Gagal menghapus file" }, { status: 500 });
  }
}
