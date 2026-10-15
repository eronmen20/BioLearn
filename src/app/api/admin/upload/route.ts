import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

interface StorageEntry {
  name: string;
  id: string | null;
  created_at?: string;
  metadata?: { size?: number; mimetype?: string } | null;
}

interface MediaFile {
  id: string;
  name: string;
  path: string;
  folder: string;
  url: string;
  size: number;
  mime: string;
  uploadedAt: string;
}

const MAX_PER_DIR = 1000;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = getDb();
    const bucket = supabase.storage.from("biolearn-assets");

    const toFile = (folder: string, entry: StorageEntry): MediaFile => {
      const path = folder ? `${folder}/${entry.name}` : entry.name;
      const { data } = bucket.getPublicUrl(path);
      return {
        id: entry.id || path,
        name: entry.name,
        path,
        folder,
        url: data.publicUrl,
        size: entry.metadata?.size ?? 0,
        mime: entry.metadata?.mimetype ?? "",
        uploadedAt: entry.created_at ?? new Date().toISOString(),
      };
    };

    const { data: root, error } = await bucket.list("", { limit: MAX_PER_DIR });
    if (error) throw error;

    const files: MediaFile[] = [];
    const folders: string[] = [];

    for (const entry of (root ?? []) as StorageEntry[]) {
      if (entry.id === null) folders.push(entry.name);
      else files.push(toFile("", entry));
    }

    for (const folder of folders) {
      const { data: entries, error: listError } = await bucket.list(folder, {
        limit: MAX_PER_DIR,
      });
      if (listError) continue;

      for (const entry of (entries ?? []) as StorageEntry[]) {
        if (entry.id !== null) {
          files.push(toFile(folder, entry));
          continue;
        }

        const nestedPath = `${folder}/${entry.name}`;
        const { data: nested } = await bucket.list(nestedPath, { limit: MAX_PER_DIR });
        for (const child of (nested ?? []) as StorageEntry[]) {
          if (child.id !== null) files.push(toFile(nestedPath, child));
        }
      }
    }

    files.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
    return NextResponse.json({ success: true, files });
  } catch (e) {
    console.error("[API Upload GET]", e);
    return NextResponse.json({ error: "Gagal memuat daftar media" }, { status: 500 });
  }
}

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

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan JPG, PNG, GIF, WebP, SVG, MP4, atau WebM" },
        { status: 400 }
      );
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
