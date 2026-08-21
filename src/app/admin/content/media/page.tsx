'use client';

import { useState, useCallback, useRef } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { adminFetch } from '@/lib/admin-fetch';
import { showToast } from '@/components/ui/toaster';
import { Upload, Trash2, ImageIcon, Loader2, FileText, X, Grid3X3, List } from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  path: string;
  name: string;
  uploadedAt: string;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function isImage(name: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
}

function isVideo(name: string): boolean {
  return /\.(mp4|webm|mov|ogg)$/i.test(name);
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [preview, setPreview] = useState<MediaFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'media');

      const res = await adminFetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload gagal');

      const newFile: MediaFile = {
        id: crypto.randomUUID(),
        url: data.url,
        path: data.path,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };

      setFiles((prev) => [newFile, ...prev]);
      showToast('File berhasil diupload!');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Gagal mengupload file');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      e.target.value = '';
    },
    [handleUpload]
  );

  const handleDelete = useCallback(async (file: MediaFile) => {
    if (!confirm(`Hapus "${file.name}"?`)) return;
    setDeleting(file.id);
    try {
      const res = await adminFetch(`/api/admin/upload?path=${encodeURIComponent(file.path)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus');

      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      showToast('File berhasil dihapus!');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Gagal menghapus file');
    } finally {
      setDeleting(null);
    }
  }, []);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pustaka Media"
        description="Kelola file media: gambar, video, dokumen, dan hotspot"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{files.length}</p>
          <p className="text-xs text-muted mt-1">Total File</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{formatSize(totalSize)}</p>
          <p className="text-xs text-muted mt-1">Total Ukuran</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {files.filter((f) => isImage(f.name)).length}
          </p>
          <p className="text-xs text-muted mt-1">Gambar</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-accent/50 bg-surface'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.webm"
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-sm text-muted">Mengupload file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-10 h-10 text-muted" />
            <p className="text-sm text-ink font-medium">
              {dragOver ? 'Lepaskan file di sini' : 'Klik atau drag & drop file untuk diupload'}
            </p>
            <p className="text-xs text-muted">JPG, PNG, GIF, WebP, SVG, MP4, WebM — maks 5MB</p>
          </div>
        )}
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{files.length} file</p>
        <div className="flex gap-1 bg-border/50 rounded-lg p-[2px]">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              view === 'grid' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
            title="Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-colors ${
              view === 'list' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {files.length === 0 && !uploading && (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <ImageIcon className="w-12 h-12 text-muted/40 mx-auto mb-3" />
          <p className="text-sm text-muted">Belum ada file media</p>
          <p className="text-xs text-muted/60 mt-1">Upload file pertama dengan drag & drop atau klik area di atas</p>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="group bg-surface rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="aspect-square relative bg-ink/5 overflow-hidden">
                {isImage(file.name) ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : isVideo(file.name) ? (
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-muted/40" />
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreview(file)}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    title="Pratinjau"
                  >
                    <ImageIcon className="w-4 h-4 text-ink" />
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={deleting === file.id}
                    className="p-2 bg-red-500/90 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                    title="Hapus"
                  >
                    {deleting === file.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-medium text-ink truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-muted">{formatDate(file.uploadedAt)}</p>
                  <p className="text-[10px] text-muted">{formatSize(file.size)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && files.length > 0 && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-semibold text-muted">Preview</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted">Nama File</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted">Tipe</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted">Ukuran</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted">Tanggal</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-ink/5 overflow-hidden flex items-center justify-center">
                      {isImage(file.name) ? (
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                      ) : isVideo(file.name) ? (
                        <video src={file.url} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <FileText className="w-5 h-5 text-muted/40" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink truncate max-w-[250px]" title={file.name}>
                    {file.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                      {getExt(file.name).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatSize(file.size)}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(file.uploadedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPreview(file)}
                        className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
                        title="Pratinjau"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file)}
                        disabled={deleting === file.id}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Hapus"
                      >
                        {deleting === file.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-[9999] bg-ink/80 flex items-center justify-center p-8"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-w-4xl max-h-full bg-surface rounded-2xl border border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 z-10 p-1.5 bg-ink/50 rounded-lg text-white hover:bg-ink/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 bg-ink/5 flex items-center justify-center min-h-[300px]">
                {isImage(preview.name) ? (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : isVideo(preview.name) ? (
                  <video
                    src={preview.url}
                    className="max-w-full max-h-[70vh] object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8">
                    <FileText className="w-16 h-16 text-muted/40" />
                    <p className="text-sm text-muted">Pratinjau tidak tersedia</p>
                  </div>
                )}
              </div>
              <div className="w-full md:w-64 p-4 border-t md:border-t-0 md:border-l border-border space-y-3">
                <div>
                  <p className="text-xs text-muted">Nama File</p>
                  <p className="text-sm font-medium text-ink break-all">{preview.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Tipe</p>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                    {getExt(preview.name).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted">Ukuran</p>
                  <p className="text-sm text-ink">{formatSize(preview.size)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Tanggal Upload</p>
                  <p className="text-sm text-ink">{formatDate(preview.uploadedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">URL</p>
                  <p className="text-xs text-ink break-all bg-ink/5 rounded-lg p-2">{preview.url}</p>
                </div>
                <button
                  onClick={() => {
                    handleDelete(preview);
                    setPreview(null);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
