"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { showToast } from "@/components/ui/toaster";
import {
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Languages,
  Loader2,
  Eye,
  EyeOff,
  GripVertical,
  BookOpen,
  HelpCircle,
  FileText,
  Video,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

// Types — each sub tracks its DB ID for upsert
interface SubBab {
  db_id: number | null; // null = baru, belum di DB
  key: string;
  title_id: string;
  title_en: string;
  summary_id: string;
  summary_en: string;
  content_id: string;
  content_en: string;
  video_url: string;
}

interface QuizQuestion {
  db_id: number | null;
  id: string;
  question_id: string;
  question_en: string;
  options_id: string[];
  options_en: string[];
  correct: number;
  explanation_id: string;
  explanation_en: string;
}

interface BabContent {
  bab_id: string;
  subs: SubBab[];
  quiz: QuizQuestion[];
}

export default function MateriEditorPage() {
  const [babList, setBabList] = useState<{ id: string; icon: string; color: string }[]>([]);
  const [selectedBab, setSelectedBab] = useState<string>("");
  const [content, setContent] = useState<BabContent>({
    bab_id: "",
    subs: [],
    quiz: [],
  });
  const [activeTab, setActiveTab] = useState<"summary" | "content" | "quiz">("summary");
  const [activeSub, setActiveSub] = useState<number>(0);
  const [translating, setTranslating] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Load content when bab changes — fetch sub-bab list from DB first
  useEffect(() => {
    // Fetch bab list from DB on mount
    adminFetch('/api/admin/bab')
      .then(r => r.json())
      .then(data => {
        const list = data.bab || [];
        setBabList(list);
        if (!selectedBab && list.length > 0) {
          setSelectedBab(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBab) loadContent(selectedBab);
  }, [selectedBab]);

  const loadContent = async (babId: string) => {
    setLoadingContent(true);
    try {
      // 1. Fetch sub-bab list from sub_bab table (source of truth)
      const resSubBab = await adminFetch(`/api/admin/sub-bab?bab_id=${babId}`);
      const subBabData = await resSubBab.json();
      const subBabList: { key: string; title_id?: string; title_en?: string }[] = subBabData.sub_bab || [];

      // 2. Fetch existing materi content
      const res = await adminFetch(`/api/admin/materi?bab_id=${babId}`);
      const data = await res.json();

      // 3. Fetch quiz from sub_bab_quiz table
      const resQuiz = await adminFetch(`/api/admin/quiz-v2?bab_id=${babId}`);
      const quizData = await resQuiz.json();

      if (subBabList.length > 0) {
        // Use sub-bab list from DB as the structure
        const subs: SubBab[] = subBabList.map((sb) => {
          // Find matching materi content for this sub-bab key
          const materi = (data.materi || []).find((m: Record<string, unknown>) => m.sub_bab_key === sb.key);
          const meta = materi ? ((materi.metadata as Record<string, unknown>) || {}) : {};
          return {
            db_id: materi ? (materi.id as number) : null,
            key: sb.key,
            title_id: sb.title_id || (meta.title_id as string) || "",
            title_en: sb.title_en || (meta.title_en as string) || "",
            summary_id: materi ? (materi.summary_id as string) || "" : "",
            summary_en: materi ? (materi.summary_en as string) || "" : "",
            content_id: materi ? (materi.content_id as string) || "" : "",
            content_en: materi ? (materi.content_en as string) || "" : "",
            video_url: materi ? ((materi.metadata as Record<string, unknown>)?.video_url as string) || "" : "",
          };
        });

        // Convert quiz data
        const quiz: QuizQuestion[] = (quizData.quiz || [])
          .filter((q: Record<string, unknown>) => !q.is_reflection)
          .map((q: Record<string, unknown>) => ({
            db_id: q.id as number,
            id: String(q.id),
            question_id: (q.question_id as string) || "",
            question_en: (q.question_en as string) || "",
            options_id: Array.isArray(q.options_id) ? q.options_id as string[] : ["", "", "", ""],
            options_en: Array.isArray(q.options_en) ? q.options_en as string[] : ["", "", "", ""],
            correct: (q.correct_answer as number) || 0,
            explanation_id: (q.explanation_id as string) || "",
            explanation_en: (q.explanation_en as string) || "",
          }));

        setContent({ bab_id: babId, subs, quiz });
      } else if (data.materi && data.materi.length > 0) {
        // Fallback: use materi data structure
        const subs: SubBab[] = [];
        const quiz: QuizQuestion[] = [];

        data.materi.forEach((m: Record<string, unknown>) => {
          if (m.type === "quiz") {
            const meta = (m.metadata as Record<string, unknown>) || {};
            quiz.push({
              db_id: m.id as number,
              id: String(m.id),
              question_id: m.content_id as string,
              question_en: m.content_en as string,
              options_id: (meta.options_id as string[]) || ["", "", "", ""],
              options_en: (meta.options_en as string[]) || ["", "", "", ""],
              correct: (meta.correct as number) || 0,
              explanation_id: (meta.explanation_id as string) || "",
              explanation_en: (meta.explanation_en as string) || "",
            });
          } else {
            const meta = (m.metadata as Record<string, unknown>) || {};
            subs.push({
              db_id: m.id as number,
              key: (m.sub_bab_key as string) || "",
              title_id: (meta.title_id as string) || "",
              title_en: (meta.title_en as string) || "",
              summary_id: (m.summary_id as string) || "",
              summary_en: (m.summary_en as string) || "",
              content_id: (m.content_id as string) || "",
              content_en: (m.content_en as string) || "",
              video_url: (meta.video_url as string) || "",
            });
          }
        });

        setContent({ bab_id: babId, subs, quiz });
      } else {
        // Fallback: empty structure
        setContent({
          bab_id: babId,
          subs: [],
          quiz: [],
        });
      }
    } catch {
      showToast("Gagal memuat konten");
    } finally {
      setLoadingContent(false);
    }
  };

  // Auto-translate
  const translate = async (text: string, field: string, target: "en" | "id" = "en") => {
    if (!text.trim()) return;
    setTranslating(field);
    try {
      const res = await adminFetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: target === "en" ? "id" : "en", to: target }),
      });
      const data = await res.json();
      return data.translated;
    } catch {
      showToast("Gagal menerjemahkan");
      return null;
    } finally {
      setTranslating(null);
    }
  };

  // Translate summary
  const translateSummary = async (subIdx: number) => {
    const sub = content.subs[subIdx];
    if (!sub?.summary_id) return showToast("Tulis ringkasan dulu");
    const translated = await translate(sub.summary_id, `summary_${subIdx}`);
    if (translated) {
      const newSubs = [...content.subs];
      newSubs[subIdx] = { ...newSubs[subIdx], summary_en: translated };
      setContent({ ...content, subs: newSubs });
      showToast("Ringkasan diterjemahkan!");
    }
  };

  // Translate full content
  const translateContent = async (subIdx: number) => {
    const sub = content.subs[subIdx];
    if (!sub?.content_id) return showToast("Tulis materi dulu");
    const translated = await translate(sub.content_id, `content_${subIdx}`);
    if (translated) {
      const newSubs = [...content.subs];
      newSubs[subIdx] = { ...newSubs[subIdx], content_en: translated };
      setContent({ ...content, subs: newSubs });
      showToast("Materi diterjemahkan!");
    }
  };

  // Translate quiz question
  const translateQuiz = async (quizIdx: number) => {
    const q = content.quiz[quizIdx];
    if (!q?.question_id) return showToast("Tulis soal dulu");

    setTranslating(`quiz_${quizIdx}`);

    const qTranslated = await translate(q.question_id, `quiz_q_${quizIdx}`);

    const optsTranslated = [];
    for (const opt of q.options_id) {
      const t = await translate(opt, `quiz_opt_${quizIdx}`);
      optsTranslated.push(t || opt);
    }

    const expTranslated = await translate(q.explanation_id, `quiz_exp_${quizIdx}`);

    if (qTranslated) {
      const newQuiz = [...content.quiz];
      newQuiz[quizIdx] = {
        ...newQuiz[quizIdx],
        question_en: qTranslated,
        options_en: optsTranslated,
        explanation_en: expTranslated || "",
      };
      setContent({ ...content, quiz: newQuiz });
      showToast("Quiz diterjemahkan!");
    }
    setTranslating(null);
  };

  // Translate all
  const translateAll = async () => {
    showToast("Menerjemahkan semua konten...");
    for (let i = 0; i < content.subs.length; i++) {
      await translateSummary(i);
      await translateContent(i);
    }
    for (let i = 0; i < content.quiz.length; i++) {
      await translateQuiz(i);
    }
    showToast("Semua konten diterjemahkan!");
  };

  // Save all content — UPSERT: PUT for existing, POST for new
  const saveAll = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      let successCount = 0;
      let errorCount = 0;

      // Save each sub-bab — sync to BOTH sub_bab AND materi tables
      for (const sub of content.subs) {
        try {
          // 1. Sync to sub_bab table (structure + media)
          const subBabPayload = {
            bab_id: content.bab_id,
            key: sub.key,
            title_id: sub.title_id,
            title_en: sub.title_en,
            summary_id: sub.summary_id,
            summary_en: sub.summary_en,
            content_id: sub.content_id,
            content_en: sub.content_en,
            video_url: sub.video_url,
            sort_order: content.subs.indexOf(sub) + 1,
          };

          // Check if sub-bab already exists in DB
          const existingSubBab = await adminFetch(`/api/admin/sub-bab?bab_id=${content.bab_id}`)
            .then(r => r.json())
            .then(d => (d.sub_bab || []).find((s: Record<string, unknown>) => s.key === sub.key))
            .catch(() => null);

          if (existingSubBab) {
            await adminFetch('/api/admin/sub-bab', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...subBabPayload, id: existingSubBab.id }),
            });
          } else {
            await adminFetch('/api/admin/sub-bab', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subBabPayload),
            });
          }

          // 2. Save to materi table (content + metadata)
          const materiPayload = {
            bab_id: content.bab_id,
            sub_bab_key: sub.key,
            type: "html",
            content_id: sub.content_id,
            content_en: sub.content_en,
            summary_id: sub.summary_id,
            summary_en: sub.summary_en,
            metadata: {
              title_id: sub.title_id,
              title_en: sub.title_en,
              video_url: sub.video_url,
            },
          };

          let res;
          if (sub.db_id) {
            res = await adminFetch("/api/admin/materi", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...materiPayload, id: sub.db_id }),
            });
          } else {
            res = await adminFetch("/api/admin/materi", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(materiPayload),
            });
          }
          if (!res.ok) throw new Error("Failed");
          successCount++;
        } catch {
          errorCount++;
        }
      }

      // Save quiz questions to sub_bab_quiz table (shared with Quiz V2)
      for (const q of content.quiz) {
        const payload = {
          bab_id: content.bab_id,
          sub_bab_key: content.subs[0]?.key || null, // attach to first sub-bab if no specific key
          is_reflection: false,
          question_id: q.question_id,
          question_en: q.question_en,
          question_image_url: "",
          options_id: q.options_id,
          options_en: q.options_en,
          correct_answer: q.correct,
          explanation_id: q.explanation_id,
          explanation_en: q.explanation_en,
        };

        try {
          let res;
          if (q.db_id) {
            res = await adminFetch("/api/admin/quiz-v2", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payload, id: q.db_id }),
            });
          } else {
            res = await adminFetch("/api/admin/quiz-v2", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          }
          if (!res.ok) throw new Error("Failed");
          successCount++;
        } catch {
          errorCount++;
        }
      }

      if (errorCount > 0) {
        setSaveStatus("error");
        showToast(`${successCount} berhasil, ${errorCount} gagal disimpan`);
      } else {
        setSaveStatus("success");
        showToast(`Semua konten berhasil disimpan! (${successCount} item)`);
      }

      // Reload to sync DB IDs for new records
      await loadContent(selectedBab);
    } catch {
      setSaveStatus("error");
      showToast("Gagal menyimpan konten");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // Sub-bab operations
  const addSub = () => {
    const newSub: SubBab = {
      db_id: null, // baru
      key: `sub.${selectedBab}${content.subs.length + 1}`,
      title_id: "",
      title_en: "",
      summary_id: "",
      summary_en: "",
      content_id: "",
      content_en: "",
      video_url: "",
    };
    setContent({ ...content, subs: [...content.subs, newSub] });
    setActiveSub(content.subs.length);
  };

  const removeSub = (idx: number) => {
    const sub = content.subs[idx];
    // Delete from materi table if exists
    if (sub.db_id) {
      adminFetch(`/api/admin/materi?id=${sub.db_id}`, { method: "DELETE" }).catch(() => {});
    }
    // Also delete from sub_bab table if exists (find by key)
    adminFetch(`/api/admin/sub-bab?bab_id=${content.bab_id}`)
      .then(r => r.json())
      .then(d => {
        const match = (d.sub_bab || []).find((s: Record<string, unknown>) => s.key === sub.key);
        if (match?.id) {
          adminFetch(`/api/admin/sub-bab?id=${match.id}`, { method: "DELETE" }).catch(() => {});
        }
      })
      .catch(() => {});
    const newSubs = content.subs.filter((_, i) => i !== idx);
    setContent({ ...content, subs: newSubs });
    if (activeSub >= newSubs.length) setActiveSub(Math.max(0, newSubs.length - 1));
  };

  // Quiz operations
  const addQuiz = () => {
    const newQ: QuizQuestion = {
      db_id: null,
      id: `new_${Date.now()}`,
      question_id: "",
      question_en: "",
      options_id: ["", "", "", ""],
      options_en: ["", "", "", ""],
      correct: 0,
      explanation_id: "",
      explanation_en: "",
    };
    setContent({ ...content, quiz: [...content.quiz, newQ] });
  };

  const removeQuiz = (idx: number) => {
    const q = content.quiz[idx];
    if (q.db_id) {
      adminFetch(`/api/admin/quiz-v2?id=${q.db_id}`, { method: "DELETE" }).catch(() => {});
    }
    setContent({ ...content, quiz: content.quiz.filter((_, i) => i !== idx) });
  };

  const currentSub = content.subs[activeSub];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Editor Materi"
        description="Tambah dan edit materi pembelajaran lengkap dengan terjemahan otomatis"
        action={{
          label: saving ? "Menyimpan..." : saveStatus === "success" ? "Tersimpan ✓" : "Simpan Semua",
          onClick: saveAll,
          icon: saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveStatus === "success" ? (
            <Check className="w-4 h-4" />
          ) : saveStatus === "error" ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          ),
        }}
      />

      {/* Bab Selector + Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-ink mb-1.5">Pilih Bab</label>
          <select
            value={selectedBab}
            onChange={(e) => setSelectedBab(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {babList.map((bab) => (
              <option key={bab.id} value={bab.id}>
                {bab.icon} {bab.id.charAt(0).toUpperCase() + bab.id.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={translateAll}
            disabled={!!translating}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue text-white rounded-xl text-sm font-semibold hover:bg-blue/80 transition-colors disabled:opacity-50"
          >
            {translating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Languages className="w-4 h-4" />
            )}
            Translate Semua
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-bg-alt transition-colors"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {/* Status info */}
      <div className="flex items-center gap-4 text-xs text-muted">
        <span>
          📊 {content.subs.length} sub-bab · {content.quiz.length} soal quiz
        </span>
        <span>
          💾 {content.subs.filter((s) => s.db_id).length} tersimpan · {content.subs.filter((s) => !s.db_id).length} baru
        </span>
        {loadingContent && (
          <span className="flex items-center gap-1 text-accent">
            <Loader2 className="w-3 h-3 animate-spin" /> Memuat...
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-border/50 rounded-xl p-[3px] w-fit">
        {[
          { key: "summary", label: "Ringkasan", icon: FileText },
          { key: "content", label: "Materi Lengkap", icon: BookOpen },
          { key: "quiz", label: "Quiz", icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-bab Tabs */}
      {activeTab !== "quiz" && (
        <div className="flex flex-wrap gap-2 items-center">
          {content.subs.map((sub, i) => (
            <button
              key={i}
              onClick={() => setActiveSub(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeSub === i
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-muted hover:text-ink"
              }`}
            >
              {sub.db_id && <span className="w-1.5 h-1.5 rounded-full bg-green-400" title="Tersimpan di DB" />}
              {sub.title_id || sub.key || `Sub ${i + 1}`}
            </button>
          ))}
          <button
            onClick={addSub}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-light text-green hover:bg-green/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Tambah Sub
          </button>
          {content.subs.length > 1 && (
            <button
              onClick={() => removeSub(activeSub)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-light text-red hover:bg-red/20 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Hapus Sub
            </button>
          )}
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === "summary" && currentSub && (
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-ink mb-4">Judul Sub-Bab</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">🇮🇩 Indonesia</label>
                <input
                  type="text"
                  value={currentSub.title_id}
                  onChange={(e) => {
                    const newSubs = [...content.subs];
                    newSubs[activeSub] = { ...newSubs[activeSub], title_id: e.target.value };
                    setContent({ ...content, subs: newSubs });
                  }}
                  placeholder="Judul sub-bab..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">🇬🇧 English</label>
                <input
                  type="text"
                  value={currentSub.title_en}
                  onChange={(e) => {
                    const newSubs = [...content.subs];
                    newSubs[activeSub] = { ...newSubs[activeSub], title_en: e.target.value };
                    setContent({ ...content, subs: newSubs });
                  }}
                  placeholder="Sub-chapter title..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink">Ringkasan</h3>
              <button
                onClick={() => translateSummary(activeSub)}
                disabled={translating === `summary_${activeSub}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue/10 text-blue hover:bg-blue/20 transition-colors disabled:opacity-50"
              >
                {translating === `summary_${activeSub}` ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Languages className="w-3 h-3" />
                )}
                Auto Translate
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">🇮🇩 Indonesia</label>
                <textarea
                  value={currentSub.summary_id}
                  onChange={(e) => {
                    const newSubs = [...content.subs];
                    newSubs[activeSub] = { ...newSubs[activeSub], summary_id: e.target.value };
                    setContent({ ...content, subs: newSubs });
                  }}
                  rows={4}
                  placeholder="Ringkasan singkat materi..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">🇬🇧 English (auto)</label>
                <textarea
                  value={currentSub.summary_en}
                  onChange={(e) => {
                    const newSubs = [...content.subs];
                    newSubs[activeSub] = { ...newSubs[activeSub], summary_en: e.target.value };
                    setContent({ ...content, subs: newSubs });
                  }}
                  rows={4}
                  placeholder="Short summary..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Content Tab */}
      {activeTab === "content" && currentSub && (
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink">Materi Lengkap</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => translateContent(activeSub)}
                  disabled={translating === `content_${activeSub}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue/10 text-blue hover:bg-blue/20 transition-colors disabled:opacity-50"
                >
                  {translating === `content_${activeSub}` ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Languages className="w-3 h-3" />
                  )}
                  Auto Translate
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-2">🇮🇩 Preview Indonesia</label>
                  <div
                    className="p-4 border border-border rounded-xl bg-bg-alt prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentSub.content_id }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-2">🇬🇧 Preview English</label>
                  <div
                    className="p-4 border border-border rounded-xl bg-bg-alt prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentSub.content_en }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">🇮🇩 Indonesia (HTML)</label>
                  <textarea
                    value={currentSub.content_id}
                    onChange={(e) => {
                      const newSubs = [...content.subs];
                      newSubs[activeSub] = { ...newSubs[activeSub], content_id: e.target.value };
                      setContent({ ...content, subs: newSubs });
                    }}
                    rows={16}
                    placeholder='<h3>Judul</h3><p>Isi materi...</p>'
                    className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">🇬🇧 English (auto)</label>
                  <textarea
                    value={currentSub.content_en}
                    onChange={(e) => {
                      const newSubs = [...content.subs];
                      newSubs[activeSub] = { ...newSubs[activeSub], content_en: e.target.value };
                      setContent({ ...content, subs: newSubs });
                    }}
                    rows={16}
                    placeholder='<h3>Title</h3><p>Content...</p>'
                    className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-muted mt-2">
              Gunakan HTML: &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;table&gt;
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-ink mb-3">Video (opsional)</h3>
            <input
              type="text"
              value={currentSub.video_url}
              onChange={(e) => {
                const newSubs = [...content.subs];
                newSubs[activeSub] = { ...newSubs[activeSub], video_url: e.target.value };
                setContent({ ...content, subs: newSubs });
              }}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === "quiz" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">
              Soal Quiz ({content.quiz.length})
            </h3>
            <button
              onClick={addQuiz}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-light text-green rounded-lg text-xs font-semibold hover:bg-green/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Soal
            </button>
          </div>

          {content.quiz.map((q, qi) => (
            <div key={qi} className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-ink">
                  Soal {qi + 1}
                  {q.db_id && <span className="ml-2 text-xs text-green-500">(tersimpan)</span>}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => translateQuiz(qi)}
                    disabled={translating === `quiz_${qi}`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue/10 text-blue hover:bg-blue/20 disabled:opacity-50"
                  >
                    {translating === `quiz_${qi}` ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Languages className="w-3 h-3" />
                    )}
                    Translate
                  </button>
                  <button
                    onClick={() => removeQuiz(qi)}
                    className="p-1.5 rounded-lg hover:bg-red/5 text-red"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">🇮🇩 Soal</label>
                  <textarea
                    value={q.question_id}
                    onChange={(e) => {
                      const newQuiz = [...content.quiz];
                      newQuiz[qi] = { ...newQuiz[qi], question_id: e.target.value };
                      setContent({ ...content, quiz: newQuiz });
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">🇬🇧 Soal (auto)</label>
                  <textarea
                    value={q.question_en}
                    onChange={(e) => {
                      const newQuiz = [...content.quiz];
                      newQuiz[qi] = { ...newQuiz[qi], question_en: e.target.value };
                      setContent({ ...content, quiz: newQuiz });
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-4">
                <label className="block text-xs font-medium text-muted">Pilihan Jawaban</label>
                {q.options_id.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const newQuiz = [...content.quiz];
                        newQuiz[qi] = { ...newQuiz[qi], correct: oi };
                        setContent({ ...content, quiz: newQuiz });
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                        q.correct === oi
                          ? "bg-green text-white"
                          : "bg-border text-muted hover:bg-border/80"
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newQuiz = [...content.quiz];
                        const newOpts = [...newQuiz[qi].options_id];
                        newOpts[oi] = e.target.value;
                        newQuiz[qi] = { ...newQuiz[qi], options_id: newOpts };
                        setContent({ ...content, quiz: newQuiz });
                      }}
                      placeholder={`Opsi ${String.fromCharCode(65 + oi)} (ID)`}
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <input
                      type="text"
                      value={q.options_en[oi] || ""}
                      onChange={(e) => {
                        const newQuiz = [...content.quiz];
                        const newOpts = [...newQuiz[qi].options_en];
                        newOpts[oi] = e.target.value;
                        newQuiz[qi] = { ...newQuiz[qi], options_en: newOpts };
                        setContent({ ...content, quiz: newQuiz });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + oi)} (EN)`}
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">🇮🇩 Penjelasan</label>
                  <textarea
                    value={q.explanation_id}
                    onChange={(e) => {
                      const newQuiz = [...content.quiz];
                      newQuiz[qi] = { ...newQuiz[qi], explanation_id: e.target.value };
                      setContent({ ...content, quiz: newQuiz });
                    }}
                    rows={2}
                    placeholder="Kenapa jawaban ini benar..."
                    className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">🇬🇧 Penjelasan (auto)</label>
                  <textarea
                    value={q.explanation_en}
                    onChange={(e) => {
                      const newQuiz = [...content.quiz];
                      newQuiz[qi] = { ...newQuiz[qi], explanation_en: e.target.value };
                      setContent({ ...content, quiz: newQuiz });
                    }}
                    rows={2}
                    placeholder="Why this answer is correct..."
                    className="w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                  />
                </div>
              </div>
            </div>
          ))}

          {content.quiz.length === 0 && (
            <div className="bg-surface rounded-xl border border-border p-12 text-center">
              <HelpCircle className="w-10 h-10 text-muted-2 mx-auto mb-3" />
              <p className="text-sm text-muted">Belum ada soal quiz</p>
              <button
                onClick={addQuiz}
                className="mt-3 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
              >
                Tambah Soal Pertama
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
