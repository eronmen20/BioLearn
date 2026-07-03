'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { showToast } from '@/components/ui/toaster';
import { ImageUpload } from '@/components/admin/image-upload';
import { ConfirmDialog } from '@/components/admin/modal';
import { BAB } from '@/lib/bab-data';
import {
  HelpCircle, Plus, Trash2, Save, Loader2, CheckCircle,
  ChevronDown, ChevronRight, Edit3, BookOpen, RefreshCw,
} from 'lucide-react';

interface QuizQuestion {
  id?: number;
  bab_id: string;
  sub_bab_key: string | null;
  is_reflection: boolean;
  question_id: string;
  question_en: string;
  question_image: string;
  options_id: string[];
  options_en: string[];
  correct_answer: number;
  explanation_id: string;
  explanation_en: string;
  sort_order: number;
}

interface SubBabInfo {
  key: string;
  title: string;
}

const EMPTY_QUESTION: Omit<QuizQuestion, 'id' | 'bab_id' | 'sub_bab_key' | 'is_reflection'> = {
  question_id: '',
  question_en: '',
  question_image: '',
  options_id: ['', '', '', ''],
  options_en: ['', '', '', ''],
  correct_answer: 0,
  explanation_id: '',
  explanation_en: '',
  sort_order: 0,
};

export default function QuizV2Page() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBab, setFilterBab] = useState('');
  const [activeTab, setActiveTab] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  // Get sub-bab list for current bab
  const subBabList: SubBabInfo[] = filterBab
    ? BAB.find((b) => b.id === filterBab)?.subs.map((s) => ({
        key: s,
        title: s.replace('sub.', '').replace(/([a-z]+)(\d+)/, '$1 $2'),
      })) || []
    : [];

  const tabs = [
    ...subBabList.map((s) => ({ key: s.key, label: s.title, isReflection: false })),
    ...(filterBab ? [{ key: '__reflection__', label: 'Quiz Refleksi', isReflection: true }] : []),
  ];

  const filteredQuestions = questions.filter((q) => {
    if (!filterBab || q.bab_id !== filterBab) return false;
    if (activeTab === '__reflection__') return q.is_reflection;
    return q.sub_bab_key === activeTab && !q.is_reflection;
  });

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterBab ? `/api/admin/quiz-v2?bab_id=${filterBab}` : '/api/admin/quiz-v2';
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.quiz || []);
    } catch {
      showToast('Gagal memuat data quiz');
    } finally {
      setLoading(false);
    }
  }, [filterBab]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  // Auto-select first tab when bab changes
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find((t) => t.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [filterBab, tabs.length]);

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      ...EMPTY_QUESTION,
      bab_id: filterBab || BAB[0]?.id || '',
      sub_bab_key: activeTab === '__reflection__' ? null : activeTab,
      is_reflection: activeTab === '__reflection__',
      sort_order: filteredQuestions.length + 1,
    };
    setQuestions([...questions, newQ]);
    setExpandedQ(questions.length); // expand the new one
  };

  const updateQuestion = (globalIdx: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[globalIdx] = { ...updated[globalIdx], ...updates };
    setQuestions(updated);
  };

  const handleRemoveQuestion = () => {
    if (deletingIdx === null) return;
    const globalIdx = deletingIdx;
    const q = questions[globalIdx];

    // If it has an id, delete from DB
    if (q.id) {
      fetch(`/api/admin/quiz-v2?id=${q.id}`, { method: 'DELETE' })
        .then(() => {
          showToast('Soal berhasil dihapus');
          loadQuestions();
        })
        .catch(() => showToast('Gagal menghapus soal'));
    } else {
      // Just remove from local state
      const updated = questions.filter((_, i) => i !== globalIdx);
      setQuestions(updated);
      showToast('Soal dihapus');
    }
    setShowDelete(false);
    setDeletingIdx(null);
    if (expandedQ === globalIdx) setExpandedQ(null);
  };

  const handleSaveQuestion = async (globalIdx: number) => {
    const q = questions[globalIdx];
    if (!q.question_id.trim()) return showToast('Teks soal (ID) wajib diisi');
    if (q.options_id.some((o) => !o.trim())) return showToast('Semua pilihan (ID) wajib diisi');

    setSaving(true);
    try {
      const payload = {
        ...(q.id ? { id: q.id } : {}),
        bab_id: q.bab_id,
        sub_bab_key: q.sub_bab_key,
        is_reflection: q.is_reflection,
        question_id: q.question_id,
        question_en: q.question_en,
        question_image: q.question_image,
        options_id: q.options_id,
        options_en: q.options_en,
        correct_answer: q.correct_answer,
        explanation_id: q.explanation_id,
        explanation_en: q.explanation_en,
        sort_order: q.sort_order || globalIdx + 1,
      };

      const res = await fetch('/api/admin/quiz-v2', {
        method: q.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(q.id ? 'Soal berhasil diupdate!' : 'Soal berhasil ditambahkan!');
      loadQuestions();
    } catch {
      showToast('Gagal menyimpan soal');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    const unsaved = filteredQuestions.filter((q) => !q.id);
    if (unsaved.length === 0) return showToast('Semua soal sudah tersimpan');

    setSaving(true);
    let success = 0;
    for (const q of unsaved) {
      if (!q.question_id.trim() || q.options_id.some((o) => !o.trim())) continue;
      try {
        const res = await fetch('/api/admin/quiz-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(q),
        });
        if (res.ok) success++;
      } catch { /* skip */ }
    }
    setSaving(false);
    showToast(`${success} soal berhasil disimpan!`);
    loadQuestions();
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quiz V2"
        description="Kelola soal quiz per sub-bab dan quiz refleksi per bab"
        action={{
          label: 'Simpan Semua',
          onClick: handleSaveAll,
          icon: saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />,
        }}
      />

      {/* Filter Bab */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setFilterBab(''); setActiveTab(''); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !filterBab
              ? 'bg-accent text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          Semua
        </button>
        {BAB.map((bab) => (
          <button
            key={bab.id}
            onClick={() => { setFilterBab(bab.id); setActiveTab(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterBab === bab.id
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-muted hover:text-ink'
            }`}
          >
            {bab.icon} {bab.id}
          </button>
        ))}
      </div>

      {/* Sub-bab tabs + Quiz Refleksi */}
      {filterBab && tabs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 bg-surface rounded-xl border border-border p-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? tab.isReflection
                    ? 'bg-purple-500 text-white'
                    : 'bg-accent text-white'
                  : 'bg-bg-alt border border-border text-muted hover:text-ink'
              }`}
            >
              {tab.isReflection ? <RefreshCw className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{filteredQuestions.length}</p>
          <p className="text-xs text-muted mt-1">
            {activeTab === '__reflection__' ? 'Soal Refleksi' : 'Soal Sub Bab'}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{questions.length}</p>
          <p className="text-xs text-muted mt-1">Total Soal</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {new Set(questions.filter((q) => q.bab_id === filterBab).map((q) => q.sub_bab_key || 'refleksi')).size}
          </p>
          <p className="text-xs text-muted mt-1">Sub Bab Aktif</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-accent">4</p>
          <p className="text-xs text-muted mt-1">Pilihan/Soal</p>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-6 animate-pulse">
              <div className="h-5 bg-border rounded w-3/4 mb-3" />
              <div className="h-4 bg-border rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !filterBab ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <HelpCircle className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">Pilih bab terlebih dahulu untuk mengelola soal quiz</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Add Question Button */}
          <button
            onClick={handleAddQuestion}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted hover:text-accent hover:border-accent/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Soal {activeTab === '__reflection__' ? 'Refleksi' : ''}
          </button>

          {filteredQuestions.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-12 text-center">
              <HelpCircle className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">Belum ada soal. Klik &quot;Tambah Soal&quot; untuk menambahkan.</p>
            </div>
          ) : (
            filteredQuestions.map((q, localIdx) => {
              // Find global index
              const globalIdx = questions.indexOf(q);
              const isExpanded = expandedQ === globalIdx;

              return (
                <div
                  key={globalIdx}
                  className="bg-surface rounded-xl border border-border overflow-hidden"
                >
                  {/* Question Header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-bg-alt/50 transition-colors"
                    onClick={() => setExpandedQ(isExpanded ? null : globalIdx)}
                  >
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted" />
                      )}
                    </div>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                      {localIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {q.question_id || '(Soal belum diisi)'}
                      </p>
                      {q.question_en && (
                        <p className="text-xs text-muted truncate">{q.question_en}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {q.id && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green/10 text-green font-medium">
                          Tersimpan
                        </span>
                      )}
                      {!q.id && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 font-medium">
                          Baru
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Editor */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                      {/* Question Text */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-ink mb-1">🇮🇩 Teks Soal (ID)</label>
                          <textarea
                            value={q.question_id}
                            onChange={(e) => updateQuestion(globalIdx, { question_id: e.target.value })}
                            rows={3}
                            placeholder="Tulis pertanyaan dalam Bahasa Indonesia..."
                            className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ink mb-1">🇬🇧 Teks Soal (EN)</label>
                          <textarea
                            value={q.question_en}
                            onChange={(e) => updateQuestion(globalIdx, { question_en: e.target.value })}
                            rows={3}
                            placeholder="Write question in English..."
                            className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                          />
                        </div>
                      </div>

                      {/* Question Image */}
                      <ImageUpload
                        value={q.question_image}
                        onChange={(url) => updateQuestion(globalIdx, { question_image: url })}
                        folder="quiz-v2"
                        label="🖼️ Gambar Soal (opsional)"
                        placeholder="URL gambar atau upload"
                      />

                      {/* Options */}
                      <div>
                        <label className="block text-xs font-medium text-ink mb-2">Pilihan Jawaban</label>
                        <div className="space-y-3">
                          {optionLabels.map((label, optIdx) => (
                            <div key={optIdx} className="flex items-start gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuestion(globalIdx, { correct_answer: optIdx })}
                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all mt-0.5 ${
                                  q.correct_answer === optIdx
                                    ? 'bg-green text-white shadow-md'
                                    : 'bg-bg-alt border border-border text-muted hover:border-green/50'
                                }`}
                                title={q.correct_answer === optIdx ? 'Jawaban benar ✓' : 'Klik untuk set sebagai jawaban benar'}
                              >
                                {q.correct_answer === optIdx ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  label
                                )}
                              </button>
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={q.options_id[optIdx]}
                                  onChange={(e) => {
                                    const opts = [...q.options_id];
                                    opts[optIdx] = e.target.value;
                                    updateQuestion(globalIdx, { options_id: opts });
                                  }}
                                  placeholder={`Pilihan ${label} (ID)`}
                                  className={`px-3 py-2 border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                                    q.correct_answer === optIdx ? 'border-green/50 bg-green/5' : 'border-border'
                                  }`}
                                />
                                <input
                                  type="text"
                                  value={q.options_en[optIdx]}
                                  onChange={(e) => {
                                    const opts = [...q.options_en];
                                    opts[optIdx] = e.target.value;
                                    updateQuestion(globalIdx, { options_en: opts });
                                  }}
                                  placeholder={`Option ${label} (EN)`}
                                  className={`px-3 py-2 border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                                    q.correct_answer === optIdx ? 'border-green/50 bg-green/5' : 'border-border'
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted mt-2">
                          Klik tombol huruf untuk memilih jawaban yang benar. Hijau = jawaban benar.
                        </p>
                      </div>

                      {/* Explanation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-ink mb-1">🇮🇩 Penjelasan (ID)</label>
                          <textarea
                            value={q.explanation_id}
                            onChange={(e) => updateQuestion(globalIdx, { explanation_id: e.target.value })}
                            rows={3}
                            placeholder="Penjelasan jawaban benar..."
                            className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ink mb-1">🇬🇧 Explanation (EN)</label>
                          <textarea
                            value={q.explanation_en}
                            onChange={(e) => updateQuestion(globalIdx, { explanation_en: e.target.value })}
                            rows={3}
                            placeholder="Explanation for correct answer..."
                            className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <button
                          onClick={() => {
                            setDeletingIdx(globalIdx);
                            setShowDelete(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red hover:bg-red/5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus Soal
                        </button>
                        <button
                          onClick={() => handleSaveQuestion(globalIdx)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          {q.id ? 'Update' : 'Simpan'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => { setShowDelete(false); setDeletingIdx(null); }}
        onConfirm={handleRemoveQuestion}
        title="Hapus Soal"
        message="Yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
