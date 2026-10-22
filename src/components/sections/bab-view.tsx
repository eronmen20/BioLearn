"use client";

import { useState, useEffect } from "react";
import type { HTMLAttributes } from "react";
import { useBabContent } from "@/lib/use-bab-content";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore } from "@/lib/progress-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import { useAuthStore } from "@/lib/auth-store";
import Link from "next/link";
import { StrukturViewer } from "@/components/struktur-viewer";
import { PraktikumViewer } from "@/components/praktikum-viewer";
import { RichContentRenderer } from "@/components/rich-content-renderer";
import { AnalogiSection } from "@/components/analogi-card";
import { DigestiveInteractiveSection } from "@/components/sections/digestive-interactive";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  FlaskConical,
  Lock,
  Check,
  Trophy,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ArrowUp,
  Eye,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";

/* ───────── Quiz-v2 API types ───────── */
interface QuizV2Question {
  id: number;
  bab_id: string;
  sub_bab_key: string;
  is_reflection: boolean;
  question_id: string;
  question_en: string;
  question_image_url: string;
  options_id: string[];
  options_en: string[];
  correct_answer: number;
  explanation_id: string;
  explanation_en: string;
  // Jenis soal: 'single' (Pilihan Ganda, default) | 'true_false' (Benar/Salah).
  // NULL/kolom-belum-ada = 'single' (kompatibel dengan data lama).
  question_type?: string | null;
}

type QuizQuestionType = "single" | "true_false";

function getQuestionType(q: QuizV2Question): QuizQuestionType {
  return q.question_type === "true_false" ? "true_false" : "single";
}

function getQuestionTypeLabel(type: QuizQuestionType, lang: string): string {
  if (type === "true_false") return lang === "en" ? "True / False" : "Benar / Salah";
  return lang === "en" ? "Multiple Choice" : "Pilihan Ganda";
}

// Opsi yang ditampilkan: pakai yang tersimpan di DB; khusus Benar/Salah yang
// opsinya kosong/belum diisi → fallback ke Benar/Salah (True/False).
function getDisplayOptions(q: QuizV2Question, lang: string): string[] {
  const stored = (lang === "en" ? q.options_en || q.options_id : q.options_id) || [];
  if (getQuestionType(q) === "true_false") {
    const filled = stored.filter((o) => o && o.trim());
    if (filled.length >= 2) return filled.slice(0, 2);
    return lang === "en" ? ["True", "False"] : ["Benar", "Salah"];
  }
  return stored;
}

/* ───────── BabContent ───────── */
export function BabContent({ babId, initialSubKey }: { babId: string; initialSubKey?: string | null }) {
  const { lang, t } = useLangStore();
  const progress = useProgressStore();
  const mounted = useIsMounted();
  const { isAuthenticated } = useAuthStore();
  const isHookBab = babId === "bakteri";
  const isGuestOnHook = isHookBab && mounted && !isAuthenticated;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTarget, setAuthModalTarget] = useState<string | null>(null);

  const handleRequireAuth = (targetTitle?: string) => {
    setAuthModalTarget(targetTitle || null);
    setAuthModalOpen(true);
  };

  const { data: content, loading, error } = useBabContent(babId);
  const [subIdx, setSubIdx] = useState(0);
  // Deep link ?sub=<key> (mis. dari kartu isu di landing) — diterapkan sekali
  // setelah konten & progress siap, dan tetap menghormati gembok sub-bab.
  const [appliedDeepLink, setAppliedDeepLink] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"full" | "summary">("summary");
  const [showReflection, setShowReflection] = useState(false);

  // Loading skeleton
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-border-light rounded-xl" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-border-light rounded" />
            <div className="h-3 w-60 bg-border-light rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-border-light rounded-full" />
          <div className="h-8 w-24 bg-border-light rounded-full" />
          <div className="h-8 w-22 bg-border-light rounded-full" />
        </div>
        <div className="h-64 bg-border-light rounded-2xl" />
        <div className="h-48 bg-border-light rounded-2xl" />
      </div>
    );
  }

  // Error state — Supabase fetch failed, no hardcoded fallback
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red" />
        </div>
        <h3 className="text-lg font-bold text-ink mb-2">{t("auth.error")}</h3>
        <p className="text-sm text-muted max-w-sm mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t("quiz.again")}
        </button>
      </div>
    );
  }

  if (!content) {
    return <div className="text-center py-20 text-muted">{t("bab.notfound")}</div>;
  }

  const { bab, summary, full, quiz, subs, subTitles, subHooks, mediaBySub, objectives } = content;

  // Terapkan deep link ?sub= sekali saja (render-phase update: aman karena
  // terkondisikan dan hanya berjalan satu kali per nilai param)
  if (!loading && !error && mounted && initialSubKey && appliedDeepLink !== initialSubKey) {
    setAppliedDeepLink(initialSubKey);
    const deepIdx = subs.indexOf(initialSubKey);
    if (deepIdx >= 0) {
      if (isGuestOnHook && deepIdx > 0) {
        setSubIdx(0);
        handleRequireAuth(subTitles?.[deepIdx]?.id || subs[deepIdx]);
      } else if (progress.isSubUnlocked(babId, initialSubKey, subs)) {
        setSubIdx(deepIdx);
      }
    }
  }

  // Current sub-bab's media (from DB, or empty if hardcoded fallback)
  const currentSubKey = subs[subIdx];
  const currentMedia = (mediaBySub && mediaBySub[currentSubKey]) || {
    video_url: "",
    image_url: "",
    animation_url: "",
    animation_type: "",
  };

  // Progress calculations (guarded by mounted for hydration safety)
  const completionPct = mounted ? progress.getCompletionPct(babId, subs) : 0;
  const prog = mounted ? progress.getProgress(babId) : null;
  const doneCount = subs.filter((s) => prog?.subs[s]?.done).length;

  // Ganti sub-bab selalu disertai scroll ke atas supaya pembaca mulai dari judul
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleSelectSub = (i: number) => {
    if (isGuestOnHook && i > 0) {
      handleRequireAuth(subTitles?.[i]?.id || subs[i]);
      return;
    }
    setShowReflection(false);
    setSubIdx(i);
    scrollToTop();
  };

  const nextSubTitle = (() => {
    const nextIdx = subIdx + 1;
    if (nextIdx >= subs.length) return null;
    const fromDb = subTitles?.[nextIdx];
    if (fromDb) {
      const titleForLang = lang === "en" ? fromDb.en || fromDb.id : fromDb.id || fromDb.en;
      if (titleForLang && titleForLang.trim()) return titleForLang;
    }
    return subs[nextIdx];
  })();

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span className="text-2xl sm:text-3xl">{bab.icon}</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">{t(`bab.${bab.id}`)}</h1>
            <p className="text-muted text-xs sm:text-sm mt-0.5">{t(`bab.${bab.id}.desc`)}</p>
          </div>
        </div>

      </div>

      {/* Guest Preview Notification Banner */}
      {isGuestOnHook && (
        <GuestPreviewBanner onRegisterClick={() => handleRequireAuth()} />
      )}

      {/* Capaian & Tujuan Pembelajaran — dari kolom bab.capaian_id/en & tujuan_id/en, kosong = sembunyi */}
      <ObjectivesCard objectives={objectives} />

      {/* Progress Bar */}
      <ProgressBar completionPct={completionPct} doneCount={doneCount} totalCount={subs.length} />

      {/* Subbab Nav with lock/check */}
      <SubbabNav
        subs={subs}
        subTitles={subTitles}
        babId={babId}
        subIdx={showReflection ? -1 : subIdx}
        onSelect={handleSelectSub}
        reflectionActive={showReflection}
        onSelectReflection={() => {
          if (isGuestOnHook) {
            handleRequireAuth("Quiz Refleksi");
            return;
          }
          setShowReflection(true);
          scrollToTop();
        }}
        isGuestOnHook={isGuestOnHook}
        onRequireAuth={handleRequireAuth}
      />

      {/* Quiz Refleksi sebagai "sub-bab" sendiri — tampilan mandiri di posisi nav terakhir */}
      {showReflection ? (
        <ReflectionQuiz babId={babId} allSubKeys={subs} />
      ) : (
        <>
      {/* Hook "Kenapa penting?" — dari kolom sub_bab.hook_id/hook_en, kosong = sembunyi */}
      {(() => {
        const hook = subHooks?.[subIdx];
        const hookText = lang === "en" ? hook?.en || hook?.id : hook?.id || hook?.en;
        return hookText ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5">💡</span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                {lang === "en" ? "Why does this matter?" : "Kenapa ini penting?"}
              </p>
              <p className="text-sm text-ink leading-relaxed">{hookText}</p>
            </div>
          </div>
        ) : null;
      })()}
      {/* View Toggle */}
      <div className="flex gap-1 bg-border/40 rounded-full p-[3px] w-fit mb-5">
        <button
          onClick={() => setViewType("summary")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
            viewType === "summary" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          📝 {t("ringkasan")}
        </button>
        <button
          onClick={() => setViewType("full")}
          className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
            viewType === "full" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          📚 {t("materi_lengkap")}
        </button>
      </div>

      {/* Content Card */}
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 overflow-hidden mb-5 sm:mb-6">
        <div className="p-4 sm:p-6 md:p-8">
          {viewType === "summary" ? (
            <div className="bg-accent/[0.03] rounded-xl p-5 border border-accent/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📝</span>
                <h4 className="font-bold text-sm text-accent-dark">{t("summary.title")}</h4>
              </div>
              <p className="text-[13.5px] sm:text-sm leading-relaxed text-ink/80">
                {summary[lang]?.[subIdx] || summary.id?.[subIdx] || ""}
              </p>
            </div>
          ) : (
            <RichContentRenderer
              html={full[lang]?.[subIdx] || full.id?.[subIdx] || "<p>Konten belum tersedia</p>"}
              lang={lang}
            />
          )}
        </div>
      </div>

      {/* Analogi Sehari-hari ("Ibaratnya Begini 💡") */}
      <AnalogiSection
        babId={babId}
        subKey={currentSubKey}
        subIdx={subIdx}
        lang={lang}
      />

      {/* Animation — per-sub only (no hardcoded fallback; kalau ga ada di DB, ga tampil) */}
      <InlineAnimationSection
        subKey={currentSubKey}
        subMedia={currentMedia}
      />

      {/* Video — per-sub override or bab-level fallback */}
      <InlineVideoSection
        subVideoUrl={currentMedia.video_url}
        babVideoId={bab.videoId || ""}
      />

      {/* Interactive Image — per-sub (NEW: previously no JSX rendered image_url at all) */}
      <InlineImageSection
        imageUrl={currentMedia.image_url}
        altText={`${bab.id} ${currentSubKey}`}
      />

      {/* Interactive Hotspot — preserved */}
      <HotspotSection babId={bab.id} hotspotted={bab.hotspotted} />

      {/* Struktur & Fungsi */}
      <StrukturSection babId={babId} subBabKey={currentSubKey} lang={lang} />

      {/* Praktikum */}
      <PraktikumSection babId={babId} subBabKey={currentSubKey} lang={lang} />

      {/* Sub-bab Quiz (quiz-v2) — saat lulus, tombol lanjut ke sub-bab berikutnya */}
      <SubBabQuiz
        babId={babId}
        subKey={subs[subIdx]}
        allSubKeys={subs}
        onContinue={subIdx < subs.length - 1 ? () => handleSelectSub(subIdx + 1) : undefined}
        nextSubTitle={nextSubTitle}
        isGuestOnHook={isGuestOnHook}
        onRequireAuth={handleRequireAuth}
      />

      {/* Bottom Hook Conversion Card khusus tamu */}
      {isGuestOnHook && subIdx === 0 && (
        <GuestBottomHookCard
          nextSubTitle={nextSubTitle}
          onOpenModal={() => handleRequireAuth(nextSubTitle || undefined)}
        />
      )}
        </>
      )}

      {/* Modal Ajakan Daftar/Login untuk Tamu */}
      <AuthGateModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        targetTitle={authModalTarget}
      />

      {/* Tombol melayang kembali ke atas */}
      <ScrollToTopButton />
    </div>
  );
}

/* ───────── ScrollToTopButton (tombol melayang ke atas) ─────────
 * Muncul setelah pembaca men-scroll melewati bagian atas halaman;
 * sekali klik langsung kembali paling atas. Hanya after-mount agar
 * aman terhadap hydration mismatch.
 */
function ScrollToTopButton() {
  const { lang } = useLangStore();
  const [visible, setVisible] = useState(false);
  const mounted = useIsMounted();

  useEffect(() => {
    // rAF supaya sinkronisasi awal tidak memicu setState sinkron di body effect
    const rafId = requestAnimationFrame(() => setVisible(window.scrollY > 400));
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!mounted || !visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title={lang === "en" ? "Back to top" : "Kembali ke atas"}
      className="fixed right-4 bottom-4 z-40 w-11 h-11 rounded-full bg-accent text-white shadow-card flex items-center justify-center hover:bg-accent-dark active:scale-95 transition-all"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

/* ───────── ObjectivesCard ─────────
 * Capaian Pembelajaran (CP) berupa paragraf; Tujuan Pembelajaran (TP) berupa
 * daftar — tiap baris teks jadi satu bullet. Kosong → kartu disembunyikan.
 *
 * Compact by default: satu baris tipis (CP terpotong 1 baris + jumlah TP).
 * Di-expand → tampil penuh dua kolom. Materi tetap dekat setelah header.
 */
function ObjectivesCard({
  objectives,
}: {
  objectives?: { capaian: { id: string; en: string }; tujuan: { id: string; en: string } };
}) {
  const { lang } = useLangStore();
  const [expanded, setExpanded] = useState(false);
  if (!objectives) return null;

  const capaian = lang === "en" ? objectives.capaian.en || objectives.capaian.id : objectives.capaian.id || objectives.capaian.en;
  const tujuanRaw = lang === "en" ? objectives.tujuan.en || objectives.tujuan.id : objectives.tujuan.id || objectives.tujuan.en;
  const tujuanItems = (tujuanRaw || "")
    .split("\n")
    .map((s) => s.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean);

  if (!capaian && tujuanItems.length === 0) return null;

  // Versi ringkas — header pilnya saja
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="mb-5 w-full rounded-2xl border border-accent/15 bg-gradient-to-r from-accent/5 to-surface px-4 py-2.5 flex items-center gap-2.5 text-left hover:border-accent/30 transition-colors group"
      >
        <span className="inline-flex items-center gap-1 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent-dark">
          🎯 {lang === "en" ? "Outcome" : "Capaian"}
        </span>
        {capaian && (
          <span className="text-xs sm:text-[13px] text-muted truncate flex-1 min-w-0">{capaian}</span>
        )}
        <span className="inline-flex items-center gap-1.5 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent-dark">
          ✅ {tujuanItems.length} {lang === "en" ? "objectives" : "tujuan"}
        </span>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-accent group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  // Versi terbuka — dua kolom penuh
  return (
    <div className="mb-5 rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/5 to-surface p-4 sm:p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capaian && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent-dark mb-1.5 flex items-center gap-1.5">
              <span className="text-sm leading-none">🎯</span>
              {lang === "en" ? "Learning Outcome" : "Capaian Pembelajaran"}
            </p>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">{capaian}</p>
          </div>
        )}
        {tujuanItems.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent-dark mb-1.5 flex items-center gap-1.5">
              <span className="text-sm leading-none">✅</span>
              {lang === "en" ? "Learning Objectives" : "Tujuan Pembelajaran"}
            </p>
            <p className="text-[11px] text-muted mb-2">
              {lang === "en" ? "After this chapter, you are expected to be able to:" : "Setelah menyelesaikan bab ini, kamu diharapkan mampu:"}
            </p>
            <ul className="space-y-1.5">
              {tujuanItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted leading-relaxed">
                  <span className="mt-[3px] w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button
        onClick={() => setExpanded(false)}
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-dark transition-colors"
      >
        <RotateCcw className="w-3 h-3 rotate-90" />
        {lang === "en" ? "Collapse" : "Tutup"}
      </button>
    </div>
  );
}

/* ───────── ProgressBar ───────── */
function ProgressBar({
  completionPct,
  doneCount,
  totalCount,
}: {
  completionPct: number;
  doneCount: number;
  totalCount: number;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted">
          {doneCount}/{totalCount} sub-bab selesai
        </span>
        <span className="text-xs font-bold text-accent">{completionPct}%</span>
      </div>
      <div className="w-full h-2.5 bg-border/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-green transition-all duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${completionPct}%` }}
        />
      </div>
    </div>
  );
}

/* ───────── SubbabNav (with lock/check + hint) ───────── */
function SubbabNav({
  subs,
  subTitles,
  babId,
  subIdx,
  onSelect,
  reflectionActive,
  onSelectReflection,
  isGuestOnHook,
  onRequireAuth,
}: {
  subs: string[];
  subTitles?: { id: string; en: string }[];
  babId: string;
  subIdx: number;
  onSelect: (i: number) => void;
  reflectionActive: boolean;
  onSelectReflection: () => void;
  isGuestOnHook?: boolean;
  onRequireAuth?: (title?: string) => void;
}) {
  const { t, lang } = useLangStore();
  const progress = useProgressStore();
  const mounted = useIsMounted();

  // Get display label for a sub-bab:
  //   1. subTitles[i]?.[lang] (from sub_bab.title_id/title_en — source of truth, EDITABLE via admin)
  //   2. fallback to t(subs[i]) translation lookup
  //   3. fallback to raw subs[i] (key)
  const getSubLabel = (i: number): string => {
    const fromDb = subTitles?.[i];
    if (fromDb) {
      const titleForLang = lang === "en" ? fromDb.en : fromDb.id;
      if (titleForLang && titleForLang.trim()) return titleForLang;
    }
    const translated = t(subs[i]);
    if (translated && translated !== subs[i]) return translated;
    return subs[i];
  };

  // Ada subbab setelahnya yang masih locked? kalau ya, tampilkan hint
  const hasLockedAhead = mounted
    ? subs.some((s, i) => i > 0 && !progress.isSubUnlocked(babId, s, subs))
    : false;

  const reflectionUnlocked = mounted ? progress.isReflectionUnlocked(babId, subs) : false;
  const reflectionDone = mounted ? (progress.getProgress(babId).reflection_done ?? false) : false;

  return (
    <div className="mb-5">
      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
        {subs.map((s, i) => {
          if (isGuestOnHook && i > 0) {
            return (
              <button
                key={s}
                type="button"
                onClick={() => onRequireAuth?.(getSubLabel(i))}
                title="Daftar akun gratis untuk membuka sub-bab ini"
                className="relative px-3 sm:px-4 py-2 sm:py-2 rounded-full text-xs font-semibold border-2 border-dashed border-accent/40 bg-accent/5 text-muted hover:border-accent hover:text-accent transition-all cursor-pointer touch-manipulation active:scale-[0.97]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-accent" />
                  {getSubLabel(i)}
                  <span className="text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.2 rounded-full hidden sm:inline">{lang === "en" ? "Locked" : "Kunci"}</span>
                </span>
              </button>
            );
          }

          const isUnlocked = isGuestOnHook ? i === 0 : (mounted ? progress.isSubUnlocked(babId, s, subs) : i === 0);
          const subP = mounted ? progress.getProgress(babId).subs[s] : undefined;
          const isActive = i === subIdx;
          const isDone = subP?.done ?? false;

          return (
            <button
              key={s}
              onClick={() => isUnlocked && onSelect(i)}
              disabled={!isUnlocked}
              title={!isUnlocked ? t("bab.locked_tooltip") : undefined}
              className={`relative px-3 sm:px-4 py-2 sm:py-2 rounded-full text-xs font-semibold border-2 transition-all touch-manipulation active:scale-[0.97] ${
                !isUnlocked
                  ? "bg-bg-alt text-muted/50 border-border/40 cursor-not-allowed opacity-60"
                  : isActive
                  ? "bg-accent text-white border-accent shadow-sm"
                  : isDone
                  ? "bg-green-light text-green border-green/30 hover:border-green"
                  : "bg-surface text-muted border-border hover:border-accent-light hover:text-accent"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                {!isUnlocked ? (
                  <Lock className="w-3 h-3" />
                ) : isDone ? (
                  <Check className="w-3 h-3" />
                ) : null}
                {getSubLabel(i)}
              </span>
            </button>
          );
        })}

        {/* Quiz Refleksi — item nav terpisah, gaya & perilaku sama seperti sub-bab */}
        {isGuestOnHook ? (
          <button
            type="button"
            onClick={() => onRequireAuth?.(lang === "en" ? "Reflection Quiz" : "Quiz Refleksi")}
            title={lang === "en" ? "Sign up free to unlock Reflection Quiz" : "Daftar akun gratis untuk membuka Quiz Refleksi"}
            className="relative px-3 sm:px-4 py-2 sm:py-2 rounded-full text-xs font-semibold border-2 border-dashed border-purple-300 bg-purple-50 text-purple-700 hover:border-purple-500 transition-all cursor-pointer touch-manipulation active:scale-[0.97]"
          >
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-purple-600" />
              🪞 {lang === "en" ? "Reflection Quiz" : "Quiz Refleksi"}
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full hidden sm:inline">Kunci</span>
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => reflectionUnlocked && onSelectReflection()}
            disabled={!reflectionUnlocked}
            title={!reflectionUnlocked ? t("bab.locked_tooltip") : undefined}
            className={`relative px-3 sm:px-4 py-2 sm:py-2 rounded-full text-xs font-semibold border-2 transition-all touch-manipulation active:scale-[0.97] ${
              !reflectionUnlocked
                ? "bg-bg-alt text-muted/50 border-border/40 cursor-not-allowed opacity-60"
                : reflectionActive
                ? "bg-accent text-white border-accent shadow-sm"
                : reflectionDone
                ? "bg-purple-100 text-purple-700 border-purple-300 hover:border-purple-400"
                : "bg-accent text-white border-accent shadow-sm animate-pulse"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              {!reflectionUnlocked ? (
                <Lock className="w-3 h-3" />
              ) : reflectionDone ? (
                <Check className="w-3 h-3" />
              ) : (
                <Trophy className="w-3 h-3" />
              )}
              🪞 {lang === "en" ? "Reflection Quiz" : "Quiz Refleksi"}
            </span>
          </button>
        )}
      </div>

      {/* Petunjuk: kalau ada subbab di depan yang masih locked, kasih tau user */}
      {mounted && hasLockedAhead && !isGuestOnHook && (
        <div className="mt-2.5 flex items-start gap-1.5 text-xs text-muted">
          <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted/70" />
          <p className="leading-relaxed">
            {t("bab.locked_hint")}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────── SubBabQuiz (quiz-v2 per sub-bab) ───────── */
function SubBabQuiz({
  babId,
  subKey,
  allSubKeys,
  onContinue,
  nextSubTitle,
  isGuestOnHook,
  onRequireAuth,
}: {
  babId: string;
  subKey: string;
  allSubKeys: string[];
  // Tabirkan tombol "Lanjut ke Sub Bab Berikutnya" pada kartu hasil saat lulus.
  onContinue?: () => void;
  // Judul sub-bab berikutnya untuk label tombol (opsional).
  nextSubTitle?: string | null;
  isGuestOnHook?: boolean;
  onRequireAuth?: (title?: string) => void;
}) {
  const { lang, t } = useLangStore();
  const progress = useProgressStore();
  const [questions, setQuestions] = useState<QuizV2Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Fetch quiz-v2 for this sub-bab
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setShowResult(false);
    setCurrentQ(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);

    fetch(`/api/quiz?bab_id=${encodeURIComponent(babId)}&sub_bab_key=${encodeURIComponent(subKey)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setQuestions(data.quiz || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestions([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [babId, subKey]);

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-6 mb-6 animate-pulse">
        <div className="h-4 w-32 bg-border-light rounded mb-4" />
        <div className="h-3 w-48 bg-border-light rounded" />
      </div>
    );
  }

  if (questions.length === 0) return null;

  const q = questions[currentQ];
  const question = lang === "en" ? q.question_en || q.question_id : q.question_id;
  const qType = getQuestionType(q);
  const options = getDisplayOptions(q, lang);
  const explanation = lang === "en" ? q.explanation_en || q.explanation_id : q.explanation_id;
  const isCorrect = selected === q.correct_answer;

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setChecked(false);
    } else {
      setShowResult(true);
      const score = Math.round(((correctCount + (isCorrect ? 1 : 0)) / questions.length) * 100);
      progress.recordSubQuiz(babId, subKey, score, questions.length, allSubKeys);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setChecked(false);
    setShowResult(false);
    setCorrectCount(0);
  };

  if (showResult) {
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 80;

    return (
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-6 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {passed ? (
            <Trophy className="w-6 h-6 text-green" />
          ) : (
            <BookOpen className="w-6 h-6 text-accent" />
          )}
          <h3 className="text-lg font-bold">Hasil Quiz Sub-Bab</h3>
        </div>
        <p className={`text-4xl font-extrabold mb-2 ${passed ? "text-green" : "text-accent"}`}>
          {score}%
        </p>
        <p className="text-sm text-muted mb-1">
          {correctCount}/{questions.length} {lang === "en" ? "correct answers" : "jawaban benar"}
        </p>
        {passed ? (
          <p className="text-sm text-green font-semibold mb-4">
            ✅ {t("quiz.complete")}
          </p>
        ) : (
          <p className="text-sm text-red font-semibold mb-4">
            ❌ {t("quiz.wrong")} {t("bab.locked_hint")}
          </p>
        )}
        {passed && isGuestOnHook ? (
          <div className="space-y-3">
            <div className="p-3.5 bg-accent/10 border border-accent/25 rounded-2xl text-xs text-ink text-left flex items-start gap-2.5">
              <span className="text-accent text-base leading-none mt-0.5">✨</span>
              <span className="leading-relaxed">
                <strong>Hebat, kamu lulus kuis pengantar!</strong> Buat akun gratis sekarang untuk menyimpan skor ini ke rapor belajarmu dan membuka materi Struktur Sel Bakteri.
              </span>
            </div>
            <button
              onClick={() => onRequireAuth?.(nextSubTitle || (lang === "en" ? "Next Sub-chapter" : "Sub Bab Berikutnya"))}
              className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-all shadow-md active:scale-95"
            >
              <span>{nextSubTitle ? `${lang === "en" ? "Continue" : "Lanjut"}: ${nextSubTitle}` : (lang === "en" ? "Continue to next sub-chapter" : "Lanjut ke Sub Bab Berikutnya")}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : passed && onContinue ? (
          <button
            onClick={onContinue}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            {nextSubTitle
              ? `${lang === "en" ? "Continue" : "Lanjut"}: ${nextSubTitle}`
              : lang === "en"
              ? "Continue to next sub-chapter"
              : "Lanjut ke Sub Bab Berikutnya"}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          !passed && (
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              {t("quiz.again")}
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border/50 overflow-hidden mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-accent" />
            {t("quiz.title")}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {getQuestionTypeLabel(qType, lang)}
            </span>
          </h3>
          <span className="text-xs text-muted">
            {currentQ + 1}/{questions.length}
          </span>
        </div>

        {/* Question */}
        <p className="text-sm font-medium mb-4">{question}</p>
        {q.question_image_url && (
          <img
            src={q.question_image_url}
            alt={t("image")}
            className="mb-4 rounded-xl max-h-48 object-contain block mx-auto"
            loading="lazy"
          />
        )}

        {/* Options */}
        <div className="space-y-2 mb-4">
          {options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => !checked && setSelected(i)}
              disabled={checked}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all ${
                checked
                  ? i === q.correct_answer
                    ? "border-green bg-green-light text-green"
                    : i === selected && !isCorrect
                    ? "border-red bg-red-light text-red"
                    : "border-border text-muted"
                  : selected === i
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border hover:border-accent-light text-ink"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Explanation after check */}
        {checked && (
          <div className={`p-4 rounded-xl mb-4 ${isCorrect ? "bg-green-light" : "bg-red-light"}`}>
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <CheckCircle className="w-4 h-4 text-green" />
              ) : (
                <XCircle className="w-4 h-4 text-red" />
              )}
              <span className={`text-sm font-semibold ${isCorrect ? "text-green" : "text-red"}`}>
                {isCorrect ? t("quiz.correct") : t("quiz.wrong_text")}
              </span>
            </div>
            {explanation && (
              <div className="flex items-start gap-2 mt-2">
                <Lightbulb className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted">{explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {t("quiz.check_answer")}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2"
          >
            {currentQ < questions.length - 1 ? t("quiz.next") : t("quiz.view_result")}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────── ReflectionQuiz ───────── */
function ReflectionQuiz({
  babId,
  allSubKeys,
}: {
  babId: string;
  allSubKeys: string[];
}) {
  const { lang, t } = useLangStore();
  const progress = useProgressStore();
  const mounted = useIsMounted();

  const [questions, setQuestions] = useState<QuizV2Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  // Jawaban user per sesi berjalan — penanda saja untuk mode review (tidak dihitung ulang)
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const isUnlocked = mounted ? progress.isReflectionUnlocked(babId, allSubKeys) : false;
  const prog = mounted ? progress.getProgress(babId) : null;
  const reflectionDone = prog?.reflection_done ?? false;
  const storedScore = prog?.reflection_score ?? 0;
  // Jawaban tersimpan (diambil dari server) — tersedia walau halaman di-refresh
  const persistedAnswers: Record<string, number> = prog?.reflection_answers ?? {};

  // Reset state quiz — dipakai untuk mengulang, walau refleksi sudah pernah selesai.
  // Dideklarasikan sebelum semua early-return agar aman dipakai di JSX mana pun.
  const restartQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setChecked(false);
    setShowResult(false);
    setCorrectCount(0);
    setReviewMode(false);
    setAnswers({});
  };

  // Fetch reflection quiz when unlocked
  useEffect(() => {
    if (!isUnlocked || fetched) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/quiz?bab_id=${babId}&sub_bab_key=is_reflection`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setQuestions(data.quiz || []);
          setLoading(false);
          setFetched(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestions([]);
          setLoading(false);
          setFetched(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [babId, isUnlocked, fetched]);

  // Don't render anything if not unlocked
  if (!mounted || !isUnlocked) return null;

  if (loading || !fetched) {
    return (
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-6 mb-6 animate-pulse">
        <div className="h-4 w-40 bg-border-light rounded mb-4" />
        <div className="h-3 w-48 bg-border-light rounded" />
      </div>
    );
  }

  if (questions.length === 0) return null;

  const hasSessionAnswers = Object.keys(answers).length > 0;
  const hasPersistedAnswers = Object.keys(persistedAnswers).length > 0;
  const sessionPassed = Math.round((correctCount / questions.length) * 100) >= 80;
  // Utamakan jawaban dari attempt yang lulus; kalau belum pernah lulus, pakai attempt sesi berjalan.
  const reviewAnswers: Record<string, number> =
    hasSessionAnswers && (sessionPassed || !hasPersistedAnswers) ? answers : persistedAnswers;

  /* ───────── Mode Review (read-only) ─────────
   * Untuk user yang sudah ≥80: semua soal + "Jawaban yang Tepat" (hijau),
   * jawaban user yang salah (merah) dan pembahasan. Tanpa penilaian ulang —
   * skor tersimpan tidak berubah. Sumber jawaban: attempt sesi berjalan,
   * fallback ke `reflection_answers` (server / localStorage) supaya tetap
   * ada walau halaman di-refresh atau dibuka lagi nanti.
   */
  if (reviewMode) {
    return (
      <div
        id="reflection-quiz"
        className="bg-gradient-to-br from-accent/[0.03] to-surface rounded-2xl shadow-card border border-accent/20 overflow-hidden mb-6"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="text-lg">🔍</span>
              {lang === "en" ? "Reflection Quiz Review" : "Review Quiz Refleksi"}
            </h3>
            <span className="text-xs text-muted">{lang === "en" ? "Best score: " : "Skor terbaik: "}{storedScore}%</span>
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => {
              const question = lang === "en" ? q.question_en || q.question_id : q.question_id;
              const qType = getQuestionType(q);
              const options = getDisplayOptions(q, lang);
              const explanation = lang === "en" ? q.explanation_en || q.explanation_id : q.explanation_id;
              const userAnswer = reviewAnswers[String(qi)];

              return (
                <div key={q.id} className="bg-surface rounded-xl border border-border/50 p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-muted">
                      {lang === "en" ? "Question " : "Soal "}{qi + 1}/{questions.length}
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {getQuestionTypeLabel(qType, lang)}
                    </span>
                  </div>

                  <p className="text-sm font-medium mb-3">{question}</p>

                  {q.question_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={q.question_image_url}
                      alt={t("image")}
                      className="mb-3 rounded-xl max-h-48 object-contain block mx-auto"
                      loading="lazy"
                    />
                  )}

                  <div className="space-y-2">
                    {options.map((opt: string, i: number) => {
                      const isCorrectOpt = i === q.correct_answer;
                      const isUserWrong =
                        userAnswer !== undefined && i === userAnswer && !isCorrectOpt;

                      return (
                        <div
                          key={i}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 flex items-start gap-2 ${
                            isCorrectOpt
                              ? "border-green bg-green-light text-green"
                              : isUserWrong
                              ? "border-red bg-red-light text-red"
                              : "border-border text-muted"
                          }`}
                        >
                          {isCorrectOpt ? (
                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          ) : isUserWrong ? (
                            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          ) : (
                            <span className="w-4 flex-shrink-0" />
                          )}
                          <span>
                            {opt}
                            {isUserWrong && (
                              <span className="ml-2 text-[11px] font-semibold">{lang === "en" ? "Your answer" : "Jawabanmu"}</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {explanation && (
                    <div className="flex items-start gap-2 mt-3">
                      <Lightbulb className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted">{explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setReviewMode(false)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === "en" ? "Back" : "Kembali"}
          </button>
        </div>
      </div>
    );
  }

  // If reflection already completed, show congrats — tetap bisa dibuka ulang
  if (reflectionDone && !showResult) {
    return (
      <div id="reflection-quiz" className="bg-gradient-to-br from-green-light to-surface rounded-2xl shadow-card border border-green/20 p-6 mb-6 text-center">
        <Trophy className="w-10 h-10 text-green mx-auto mb-3" />
        <h3 className="text-lg font-extrabold text-green mb-1">{lang === "en" ? "Congratulations! Chapter completed! 🎉" : "Selamat! Bab ini selesai! 🎉"}</h3>
        <p className="text-sm text-muted">{lang === "en" ? "You have completed all sub-chapters and the reflection quiz." : "Kamu telah menyelesaikan semua sub-bab dan quiz refleksi."}</p>
        {prog?.reflection_score !== undefined && (
          <p className="text-xs text-muted mt-2">{lang === "en" ? "Reflection score: " : "Skor refleksi: "}{prog.reflection_score}%</p>
        )}
        {storedScore >= 80 ? (
          <button
            onClick={() => setReviewMode(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            <Eye className="w-4 h-4" />
            {lang === "en" ? "Review Questions" : "Review Soal"}
          </button>
        ) : (
          <button
            onClick={restartQuiz}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {lang === "en" ? "Retake Reflection Quiz" : "Ulangi Quiz Refleksi"}
          </button>
        )}
      </div>
    );
  }

  const q = questions[currentQ];
  const question = lang === "en" ? q.question_en || q.question_id : q.question_id;
  const qType = getQuestionType(q);
  const options = getDisplayOptions(q, lang);
  const explanation = lang === "en" ? q.explanation_en || q.explanation_id : q.explanation_id;
  const isCorrect = selected === q.correct_answer;

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    setAnswers((prev) => ({ ...prev, [currentQ]: selected }));
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setChecked(false);
    } else {
      setShowResult(true);
      const score = Math.round(((correctCount + (isCorrect ? 1 : 0)) / questions.length) * 100);
      const finalAnswers: Record<string, number> = { ...answers };
      if (selected !== null) finalAnswers[String(currentQ)] = selected;
      // Jawaban ikut disimpan hanya jika skor ≥80 (lihat recordReflection)
      progress.recordReflection(babId, score, questions.length, finalAnswers, allSubKeys);
    }
  };

  if (showResult) {
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 80;

    return (
      <div id="reflection-quiz" className="bg-gradient-to-br from-accent/[0.05] to-surface rounded-2xl shadow-card border border-accent/20 p-6 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className={`w-6 h-6 ${passed ? "text-green" : "text-accent"}`} />
          <h3 className="text-lg font-bold">{lang === "en" ? "Reflection Quiz Results" : "Hasil Quiz Refleksi"}</h3>
        </div>
        <p className={`text-4xl font-extrabold mb-2 ${passed ? "text-green" : "text-accent"}`}>
          {score}%
        </p>
        <p className="text-sm text-muted mb-1">
          {correctCount}/{questions.length} jawaban benar
        </p>
        {passed ? (
          <div className="mt-3">
            <p className="text-green font-bold text-lg mb-1">{lang === "en" ? "🎉 Congratulations! Chapter completed!" : "🎉 Selamat! Bab ini selesai!"}</p>
            <p className="text-sm text-muted">{lang === "en" ? "You have completed all materials and quizzes." : "Kamu telah menyelesaikan semua materi dan quiz."}</p>
            <button
              onClick={() => setReviewMode(true)}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              <Eye className="w-4 h-4" />
              {lang === "en" ? "Review Questions" : "Review Soal"}
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-red font-semibold text-sm mb-3">
              {lang === "en" ? "❌ Minimum score 80%. Try again!" : "❌ Skor minimal 80%. Coba lagi ya!"}
            </p>
            <button
              onClick={restartQuiz}
              className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              {t("quiz.again")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
      <div id="reflection-quiz" className="bg-gradient-to-br from-accent/[0.03] to-surface rounded-2xl shadow-card border border-accent/20 overflow-hidden mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span className="text-lg">🪞</span>
            {lang === "en" ? "Reflection Quiz" : "Quiz Refleksi"}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {getQuestionTypeLabel(qType, lang)}
            </span>
          </h3>
          <span className="text-xs text-muted">
            {currentQ + 1}/{questions.length}
          </span>
        </div>

        {/* Question */}
        <p className="text-sm font-medium mb-4">{question}</p>
        {q.question_image_url && (
          <img
            src={q.question_image_url}
            alt={t("image")}
            className="mb-4 rounded-xl max-h-48 object-contain block mx-auto"
            loading="lazy"
          />
        )}

        {/* Options */}
        <div className="space-y-2 mb-4">
          {options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => !checked && setSelected(i)}
              disabled={checked}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all ${
                checked
                  ? i === q.correct_answer
                    ? "border-green bg-green-light text-green"
                    : i === selected && !isCorrect
                    ? "border-red bg-red-light text-red"
                    : "border-border text-muted"
                  : selected === i
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border hover:border-accent-light text-ink"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Explanation after check */}
        {checked && (
          <div className={`p-4 rounded-xl mb-4 ${isCorrect ? "bg-green-light" : "bg-red-light"}`}>
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <CheckCircle className="w-4 h-4 text-green" />
              ) : (
                <XCircle className="w-4 h-4 text-red" />
              )}
              <span className={`text-sm font-semibold ${isCorrect ? "text-green" : "text-red"}`}>
                {isCorrect ? t("quiz.correct") : t("quiz.wrong_text")}
              </span>
            </div>
            {explanation && (
              <div className="flex items-start gap-2 mt-2">
                <Lightbulb className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted">{explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {t("quiz.check_answer")}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2"
          >
            {currentQ < questions.length - 1 ? t("quiz.next") : t("quiz.view_result")}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────── AnimationSection (unchanged) ───────── */
function AnimationSection({ babId, color, icon }: { babId: string; color: string; icon: string }) {
  const { t } = useLangStore();

  if (babId === "sel") {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎬</span>
          <h3 className="font-bold text-sm">{t("animasi")}</h3>
        </div>
        <div className="bg-gradient-to-br from-[#e8e5ff] to-[#d4d0ff] rounded-2xl p-8 text-center min-h-[220px] flex flex-col items-center justify-center overflow-hidden shadow-card border border-accent/10">
          <div className="relative w-full max-w-[300px] h-[200px]">
            <div className="absolute left-1/2 top-[10px] w-[6px] h-[180px] bg-gradient-to-b from-transparent via-accent to-transparent animate-dna rounded-full" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-accent-dark text-center">
              {t("dna.label")}
              <br />
              <span className="text-[11px] text-muted">{t("dna.desc")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (babId === "pencernaan") {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎬</span>
        <h3 className="font-bold text-sm">{t("animasi")}</h3>
      </div>
      <div className="rounded-2xl p-8 text-center min-h-[180px] flex flex-col items-center justify-center shadow-card border border-border/50" style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}>
        <div className="text-5xl animate-glow">{icon}</div>
        <div className="text-sm font-semibold text-muted mt-3">{t(`bab.${babId}`)}</div>
      </div>
    </div>
  );
}

/* ───────── HotspotSection (unchanged) ───────── */
function HotspotSection({ babId, hotspotted }: { babId: string; hotspotted: string }) {
  const { t, lang } = useLangStore();

  if (babId === "pencernaan" || hotspotted === "pencernaan") {
    return <DigestiveInteractiveSection lang={lang} />;
  }

  if (hotspotted === "sel") {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🖼️</span>
          <h3 className="font-bold text-sm">{t("animasi.sel.title")}</h3>
        </div>
        <div className="bg-surface rounded-2xl p-6 shadow-card border border-border/50">
          <div className="text-center text-muted text-sm">
            {t("animasi.sel.desc")}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/* ───────── PraktikumSection ───────── */
function PraktikumSection({ babId, subBabKey, lang }: { babId: string; subBabKey: string | null; lang: "id" | "en" }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const url = subBabKey
      ? `/api/praktikum?bab_id=${encodeURIComponent(babId)}&sub_bab_key=${encodeURIComponent(subBabKey)}&_t=${Date.now()}`
      : `/api/praktikum?bab_id=${encodeURIComponent(babId)}&_t=${Date.now()}`;
    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { if (alive) setItems(data.praktikum || []); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [babId, subBabKey]);

  if (loading || items.length === 0) return null;

  return (
    <div className="mb-6 space-y-6">
      {items.map((item) => (
        <div key={item.id} className="bg-surface rounded-2xl shadow-card border border-border/50 p-4 sm:p-6">
          <PraktikumViewer
            title={item.title_id}
            title_en={item.title_en}
            description={item.description_id}
            description_en={item.description_en}
            steps={item.steps || []}
            image_url={item.image_url}
            image_alt={item.image_alt}
            flashcards={item.flashcards || []}
            difficulty={item.difficulty}
            lang={lang}
          />
        </div>
      ))}
    </div>
  );
}

/* ───────── StrukturSection (unchanged) ───────── */
function StrukturSection({ babId, subBabKey, lang }: { babId: string; subBabKey: string | null; lang: "id" | "en" }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const url = subBabKey
      ? `/api/struktur?bab_id=${encodeURIComponent(babId)}&sub_bab_key=${encodeURIComponent(subBabKey)}&_t=${Date.now()}`
      : `/api/struktur?bab_id=${encodeURIComponent(babId)}&_t=${Date.now()}`;
    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { if (alive) setItems(data.struktur || []); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [babId, subBabKey]);

  if (loading || items.length === 0) return null;

  return (
    <div className="mb-6 space-y-6">
      {items.map((item) => (
        <div key={item.id} className="bg-surface rounded-2xl shadow-card border border-border/50 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔬</span>
            <h3 className="font-bold text-sm">Struktur & Fungsi</h3>
          </div>
          <StrukturViewer
            title={item.title}
            title_en={item.title_en}
            image_url={item.image_url}
            image_alt={item.image_alt}
            flashcards={item.flashcards || []}
            lang={lang}
          />
        </div>
      ))}
    </div>
  );
}

/* ───────── InlineAnimationSection ─────────
 * Renders per-sub animation if DB has animation_url.
 *
 * Rating of approach reliability (worst → best):
 *   <img> ...        → renders SVG as static bitmap. SMIL/CSS animations in
 *                    the SVG don't run. Buggy CDN Content-Types block it.
 *   <object> ...     → preserves SVG document, animations run *if* the
 *                    upstream sends correct Content-Type and CORS headers.
 *   inline <svg>     → <svg> is part of YOUR React tree. SMIL <animate>,
 *                    CSS @keyframes, JS — all run normally. ZERO CORS,
 *                    ZERO Content-Type nag. THIS is what we use.
 *
 * Render strategy (per type):
 *   - svg      → fetch via /api/media-proxy (CORS bypass + MIME correct)
 *                → inject as inline <svg> via dangerouslySetInnerHTML on a
 *                scoped div (so SMIL <style> keys cannot clash with host CSS).
 *                Fallback chain: inline → <object> → <img>.
 *   - iframe/h5p → <iframe> embed.
 *   - gif      → <img> works.
 *   - lottie   → <img> static fallback (lottie-react not installed).
 *
 * Note: we always go through /api/media-proxy for SVGs so external CDNs that
 * send `Content-Type: text/plain` still get correctly-typed responses on
 * the browser side, and same-origin requests get cached + CORS headers
 * which `<object>` and inline injection both need.
 */
function InlineAnimationSection({
  subKey,
  subMedia,
}: {
  subKey: string;
  subMedia: { video_url: string; image_url: string; animation_url: string; animation_type: string };
}) {
  const { t } = useLangStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!subMedia.animation_url) {
    // Tidak ada animasi di DB → jangan tampil apa-apa (ga ada fallback hardcoded lagi).
    // biar layout bersih, sesuai request user.
    return null;
  }

  const url = subMedia.animation_url;
  const type = (subMedia.animation_type || "").toLowerCase();
  const looksLikeSvg =
    type === "svg" ||
    /\.svg(\?|#|$)/i.test(url) ||
    /\/svg/i.test(url);

  return (
    <div className={`mb-6 transition-all duration-300 ${isExpanded ? "relative z-20" : ""}`}>
      <AnimationHeader
        t={t}
        typeLabel={resolvedAnimLabel(type, url)}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />
      {type === "iframe" || type === "h5p" ? (
        <FullBleedIframe url={animUrlAsEmbed(url)} title={`Animasi ${subKey}`} />
      ) : type === "gif" ? (
        <SimpleImg
          url={url}
          title={`Animasi ${subKey}`}
          maxHeightClass={isExpanded ? "max-h-[750px]" : "max-h-[480px]"}
        />
      ) : looksLikeSvg ? (
        <SvgWithFallback
          url={url}
          title={`Animasi ${subKey}`}
          subKey={subKey}
          isExpanded={isExpanded}
        />
      ) : (
        // lottie / unknown → <img> works as static fallback
        <SimpleImg
          url={url}
          title={`Animasi ${subKey}`}
          maxHeightClass={isExpanded ? "max-h-[750px]" : "max-h-[480px]"}
        />
      )}
    </div>
  );
}

/** Decide what label to show in the animation header badge. */
function resolvedAnimLabel(type: string, url: string): string {
  if (type) return type;
  if (/\.svg(\?|#|$)/i.test(url)) return "SVG";
  if (/\.gif(\?|#|$)/i.test(url)) return "GIF";
  if (/\.mp4(\?|#|$)/i.test(url)) return "Video";
  return "Media";
}

/** Full-bleed <iframe> embed (16:9 aspect, used for h5p/iframe). */
function FullBleedIframe({ url, title }: { url: string; title: string }) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden bg-black shadow-card border border-border/50">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={url}
          title={title}
          allowFullScreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>
    </div>
  );
}

/** Plain <img> wrapper with graceful failure. */
function SimpleImg({
  url,
  title,
  maxHeightClass,
}: {
  url: string;
  title: string;
  maxHeightClass: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) return <AnimationErrorFallback url={url} title={title} />;
  return (
    <div className="bg-surface rounded-2xl p-4 shadow-card border border-border/50 flex items-center justify-center min-h-[220px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={title}
        className={`${maxHeightClass} rounded-xl object-contain`}
        loading="lazy"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

/**
 * SVG renderer with tiered fallback.
 *
 * Tier 1: Inline the SVG into the DOM. This is the gold standard for
 *         animation — no CORS, no Content-Type checks, SMIL/CSS animations
 *         run normally. We fetch the SVG via /api/media-proxy so:
 *           - external host CORS doesn't block fetch
 *           - upstream's broken Content-Type is normalized to image/svg+xml
 *           - sanitisation strips <script>/onload=/foreignObject before
 *             we dangerouslySetInnerHTML it
 * Tier 2: <object> with cached bytes (fetched in parallel as backup).
 * Tier 3: <img> as last resort (static, animations won't run).
 */
function SvgWithFallback({
  url,
  title,
  subKey,
  isExpanded,
}: {
  url: string;
  title: string;
  subKey: string;
  isExpanded?: boolean;
}) {
  const [inline, setInline] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [objectFailed, setObjectFailed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Tier 1: try to inline. Re-runs whenever URL changes.
  useEffect(() => {
    let cancelled = false;
    setInline(null);
    setInlineError(null);
    setObjectFailed(false);
    setImgFailed(false);

    (async () => {
      try {
        const isExternal = /^https?:\/\//i.test(url);
        const targetUrl = isExternal ? `/api/media-proxy?url=${encodeURIComponent(url)}` : url;
        const res = await fetch(targetUrl);
        if (!res.ok) {
          const err = (await res.json().catch(() => ({})))?.error || `HTTP ${res.status}`;
          throw new Error(err);
        }
        const text = await res.text();
        if (cancelled) return;
        // Must contain an <svg> root or this isn't actually SVG content.
        if (!/<svg[\s\S]*?<\/svg>|<\/svg>|<svg\b[^>]*\/?>/i.test(text)) {
          throw new Error("Response is not SVG markup");
        }
        setInline(text);
      } catch (e) {
        if (!cancelled) setInlineError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Object URL for tier 2 — local files direct, external via proxy.
  const isExternal = /^https?:\/\//i.test(url);
  const objectUrl = isExternal ? `/api/media-proxy?url=${encodeURIComponent(url)}` : url;

  return (
    <div
      className={`bg-surface rounded-2xl p-2 sm:p-5 shadow-card border border-border/50 flex flex-col items-center justify-center transition-all duration-300 w-full overflow-hidden ${
        isExpanded
          ? "min-h-[500px] sm:min-h-[640px] p-3 sm:p-6 border-accent/40 shadow-xl"
          : "min-h-[380px] sm:min-h-[460px]"
      }`}
    >
      {/* Tier 1: inline (animations run guaranteed) */}
      {inline ? (
        <SvgScope
          html={inline}
          aria-label={title}
          className={`w-full flex items-center justify-center transition-all duration-300 [&>svg]:w-full [&>svg]:h-auto [&>svg]:drop-shadow-xs ${
            isExpanded
              ? "max-w-6xl [&>svg]:max-w-6xl [&>svg]:max-h-[820px]"
              : "max-w-4xl [&>svg]:max-w-4xl [&>svg]:max-h-[580px]"
          }`}
        />
      ) : /* Tier 2: <object> */
      !objectFailed && !inlineError ? (
        <object
          type="image/svg+xml"
          data={objectUrl}
          aria-label={title}
          className={`w-full rounded-xl transition-all duration-300 ${
            isExpanded ? "max-w-6xl h-[680px]" : "max-w-4xl h-[480px]"
          }`}
          onError={() => setObjectFailed(true)}
          // React <object> error events are unreliable; layer an Image()
          // probe so 404 / malformed XML falls back gracefully.
          ref={(el) => {
            if (el && !el.dataset.scoped) {
              el.dataset.scoped = "1";
              const probe = new Image();
              probe.onerror = () => setObjectFailed(true);
              probe.src = objectUrl;
            }
          }}
        />
      ) : /* Tier 3: <img> static */
      !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={objectUrl}
          alt={title}
          className={`rounded-xl object-contain transition-all duration-300 ${
            isExpanded ? "max-w-6xl max-h-[750px]" : "max-w-4xl max-h-[520px]"
          }`}
          loading="lazy"
          data-why-static="GIF tidak tersedia atau SVG tanpa animasi"
          onError={() => setImgFailed(true)}
        />
      ) : (
        /* Tier 4: error fallback (gives user a way forward) */
        <AnimationErrorFallback
          url={url}
          title={title}
          detail={inlineError || undefined}
          onRetry={() => {
            setInline(null);
            setInlineError(null);
            setObjectFailed(false);
            setImgFailed(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * Wrapper that isolates SVG <style> IDs/names from the host page so
 * animations don't collide. Uses dangerouslySetInnerHTML because that's the
 * ONLY way to get external SVG markup into the React tree as live code.
 */
function SvgScope({
  html,
  className,
  ...rest
}: { html: string; className?: string } & Pick<HTMLAttributes<HTMLDivElement>, "style" | "onClick" | "onLoad">) {
  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
      // The proxy already strips <script>, on*, foreignObject. Defense-in-depth:
      style={{ overflow: "hidden" }}
      {...rest}
    />
  );
}

/**
 * Reusable header for animation section with theater mode toggle.
 */
function AnimationHeader({
  t,
  typeLabel,
  isExpanded,
  onToggleExpand,
}: {
  t: (k: string) => string;
  typeLabel: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎬</span>
        <h3 className="font-bold text-sm sm:text-base">{t("animasi")}</h3>
        {typeLabel && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wide">
            {typeLabel}
          </span>
        )}
      </div>

      {onToggleExpand && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-bg-alt text-ink flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          title={isExpanded ? "Perkecil tampilan animasi" : "Perbesar tampilan animasi"}
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Ukuran Standar</span>
              <span className="sm:hidden">Kecilkan</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Perbesar Animasi</span>
              <span className="sm:hidden">Perbesar</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Shown when SVG/image both failed to load — gives user a way forward
 * instead of a silent empty box.
 */
function isSafeHttpUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed);
}

function AnimationErrorFallback({
  title,
  url,
  detail,
  onRetry,
}: {
  title: string;
  url: string;
  detail?: string;
  onRetry?: () => void;
}) {
  const { t } = useLangStore();
  return (
    <div className="flex flex-col items-center gap-2 text-center p-4 max-w-md">
      <span className="text-3xl opacity-50">🎬</span>
      <p className="text-sm text-ink font-semibold">Animasi tidak bisa dimuat dari server.</p>
      {detail && <p className="text-[11px] text-muted/80">{detail}</p>}
      <p className="text-[11px] text-muted/70 break-all">{url}</p>
      <div className="flex gap-2 mt-1 flex-wrap justify-center">
        {isSafeHttpUrl(url) && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark"
          >
            Buka di Tab Baru
          </a>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-bg-alt"
          >
            {t("quiz.again")}
          </button>
        )}
        <span className="text-[10px] text-muted/60 self-center">{title}</span>
      </div>
    </div>
  );
}

/** Convert common animation URLs into iframe-friendly URLs. */
function animUrlAsEmbed(url: string): string {
  if (!url) return "";
  // Already an embed URL — allow only trusted domains
  if (/youtube\.com\/embed|youtube\.com\/shorts\/embed|player\.vimeo\.com|h5p/.test(url)) {
    return url;
  }
  // YouTube watch → embed
  const ytWatchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (ytWatchMatch) return `https://www.youtube.com/embed/${ytWatchMatch[1]}`;
  return "";
}

/* ───────── InlineVideoSection ─────────
 * Per-sub video (admin uploads a different video per sub-bab).
 * Falls back to bab.videoId from bab-data.ts when no per-sub override.
 */
function InlineVideoSection({
  subVideoUrl,
  babVideoId,
}: {
  subVideoUrl: string;
  babVideoId: string;
}) {
  const { t } = useLangStore();

  // Use per-sub video if present
  if (subVideoUrl) {
    const embedUrl = animUrlAsEmbed(subVideoUrl);
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">▶</span>
          <h3 className="font-bold text-sm">{t("video")}</h3>
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden bg-black shadow-card border border-border/50">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title="Video Sub-Bab"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback to bab-level video
  if (babVideoId) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">▶</span>
          <h3 className="font-bold text-sm">{t("video")}</h3>
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden bg-black shadow-card border border-border/50">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${babVideoId}`}
              title="Video Bab"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ───────── InlineImageSection ─────────
 * Renders sub-bab image if admin uploaded one.
 * CRITICAL: previously no JSX in bab-view rendered image_url at all —
 * this section is the missing piece for "gambar gaada di layoutnya".
 */
function InlineImageSection({
  imageUrl,
  altText,
}: {
  imageUrl: string;
  altText: string;
}) {
  const { t } = useLangStore();
  if (!imageUrl) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🖼️</span>
        <h3 className="font-bold text-sm">{t("image")}</h3>
      </div>
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-3 sm:p-4 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-[480px] rounded-xl object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}

/* ───────── GuestPreviewBanner (Banner atas pratinjau gratis materi Bakteri) ───────── */
function GuestPreviewBanner({ onRegisterClick }: { onRegisterClick: () => void }) {
  return (
    <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-accent/10 via-purple-500/5 to-accent/5 border border-accent/20 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-ink">Pratinjau Terbuka: Materi Bakteri</span>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-accent text-white tracking-wider">
                Akses Bebas
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Kamu sedang menikmati sub-materi <strong>Karakteristik Bakteri</strong> tanpa perlu login. Untuk membuka sub-bab lanjutan, kuis, dan menyimpan progres, silakan daftar akun gratis!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link
            href="/login?mode=register&redirect=/bab/bakteri"
            className="flex-1 sm:flex-none text-center px-3.5 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-xs font-semibold transition-all shadow-xs hover:shadow active:scale-95 whitespace-nowrap"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/login?mode=login&redirect=/bab/bakteri"
            className="flex-1 sm:flex-none text-center px-3 py-2 bg-surface border border-border hover:border-accent text-ink rounded-lg text-xs font-semibold transition-all hover:bg-bg-alt active:scale-95 whitespace-nowrap"
          >
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────── GuestBottomHookCard (CTA konversi di bawah materi sub-bab 1) ───────── */
function GuestBottomHookCard({
  nextSubTitle,
  onOpenModal,
}: {
  nextSubTitle?: string | null;
  onOpenModal: () => void;
}) {
  const { lang } = useLangStore();
  return (
    <div className="mt-6 mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-accent/10 via-purple-500/5 to-surface border border-accent/25 shadow-sm text-center relative overflow-hidden">
      <div className="relative z-10 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] sm:text-[11px] font-bold mb-2">
          <span>🚀</span> {lang === "en" ? "Unlock Full Bacteria Chapter" : "Buka Seluruh Bab Bakteri"}
        </div>
        <h3 className="text-sm sm:text-base font-bold text-ink mb-1.5">
          {lang === "en" ? "Interested in Learning More About Bacteria?" : "Tertarik Belajar Lebih Dalam tentang Bakteri?"}
        </h3>
        <p className="text-muted text-xs sm:text-[13px] leading-relaxed mb-4">
          {lang === "en" ? <>In the next sub-chapter ({nextSubTitle || "Bacterial Cell Structure"}), you will explore prokaryotic cell organelles, Gram staining, and virtual microscope labs!</> : <>Di sub-bab berikutnya ({nextSubTitle || "Struktur Sel Bakteri"}), kamu bisa mempelajari organel sel prokariotik, pewarnaan Gram positif vs negatif, serta praktikum mikroskop virtual!</>}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-md mx-auto">
          <Link
            href="/login?mode=register&redirect=/bab/bakteri"
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 text-center flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === "en" ? "Sign Up Free & Continue" : "Daftar Gratis & Lanjut"}</span>
          </Link>
          <button
            onClick={onOpenModal}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-surface hover:bg-bg-alt text-ink border border-border hover:border-accent rounded-xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Lock className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{lang === "en" ? "View Locked Features" : "Lihat Fitur Terkunci"}</span>
          </button>
        </div>
        <p className="text-[10px] text-muted-2 mt-2.5">
          {lang === "en" ? "⚡ 100% Free. Takes 30 seconds to sign up and unlock all materials." : "⚡ Gratis 100%. Cukup daftar 30 detik untuk membuka seluruh materi."}
        </p>
      </div>
    </div>
  );
}

/* ───────── AuthGateModal (Modal dialog ajakan daftar/login bagi tamu) ───────── */
function AuthGateModal({
  isOpen,
  onClose,
  targetTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetTitle?: string | null;
}) {
  const { lang } = useLangStore();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-border/80 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-accent via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted hover:text-ink hover:bg-bg-alt transition-colors"
          aria-label={lang === "en" ? "Close" : "Tutup"}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-2xl shadow-inner">
              🔒
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                {lang === "en" ? "Registered Student Feature" : "Fitur Siswa Terdaftar"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-ink mt-1">
                {lang === "en" ? "Unlock Full Course Access" : "Buka Akses Penuh Materi"}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted leading-relaxed mb-5">
            {targetTitle ? (
              lang === "en" ? (
                <>
                  Sub-chapter <strong className="text-ink">{targetTitle}</strong> and other advanced features require a BioLearn account. Create a free account now to continue!
                </>
              ) : (
                <>
                  Sub-materi <strong className="text-ink">{targetTitle}</strong> dan fitur lanjutan lainnya membutuhkan akun BioLearn. Buat akun gratis sekarang untuk melanjutkan!
                </>
              )
            ) : (
              lang === "en" ? (
                <>
                  Continue your learning adventure by unlocking all chapter materials, interactive labs, and quizzes for free.
                </>
              ) : (
                <>
                  Lanjutkan petualangan belajarmu dengan membuka seluruh sub-bab materi, praktikum interaktif, dan kuis secara gratis.
                </>
              )
            )}
          </p>

          {/* Benefits */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-bg-alt/70 border border-border/60 mb-6">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <span className="text-accent text-base leading-none">📖</span>
              <span>{lang === "en" ? <><strong>Full Access to All Sub-Chapters:</strong> Cell Structure, Reproduction, Gram Staining, & Bacterial Roles</> : <><strong>Akses Lengkap Seluruh Sub-Bab:</strong> Struktur Sel, Reproduksi, Klasifikasi Gram, & Peranan Bakteri</>}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <span className="text-green text-base leading-none">🔬</span>
              <span>{lang === "en" ? <><strong>Virtual Labs & 3D Visuals:</strong> Directly observe microscopic specimens</> : <><strong>Praktikum Virtual & Visualisasi 3D:</strong> Amati preparat mikroskopis secara langsung</>}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <span className="text-amber-500 text-base leading-none">🏆</span>
              <span>{lang === "en" ? <><strong>Quizzes & In-depth Solutions:</strong> Test understanding with updated curriculum question banks</> : <><strong>Kuis & Pembahasan Mendalam:</strong> Uji pemahaman dengan bank soal kurikulum terbaru</>}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <span className="text-purple-500 text-base leading-none">📊</span>
              <span>{lang === "en" ? <><strong>Save Notes & Learning Progress:</strong> Track completion rate and quiz scores</> : <><strong>Simpan Catatan & Progres Belajar:</strong> Lacak persentase ketuntasan materi dan riwayat nilai kuis</>}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <Link
              href="/login?mode=register&redirect=/bab/bakteri"
              className="w-full py-3.5 px-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] text-center"
            >
              <Sparkles className="w-4 h-4" />
              {lang === "en" ? "Sign Up Free Now (30 Seconds)" : "Daftar Akun Gratis Sekarang (30 Detik)"}
            </Link>

            <Link
              href="/login?mode=login&redirect=/bab/bakteri"
              className="w-full py-3 px-4 bg-surface hover:bg-bg-alt border border-border text-ink font-semibold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 text-center"
            >
              {lang === "en" ? "Already have an account? Sign in here" : "Sudah Memiliki Akun? Masuk di Sini"}
            </Link>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-xs text-muted hover:text-ink underline transition-colors"
            >
              {lang === "en" ? "Maybe later, continue exploring free lessons" : "Nanti saja, tetap pelajari Karakteristik Bakteri"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
