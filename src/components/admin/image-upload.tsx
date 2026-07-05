"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon, Link } from "lucide-react";
import { showToast } from "@/components/ui/toaster";

interface MediaUploadProps {
  value: string; // current asset URL
  onChange: (url: string) => void;
  folder?: string; // storage folder
  label?: string;
  placeholder?: string;
  className?: string;
  /**
   * Which file types the browser will allow via the picker.
   * Defaults to common image formats + SVG. Unlike `<input type="file"
   * accept="image/*">`, we explicitly include ".svg" because several
   * browsers bar SVG from the image/* group, causing the file dialog to
   * silently filter out .svg files.
   */
  accept?: string;
  /**
   * Higher-level media kind for the UI hint. SVG animations especially
   * benefit from upload vs URL — uploaded to Supabase Storage is the
   * most reliable way to guarantee Content-Type: image/svg+xml.
   */
  kind?: "image" | "animation" | "video" | "auto";
  /**
   * Optional helper text describing the media size/MIME guidance.
   */
  hint?: string;
}

const ACCEPT_BY_KIND: Record<NonNullable<MediaUploadProps["kind"]>, string> = {
  image: ".jpg,.jpeg,.png,.webp,.gif,.svg,image/*",
  animation: ".svg,.gif,.json,image/svg+xml,image/gif",
  video: ".mp4,.webm,.mov,.ogg",
  auto: ".jpg,.jpeg,.png,.webp,.gif,.svg,.mp4,.webm,image/*",
};

const TYPE_HINTS: Record<NonNullable<MediaUploadProps["kind"]>, string> = {
  image: "JPG, PNG, GIF, WebP, SVG — maks 5MB",
  animation:
    "SVG (animated) atau GIF — self-host lebih stabil dari CDN eksternal. Maks 5MB",
  video: "MP4 / WebM — maks 20MB",
  auto: "JPG, PNG, GIF, WebP, SVG, MP4 — maks 5MB",
};

export function MediaUpload({
  value,
  onChange,
  folder = "images",
  label = "Gambar",
  placeholder = "https://... atau upload file",
  className = "",
  accept,
  kind = "auto",
  hint,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const fileRef = useRef<HTMLInputElement>(null);

  const effectiveAccept = accept || ACCEPT_BY_KIND[kind];

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        onChange(data.url);
        showToast("File berhasil diupload!");
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Gagal mengupload file");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  /**
   * Accept a dragged file *even if* the File constructor gives it an
   * empty/unknown MIME type (which is exactly what some OSes do for
   * .svg). We infer from extension as fallback.
   */
  const looksLikeAccepted = (file: File): boolean => {
    if (file.type && file.type.startsWith("image/")) return true;
    if (file.type === "image/svg+xml" || file.type === "image/gif") return true;
    const lower = file.name.toLowerCase();
    return /\.(jpg|jpeg|png|webp|gif|svg|mp4|webm)$/.test(lower);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && looksLikeAccepted(file)) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>}

      {/* Mode toggle */}
      <div className="flex gap-1 bg-border/50 rounded-lg p-[2px] w-fit mb-2">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            mode === "url" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          <Link className="w-3 h-3" /> URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            mode === "upload" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          <Upload className="w-3 h-3" /> Upload
        </button>
      </div>

      {mode === "url" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/50 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept={effectiveAccept}
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-xs text-muted">Mengupload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-muted" />
              <p className="text-xs text-muted">Klik atau drag &amp; drop file di sini</p>
              <p className="text-[10px] text-muted/70">{hint || TYPE_HINTS[kind]}</p>
              {kind === "animation" && (
                <p className="text-[10px] text-accent mt-1">
                  💡 Upload SVG langsung ke sini paling stabil — dijamin jalan animasinya.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2 relative inline-block">
          <PreviewThumb url={value} kind={kind} />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Tiny preview thumbnail that adapts to media kind — for SVG/gif it shows
 * the asset itself so you can visually confirm the animation loaded.
 */
function PreviewThumb({ url, kind }: { url: string; kind: NonNullable<MediaUploadProps["kind"]> }) {
  if (kind === "video") {
    return (
      <video
        src={url}
        className="max-h-32 rounded-lg border border-border object-contain"
        muted
        loop
        playsInline
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Preview"
      className="max-h-32 rounded-lg border border-border object-contain bg-surface"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

/* Back-compat alias — older admin pages still import ImageUpload by its
   original name. */
export const ImageUpload = MediaUpload;
