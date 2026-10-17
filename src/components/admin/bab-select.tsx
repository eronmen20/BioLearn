'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

export interface BabSelectItem {
  id: string;
  icon: string;
  kelas_id?: string | null;
}

const CLASS_ORDER = ['x', 'xi', 'xii'];
const CLASS_LABEL: Record<string, string> = { x: 'Kelas X', xi: 'Kelas XI', xii: 'Kelas XII' };

function formatBabLabel(id: string): string {
  return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupItems(items: BabSelectItem[]): { label: string; items: BabSelectItem[] }[] {
  const groups = CLASS_ORDER.map((k) => ({
    label: CLASS_LABEL[k],
    items: items.filter((b) => (b.kelas_id || '') === k),
  }));
  const others = items.filter((b) => !CLASS_ORDER.includes(b.kelas_id || ''));
  if (others.length > 0) groups.push({ label: 'Tanpa Kelas', items: others });
  return groups;
}

interface BabSelectProps {
  value: string;
  onChange: (id: string) => void;
  /** Tambah item opsi "Semua Bab" (value='') — untuk filter */
  includeAll?: boolean;
  /** Item daftar bab; kalau kosong, komponen fetch sendiri dari /api/admin/bab */
  items?: BabSelectItem[];
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Select bab tergroup per kelas — dipakai admin throughout.
 *  Local component styling konsisten dengan picker di Editor Materi:
 *  kotak kompak w-fit, border tipis, arrow dekat tepi. */
export function BabSelect({
  value,
  onChange,
  includeAll = false,
  items,
  label,
  disabled,
  className,
}: BabSelectProps) {
  const [fetchedList, setFetchedList] = useState<BabSelectItem[]>([]);

  useEffect(() => {
    if (items) return; // items dari parent — jangan fetch
    let alive = true;
    adminFetch('/api/admin/bab')
      .then((r) => r.json())
      .then((d) => { if (alive) setFetchedList(d.bab || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [items]);

  const list = items && items.length > 0 ? items : fetchedList;
  const groups = groupItems(list);

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 pr-8 rounded-lg border border-border bg-surface text-ink text-sm font-medium focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20 cursor-pointer transition-colors disabled:opacity-50"
      >
        {includeAll && <option value="">Semua Bab</option>}
        {!includeAll && !value && list.length > 0 && <option value="">— Pilih bab —</option>}
        {groups.map(({ label: gLabel, items: gItems }) =>
          gItems.length > 0 ? (
            <optgroup key={gLabel} label={gLabel}>
              {gItems.map((bab) => (
                <option key={bab.id} value={bab.id}>
                  {bab.icon} {formatBabLabel(bab.id)}
                </option>
              ))}
            </optgroup>
          ) : null
        )}
      </select>
    </div>
  );
}
