'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { showToast } from '@/components/ui/toaster';
import { Layers, Plus, Edit3, Trash2, Eye, Search, Save, Loader2, ChevronDown, Sparkles } from 'lucide-react';

interface FlashcardRow {
  id: number;
  bab_id: string;
  sub_bab_key: string;
  front_id: string;
  front_en: string;
  back_id: string;
  back_en: string;
  sort_order: number;
}

interface BabOption {
  id: string;
  icon: string | null;
  color: string | null;
}

interface SubBabOption {
  id: number;
  bab_id: string;
  key: string;
  title_id: string | null;
  title_en: string | null;
}

const DEFAULT_FORM = {
  bab_id: '',
  sub_bab_key: '',
  front_id: '',
  front_en: '',
  back_id: '',
  back_en: '',
  sort_order: '0',
};

export default function FlashcardPage() {
  const [cards, setCards] = useState<FlashcardRow[]>([]);
  const [babList, setBabList] = useState<BabOption[]>([]);
  const [subBabList, setSubBabList] = useState<SubBabOption[]>([]);
  const [filterBab, setFilterBab] = useState<string>('all');
  const [filterSub, setFilterSub] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<FlashcardRow | null>(null);
  const [previewing, setPreviewing] = useState<FlashcardRow | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcard?admin=true&_t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      setCards(json.cards || []);
    } catch {
      showToast('Gagal memuat data flashcard');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBabs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bab', { cache: 'no-store' });
      const json = await res.json();
      setBabList(json.bab || []);
    } catch {}
  }, []);

  const loadSubBabs = useCallback(async (babId?: string) => {
    if (!babId) {
      setSubBabList([]);
      return;
    }
    try {
      const res = await fetch(`/api/sub-bab?bab_id=${encodeURIComponent(babId)}&_t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      setSubBabList(json.subBab || []);
    } catch {
      setSubBabList([]);
    }
  }, []);

  useEffect(() => {
    loadCards();
    loadBabs();
  }, [loadCards, loadBabs]);

  const filteredCards = useMemo(() => {
    let list = cards;
    if (filterBab !== 'all') list = list.filter((c) => c.bab_id === filterBab);
    if (filterSub !== 'all') list = list.filter((c) => c.sub_bab_key === filterSub);
    return list;
  }, [cards, filterBab, filterSub]);

  const subOptions = useMemo(
    () => subBabList.map((s) => ({
      key: s.key,
      titleId: s.title_id || s.key,
      titleEn: s.title_en || s.key,
    })),
    [subBabList]
  );

  const handleAdd = () => {
    setSelected(null);
    setForm({ ...DEFAULT_FORM });
    // Default to first active BAB if available
    if (babList.length > 0) {
      const firstBab = babList[0];
      setForm((f) => ({ ...f, bab_id: firstBab.id }));
      loadSubBabs(firstBab.id);
    }
    setShowModal(true);
  };

  const handleEdit = (item: FlashcardRow) => {
    setSelected(item);
    setForm({
      bab_id: item.bab_id,
      sub_bab_key: item.sub_bab_key,
      front_id: item.front_id,
      front_en: item.front_en || '',
      back_id: item.back_id,
      back_en: item.back_en || '',
      sort_order: String(item.sort_order || 0),
    });
    loadSubBabs(item.bab_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.bab_id) return showToast('BAB wajib dipilih');
    if (!form.sub_bab_key) return showToast('Sub-BAB wajib dipilih (flashcard harus ditaruh di sub-bab tertentu)');
    if (!form.front_id.trim()) return showToast('Pertanyaan (Indonesia) wajib diisi');
    if (!form.back_id.trim()) return showToast('Jawaban (Indonesia) wajib diisi');

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        bab_id: form.bab_id,
        sub_bab_key: form.sub_bab_key,
        front_id: form.front_id.trim(),
        front_en: form.front_en.trim() || form.front_id.trim(),
        back_id: form.back_id.trim(),
        back_en: form.back_en.trim() || form.back_id.trim(),
        sort_order: parseInt(form.sort_order, 10) || 0,
      };

      let res: Response;
      if (selected) {
        payload.id = selected.id;
        res = await fetch('/api/flashcard', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/flashcard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }

      showToast(
        selected
          ? `✏️ Flashcard "${form.front_id.slice(0, 30)}..." diupdate.`
          : `📇 Flashcard baru ditambahkan ke "${form.sub_bab_key}". User bisa langsung lihat di sub-bab terkait.`
      );
      setShowModal(false);
      loadCards();
    } catch (e) {
      showToast(`Gagal menyimpan: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/flashcard?id=${selected.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showToast('Flashcard dihapus.');
      setShowDelete(false);
      setSelected(null);
      loadCards();
    } catch {
      showToast('Gagal menghapus flashcard');
    }
  };

  const getSubBabTitle = (subKey: string, subBabOptions: Array<{ key: string; titleId: string; titleEn: string }>) => {
    const found = subBabOptions.find((s) => s.key === subKey);
    return found?.titleId || subKey;
  };

  const columns: Column<FlashcardRow>[] = [
    {
      key: 'id',
      label: '#',
      render: (row) => <span className="text-xs text-muted">#{row.id}</span>,
      className: 'w-16',
    },
    {
      key: 'bab_id',
      label: 'Bab → Sub-Bab',
      sortable: true,
      render: (row) => {
        const bab = babList.find((b) => b.id === row.bab_id);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              {bab?.icon || '📚'} {row.bab_id}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold w-fit">
              <Layers className="w-3 h-3 mr-1" />
              {row.sub_bab_key}
            </span>
          </div>
        );
      },
    },
    {
      key: 'front_id',
      label: 'Pertanyaan',
      sortable: true,
      render: (row) => (
        <p className="text-sm text-ink line-clamp-2 max-w-[280px]">{row.front_id}</p>
      ),
    },
    {
      key: 'back_id',
      label: 'Jawaban',
      render: (row) => (
        <p className="text-sm text-muted line-clamp-2 max-w-[320px]">{row.back_id}</p>
      ),
    },
    {
      key: 'sort_order',
      label: 'Urutan',
      sortable: true,
      className: 'w-20',
      render: (row) => <span className="text-xs text-muted">{row.sort_order}</span>,
    },
  ];

  // Stats
  const stats = {
    total: cards.length,
    perBab: babList.map((b) => ({
      id: b.id,
      count: cards.filter((c) => c.bab_id === b.id).length,
    })),
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Flashcard"
        description="Kelola flashcard untuk pembelajaran aktif — bisa diletakkan di sub-bab tertentu"
        action={{ label: 'Tambah Flashcard', onClick: handleAdd, icon: <Plus className="w-4 h-4" /> }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{stats.total}</p>
          <p className="text-xs text-muted mt-1">Total Kartu</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{babList.length}</p>
          <p className="text-xs text-muted mt-1">BAB Tersedia</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-accent">
            {stats.perBab.reduce((a, b) => a + b.count, 0)}
          </p>
          <p className="text-xs text-muted mt-1">Kartu Aktif</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-green-600">
            {new Set(cards.map((c) => c.sub_bab_key)).size}
          </p>
          <p className="text-xs text-muted mt-1">Sub-BAB dengan Flashcard</p>
        </div>
      </div>

      {/* Hint banner */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-ink">Pilih lokasi spesifik per sub-bab</p>
          <p className="text-xs text-muted mt-1">
            Setiap flashcard ditaruh di sub-bab tertentu (wajib). User akan melihat kartu ini di bagian bawah sub-bab yang aktif, dengan UI flip card interaktif.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted">BAB:</span>
          <button
            onClick={() => { setFilterBab('all'); setFilterSub('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterBab === 'all' ? 'bg-accent text-white' : 'bg-surface border border-border text-muted hover:text-ink'
            }`}
          >
            Semua ({stats.total})
          </button>
          {babList.map((bab) => {
            const count = stats.perBab.find((p) => p.id === bab.id)?.count || 0;
            return (
              <button
                key={bab.id}
                onClick={() => { setFilterBab(bab.id); setFilterSub('all'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterBab === bab.id ? 'bg-accent text-white' : 'bg-surface border border-border text-muted hover:text-ink'
                }`}
              >
                {bab.icon || '📚'} {bab.id} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {filterBab !== 'all' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted ml-1">Sub-BAB:</span>
            <button
              onClick={() => setFilterSub('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filterSub === 'all' ? 'bg-accent/15 text-accent border border-accent/40' : 'bg-surface border border-border text-muted hover:text-ink'
              }`}
            >
              Semua sub-bab
            </button>
            {subBabList.map((sb) => {
              const count = cards.filter((c) => c.sub_bab_key === sb.key).length;
              return (
                <button
                  key={sb.key}
                  onClick={() => setFilterSub(sb.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    filterSub === sb.key ? 'bg-accent/15 text-accent border border-accent/40' : 'bg-surface border border-border text-muted hover:text-ink'
                  }`}
                >
                  {sb.key} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredCards}
          loading={loading}
          searchPlaceholder="Cari flashcard..."
          searchKeys={['front_id', 'back_id', 'sub_bab_key']}
          emptyMessage={filterBab === 'all' ? "Belum ada flashcard. Klik 'Tambah Flashcard' untuk menambahkan." : `Belum ada flashcard untuk BAB ${filterBab}${filterSub !== 'all' ? ` → sub-bab ${filterSub}` : ''}.`}
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPreviewing(row)}
                className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
                title="Pratinjau"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(row)}
                className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-500 transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSelected(row); setShowDelete(true); }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      {/* Editor Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={selected ? `Edit Flashcard #${selected.id}` : 'Tambah Flashcard Baru'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                BAB <span className="text-red">*</span>
              </label>
              <select
                value={form.bab_id}
                onChange={(e) => {
                  setForm({ ...form, bab_id: e.target.value, sub_bab_key: '' });
                  loadSubBabs(e.target.value);
                }}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">— Pilih BAB —</option>
                {babList.map((b) => (
                  <option key={b.id} value={b.id}>{b.icon || '📚'} {b.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Sub-BAB <span className="text-red">*</span>
              </label>
              <select
                value={form.sub_bab_key}
                onChange={(e) => setForm({ ...form, sub_bab_key: e.target.value })}
                disabled={!form.bab_id || subBabList.length === 0}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
              >
                <option value="">— Pilih Sub-BAB —</option>
                {subBabList.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.key} {s.title_id ? ` — ${s.title_id}` : ''}
                  </option>
                ))}
              </select>
              {form.bab_id && subBabList.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ BAB ini belum punya sub-bab.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Pertanyaan (Indonesia) <span className="text-red">*</span>
            </label>
            <textarea
              value={form.front_id}
              onChange={(e) => setForm({ ...form, front_id: e.target.value })}
              rows={2}
              placeholder="cth: Apa fungsi ribosom dalam sel?"
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Pertanyaan (English) — opsional
            </label>
            <textarea
              value={form.front_en}
              onChange={(e) => setForm({ ...form, front_en: e.target.value })}
              rows={2}
              placeholder="English question. If empty, Indonesian version is used."
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Jawaban (Indonesia) <span className="text-red">*</span>
            </label>
            <textarea
              value={form.back_id}
              onChange={(e) => setForm({ ...form, back_id: e.target.value })}
              rows={3}
              placeholder="cth: Ribosom adalah organel sel yang berfungsi untuk sintesis protein..."
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Jawaban (English) — opsional
            </label>
            <textarea
              value={form.back_en}
              onChange={(e) => setForm({ ...form, back_en: e.target.value })}
              rows={3}
              placeholder="English answer. If empty, Indonesian version is used."
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Urutan</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <p className="text-xs text-muted mt-1">Urutan tampil di sub-bab. Lower = first.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-bg-alt transition-colors">Batal</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Flashcard"
        message={`Yakin ingin menghapus flashcard ini?`}
        variant="danger"
      />

      {/* Preview Modal — show actual user-facing card */}
      <Modal open={!!previewing} onClose={() => setPreviewing(null)} title="Pratinjau Flashcard (User View)" size="md">
        {previewing && (
          <div className="space-y-4">
            <div className="text-xs text-muted">
              Ditampilkan di sub-bab: <span className="font-semibold text-accent">{previewing.sub_bab_key}</span>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">Pertanyaan (ID)</p>
                <p className="text-sm text-ink">{previewing.front_id}</p>
              </div>
              <div className="rounded-xl border border-green-500/40 bg-green-500/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-green-700 mb-2">Jawaban (ID)</p>
                <p className="text-sm text-ink">{previewing.back_id}</p>
              </div>
              {previewing.front_en && (
                <div className="rounded-xl border border-border bg-bg-alt p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">English Version</p>
                  <p className="text-sm text-muted"><span className="font-semibold">Q:</span> {previewing.front_en}</p>
                  <p className="text-sm text-muted mt-2"><span className="font-semibold">A:</span> {previewing.back_en || '—'}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2 border-t border-border">
              <button onClick={() => setPreviewing(null)} className="px-4 py-2 text-sm bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors font-semibold">Tutup</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
