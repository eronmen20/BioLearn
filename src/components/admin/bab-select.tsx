'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';
import { CustomSelect, CustomSelectGroup } from '@/components/ui/custom-select';

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
  size?: "sm" | "md";
}

/** Select bab tergroup per kelas — dipakai admin throughout.
 *  Sleek custom animated dropdown with groups, checkmarks, and icons. */
export function BabSelect({
  value,
  onChange,
  includeAll = false,
  items,
  label,
  disabled,
  className,
  size = "md",
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
  const rawGroups = groupItems(list);

  const selectGroups: CustomSelectGroup[] = [];

  if (includeAll) {
    selectGroups.push({
      label: '',
      options: [
        {
          value: '',
          label: 'Semua Bab',
          icon: <span className="text-sm">📚</span>,
        },
      ],
    });
  }

  rawGroups.forEach(({ label: gLabel, items: gItems }) => {
    if (gItems.length > 0) {
      selectGroups.push({
        label: gLabel,
        options: gItems.map((bab) => ({
          value: bab.id,
          label: formatBabLabel(bab.id),
          icon: <span className="text-sm">{bab.icon}</span>,
        })),
      });
    }
  });

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <CustomSelect
        value={value}
        onChange={onChange}
        groups={selectGroups}
        placeholder={includeAll ? 'Semua Bab' : '— Pilih bab —'}
        disabled={disabled}
        size={size}
      />
    </div>
  );
}
