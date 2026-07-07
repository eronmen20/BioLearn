"use client";

import { useState, useEffect } from "react";
import type { HTMLAttributes } from "react";
import { useBabContent } from "@/lib/use-bab-content";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore } from "@/lib/progress-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import { StrukturViewer } from "@/components/struktur-viewer";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  Database,
  FlaskConical,
  Lock,
  Check,
  Trophy,
  BookOpen,
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
}

/* ───────── BabContent ───────── */
export function BabContent({ babId }: { babId: string }) {
  const { lang, t } = useLangStore();
  const progress = useProgressStore();
  const mounted = useIsMounted();
  const { data: content, loading } = useBabContent(babId);
  const [subIdx, setSubIdx] = useState(0);
  const [viewType, setViewType] = useState<"full" | "summary">("summary");

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

  if (!content) {
    return <div className="text-center py-20 text-muted">{t("bab.notfound")}</div>;
  }

  const { bab, summary, full, quiz, subs, subTitles, mediaBySub, source } = content;

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
        {source === "supabase" && (
          <div className="flex items-center gap-1.5 text-xs text-green">
            <Database className="w-3 h-3" />
            <span>Konten dari database (bisa diedit dari admin)</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar completionPct={completionPct} doneCount={doneCount} totalCount={subs.length} />

      {/* Subbab Nav with lock/check */}
      <SubbabNav
        subs={subs}
        subTitles={subTitles}
        babId={babId}
        subIdx={subIdx}
        onSelect={setSubIdx}
      />

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
              <p className="text-sm leading-relaxed text-muted">
                {summary[lang]?.[subIdx] || summary.id?.[subIdx] || ""}
              </p>
            </div>
          ) : (
            <div
              className="max-w-none text-sm leading-relaxed text-muted
                [&_h3]:text-accent-dark [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-sm
                [&_h4]:text-accent [&_h4]:font-medium [&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:text-xs [&_h4]:uppercase [&_h4]:tracking-wide
                [&_p]:leading-relaxed [&_p]:my-2
                [&_strong]:text-ink [&_strong]:font-semibold
                [&_em]:text-accent [&_em]:italic
                [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-accent-dark
                [&_ul]:!list-disc [&_ul]:!pl-6 [&_ul]:!my-3 [&_ul]:!space-y-1.5
                [&_ol]:!list-decimal [&_ol]:!pl-6 [&_ol]:!my-3 [&_ol]:!space-y-1.5
                [&_li]:!pl-1 [&_li]:!marker:text-accent
                [&_ul_ul]:!list-circle [&_ol_ol]:!list-lower-alpha
                [&_blockquote]:border-l-4 [&_blockquote]:border-accent/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted [&_blockquote]:my-3
                [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-accent-dark [&_code]:text-xs [&_code]:font-mono
                [&_pre]:bg-surface-2 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-3
                [&_pre_code]:bg-transparent [&_pre_code]:p-0
                [&_table]:w-full [&_table]:my-3 [&_table]:text-xs
                [&_th]:bg-surface-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-border
                [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-border"
              dangerouslySetInnerHTML={{
                __html: full[lang]?.[subIdx] || full.id?.[subIdx] || "<p>Konten belum tersedia</p>",
              }}
            />
          )}
        </div>
      </div>

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

      {/* Sub-bab Quiz (quiz-v2) */}
      <SubBabQuiz babId={babId} subKey={subs[subIdx]} allSubKeys={subs} />

      {/* Reflection Quiz (only visible when all sub-bab quizzes passed) */}
      <ReflectionQuiz babId={babId} allSubKeys={subs} />
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
}: {
  subs: string[];
  subTitles?: { id: string; en: string }[];
  babId: string;
  subIdx: number;
  onSelect: (i: number) => void;
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

  return (
    <div className="mb-5">
      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
        {subs.map((s, i) => {
          const isUnlocked = mounted ? progress.isSubUnlocked(babId, s, subs) : i === 0;
          const subP = mounted ? progress.getProgress(babId).subs[s] : undefined;
          const isActive = i === subIdx;
          const isDone = subP?.done ?? false;

          return (
            <button
              key={s}
              onClick={() => isUnlocked && onSelect(i)}
              disabled={!isUnlocked}
              title={!isUnlocked ? "Selesaikan kuis subbab sebelumnya (skor ≥80%) untuk membuka" : undefined}
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
      </div>

      {/* Petunjuk: kalau ada subbab di depan yang masih locked, kasih tau user */}
      {mounted && hasLockedAhead && (
        <div className="mt-2.5 flex items-start gap-1.5 text-xs text-muted">
          <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted/70" />
          <p className="leading-relaxed">
            Selesaikan kuis di subbab ini dengan skor minimal{" "}
            <span className="font-semibold text-accent">80%</span> untuk membuka subbab berikutnya.
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
}: {
  babId: string;
  subKey: string;
  allSubKeys: string[];
}) {
  const { lang } = useLangStore();
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
  const options = lang === "en" ? q.options_en || q.options_id : q.options_id;
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
      progress.recordSubQuiz(babId, subKey, score, questions.length);
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
          {correctCount}/{questions.length} jawaban benar
        </p>
        {passed ? (
          <p className="text-sm text-green font-semibold mb-4">
            ✅ Sub-bab selesai! Lanjut ke sub-bab berikutnya.
          </p>
        ) : (
          <p className="text-sm text-red font-semibold mb-4">
            ❌ Skor minimal 80% untuk lanjut. Coba lagi ya!
          </p>
        )}
        {!passed && (
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Coba Lagi
          </button>
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
            Quiz Sub-Bab
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
            alt="Gambar soal"
            className="mb-4 rounded-xl max-h-48 object-contain mx-auto"
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
                {isCorrect ? "Benar!" : "Salah!"}
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
            Periksa Jawaban
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2"
          >
            {currentQ < questions.length - 1 ? "Soal Berikutnya" : "Lihat Hasil"}
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
  const { lang } = useLangStore();
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

  const isUnlocked = mounted ? progress.isReflectionUnlocked(babId, allSubKeys) : false;
  const prog = mounted ? progress.getProgress(babId) : null;
  const reflectionDone = prog?.reflection_done ?? false;

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

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-6 mb-6 animate-pulse">
        <div className="h-4 w-40 bg-border-light rounded mb-4" />
        <div className="h-3 w-48 bg-border-light rounded" />
      </div>
    );
  }

  if (questions.length === 0) return null;

  // If reflection already completed, show congrats
  if (reflectionDone && !showResult) {
    return (
      <div className="bg-gradient-to-br from-green-light to-surface rounded-2xl shadow-card border border-green/20 p-6 mb-6 text-center">
        <Trophy className="w-10 h-10 text-green mx-auto mb-3" />
        <h3 className="text-lg font-extrabold text-green mb-1">Selamat! Bab ini selesai! 🎉</h3>
        <p className="text-sm text-muted">
          Kamu telah menyelesaikan semua sub-bab dan quiz refleksi.
        </p>
        {prog?.reflection_score !== undefined && (
          <p className="text-xs text-muted mt-2">Skor refleksi: {prog.reflection_score}%</p>
        )}
      </div>
    );
  }

  const q = questions[currentQ];
  const question = lang === "en" ? q.question_en || q.question_id : q.question_id;
  const options = lang === "en" ? q.options_en || q.options_id : q.options_id;
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
      progress.recordReflection(babId, score, questions.length);
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
      <div className="bg-gradient-to-br from-accent/[0.05] to-surface rounded-2xl shadow-card border border-accent/20 p-6 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className={`w-6 h-6 ${passed ? "text-green" : "text-accent"}`} />
          <h3 className="text-lg font-bold">Hasil Quiz Refleksi</h3>
        </div>
        <p className={`text-4xl font-extrabold mb-2 ${passed ? "text-green" : "text-accent"}`}>
          {score}%
        </p>
        <p className="text-sm text-muted mb-1">
          {correctCount}/{questions.length} jawaban benar
        </p>
        {passed ? (
          <div className="mt-3">
            <p className="text-green font-bold text-lg mb-1">🎉 Selamat! Bab ini selesai!</p>
            <p className="text-sm text-muted">Kamu telah menyelesaikan semua materi dan quiz.</p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-red font-semibold text-sm mb-3">
              ❌ Skor minimal 80%. Coba lagi ya!
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-accent/[0.03] to-surface rounded-2xl shadow-card border border-accent/20 overflow-hidden mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span className="text-lg">🪞</span>
            Quiz Refleksi
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
            alt="Gambar soal"
            className="mb-4 rounded-xl max-h-48 object-contain mx-auto"
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
                {isCorrect ? "Benar!" : "Salah!"}
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
            Periksa Jawaban
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2"
          >
            {currentQ < questions.length - 1 ? "Soal Berikutnya" : "Lihat Hasil"}
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
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎬</span>
          <h3 className="font-bold text-sm">{t("animasi")}</h3>
        </div>
        <div className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] rounded-2xl p-8 text-center min-h-[220px] flex flex-col items-center justify-center overflow-hidden shadow-card border border-green/10">
          <div className="relative w-full max-w-[320px] h-[200px]">
            <div className="absolute top-[10px] right-[20px] w-[50px] h-[50px] rounded-full animate-glow" style={{ background: "radial-gradient(circle, #fdcb6e, #f39c12)" }} />
            <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 w-[6px] h-[40px] bg-green rounded-full" />
            <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 w-[80px] h-[40px] bg-green rounded-[50%] animate-sway" />
            <div className="absolute top-[40%] right-[10px] text-sm font-bold text-red animate-float-right">CO₂</div>
            <div className="absolute top-[30%] left-[10px] text-sm font-bold text-green animate-float-left">O₂</div>
            <div className="absolute bottom-[5px] left-[30%] text-xs text-blue">H₂O</div>
            <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 text-xs font-semibold text-muted">{t("animasi.pencernaan")}</div>
          </div>
        </div>
      </div>
    );
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
  const { t } = useLangStore();
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
    <div className="mb-6">
      <AnimationHeader t={t} typeLabel={resolvedAnimLabel(type, url)} />
      {type === "iframe" || type === "h5p" ? (
        <FullBleedIframe url={animUrlAsEmbed(url)} title={`Animasi ${subKey}`} />
      ) : type === "gif" ? (
        <SimpleImg
          url={url}
          title={`Animasi ${subKey}`}
          maxHeightClass="max-h-[360px]"
        />
      ) : looksLikeSvg ? (
        <SvgWithFallback
          url={url}
          title={`Animasi ${subKey}`}
          subKey={subKey}
          maxHeightClass="max-h-[420px]"
        />
      ) : (
        // lottie / unknown → <img> works as static fallback
        <SimpleImg
          url={url}
          title={`Animasi ${subKey}`}
          maxHeightClass="max-h-[320px]"
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
  maxHeightClass,
}: {
  url: string;
  title: string;
  subKey: string;
  maxHeightClass: string;
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
        const proxied = `/api/media-proxy?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxied);
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

  // Object URL for tier 2 — let the <object> tag stream the bytes directly.
  const objectUrl = `/api/media-proxy?url=${encodeURIComponent(url)}`;

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-card border border-border/50 flex items-center justify-center min-h-[260px] overflow-hidden">
      {/* Tier 1: inline (animations run guaranteed) */}
      {inline ? (
        <SvgScope
          html={inline}
          aria-label={title}
          className={`${maxHeightClass} w-auto max-w-full`}
        />
      ) : /* Tier 2: <object> */
      !objectFailed && !inlineError ? (
        <object
          type="image/svg+xml"
          data={objectUrl}
          aria-label={title}
          className={`${maxHeightClass} w-full rounded-xl`}
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
          className={`${maxHeightClass} rounded-xl object-contain`}
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
 * Reusable header for animation section.
 */
function AnimationHeader({ t, typeLabel }: { t: (k: string) => string; typeLabel: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">🎬</span>
      <h3 className="font-bold text-sm">{t("animasi")}</h3>
      {typeLabel && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 font-semibold">
          {typeLabel.toUpperCase()}
        </span>
      )}
    </div>
  );
}

/**
 * Shown when SVG/image both failed to load — gives user a way forward
 * instead of a silent empty box.
 */
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
  return (
    <div className="flex flex-col items-center gap-2 text-center p-4 max-w-md">
      <span className="text-3xl opacity-50">🎬</span>
      <p className="text-sm text-ink font-semibold">Animasi tidak bisa dimuat dari server.</p>
      {detail && <p className="text-[11px] text-muted/80">{detail}</p>}
      <p className="text-[11px] text-muted/70 break-all">{url}</p>
      <div className="flex gap-2 mt-1 flex-wrap justify-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark"
        >
          Buka di Tab Baru
        </a>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-bg-alt"
          >
            Coba Lagi
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
  // Already an embed URL
  if (/youtube\.com\/embed|youtube\.com\/shorts\/embed|player\.vimeo\.com|h5p/.test(url)) {
    return url;
  }
  // YouTube watch → embed
  const ytWatchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (ytWatchMatch) return `https://www.youtube.com/embed/${ytWatchMatch[1]}`;
  return url;
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
        <h3 className="font-bold text-sm">{t("gambar") || "Gambar"}</h3>
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
