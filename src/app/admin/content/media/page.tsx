'use client';

import { useState, useMemo, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { BAB } from '@/lib/bab-data';
import { Image as ImageIcon, Upload, Trash2, Eye, Video, FileText, Film } from 'lucide-react';

function toast(msg: string) {
  if (typeof window !== 'undefined') window.alert(msg);
}

interface MediaItem {
  id: string;
  nama: string;
  tipe: 'Gambar' | 'Video' | 'Dokumen' | 'Hotspot';
  babId: string;
  icon: string;
  ukuran: string;
  tanggal: string;
}

export default function MediaPage() {
  const [filterTipe, setFilterTipe] = useState<string>('all');

  const allData = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = [];
    let counter = 0;
    BAB.forEach((bab) => {
      counter++;
      items.push({
        id: `media-${counter}`,
        nama: `Thumbnail ${bab.id}.jpg`,
        tipe: 'Gambar',
        babId: bab.id,
        icon: bab.icon,
        ukuran: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
        tanggal: '2025-06-15',
      });
      if (bab.videoId) {
        counter++;
        items.push({
          id: `media-${counter}`,
          nama: bab.video.id,
          tipe: 'Video',
          babId: bab.id,
          icon: bab.icon,
          ukuran: 'YouTube',
          tanggal: '2025-06-10',
        });
      }
      if (bab.hotspotted) {
        counter++;
        items.push({
          id: `media-${counter}`,
          nama: `Hotspot ${bab.hotspotted}.png`,
          tipe: 'Hotspot',
          babId: bab.id,
          icon: bab.icon,
          ukuran: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
          tanggal: '2025-06-12',
        });
      }
    });
    return items;
  }, []);

  const data = useMemo(() => {
    if (filterTipe === 'all') return allData;
    return allData.filter((d) => d.tipe === filterTipe);
  }, [allData, filterTipe]);

  const tipeIcons: Record<string, typeof ImageIcon> = {
    Gambar: ImageIcon,
    Video: Video,
    Dokumen: FileText,
    Hotspot: Film,
  };

  const columns: Column<MediaItem>[] = [
    { key: 'id', label: 'ID', sortable: true, className: 'w-24' },
    {
      key: 'nama',
      label: 'Nama File',
      sortable: true,
      render: (row) => {
        const TipeIcon = tipeIcons[row.tipe] || ImageIcon;
        return (
          <div className="flex items-center gap-2">
            <TipeIcon className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-ink truncate max-w-[250px]">{row.nama}</span>
          </div>
        );
      },
    },
    {
      key: 'tipe',
      label: 'Tipe',
      sortable: true,
      render: (row) => {
        const colors: Record<string, string> = {
          Gambar: 'bg-blue-500/10 text-blue-600',
          Video: 'bg-red-500/10 text-red-600',
          Dokumen: 'bg-yellow-500/10 text-yellow-600',
          Hotspot: 'bg-accent/10 text-accent',
        };
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colors[row.tipe] || ''}`}>
            {row.tipe}
          </span>
        );
      },
    },
    {
      key: 'babId',
      label: 'Bab',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span>{row.icon}</span>
          <span className="text-sm capitalize">{row.babId}</span>
        </div>
      ),
    },
    { key: 'ukuran', label: 'Ukuran', sortable: true },
    { key: 'tanggal', label: 'Tanggal', sortable: true },
  ];

  const handleAction = useCallback((action: string, id: string) => {
    toast(`${action} media "${id}" — Coming soon!`);
  }, []);

  const tipeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allData.forEach((d) => {
      counts[d.tipe] = (counts[d.tipe] || 0) + 1;
    });
    return counts;
  }, [allData]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pustaka Media"
        description="Kelola file media: gambar, video, dokumen, dan hotspot"
        action={{
          label: 'Upload Media',
          onClick: () => toast('Upload Media — Coming soon!'),
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{allData.length}</p>
          <p className="text-xs text-muted mt-1">Total File</p>
        </div>
        {Object.entries(tipeCounts).map(([tipe, count]) => (
          <div key={tipe} className="bg-surface rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-ink">{count}</p>
            <p className="text-xs text-muted mt-1">{tipe}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterTipe('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterTipe === 'all'
              ? 'bg-accent text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          Semua
        </button>
        {['Gambar', 'Video', 'Dokumen', 'Hotspot'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterTipe(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTipe === t
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Cari media..."
        searchKeys={['nama', 'babId', 'tipe']}
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAction('Pratinjau', row.id)}
              className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
              title="Pratinjau"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAction('Hapus', row.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}
