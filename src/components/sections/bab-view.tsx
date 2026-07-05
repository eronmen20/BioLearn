"use client";

import { useState, useEffect } from "react";
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
  const [viewType, setViewType] = useState<"full" | "summary">("full");

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

  const { bab, summary, full, quiz, subs, mediaBySub, source } = content;

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
              className="prose prose-sm max-w-none [&_h3]:text-accent-dark [&_h3]:font-bold [&_p]:leading-relaxed [&_strong]:text-ink [&_em]:text-accent"
              dangerouslySetInnerHTML={{
                __html: full[lang]?.[subIdx] || full.id?.[subIdx] || "<p>Konten belum tersedia</p>",
              }}
            />
          )}
        </div>
      </div>

      {/* Animation — per-sub override or hardcoded fallback */}
      <InlineAnimationSection
        subKey={currentSubKey}
        subMedia={currentMedia}
        fallbackbabId={bab.id}
        fallbackColor={bab.color}
        fallbackIcon={bab.icon}
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
      <StrukturSection babId={bab.id} lang={lang} />

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

/* ───────── SubbabNav (with lock/check) ───────── */
function SubbabNav({
  subs,
  babId,
  subIdx,
  onSelect,
}: {
  subs: string[];
  babId: string;
  subIdx: number;
  onSelect: (i: number) => void;
}) {
  const { t } = useLangStore();
  const progress = useProgressStore();
  const mounted = useIsMounted();

  return (
    <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-5">
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
              {t(s)}
            </span>
          </button>
        );
      })}
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

    fetch(`/api/admin/quiz-v2?bab_id=${babId}&sub_bab_key=${subKey}`)
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
    const passed = score >= 70;

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
            ❌ Skor minimal 70% untuk lanjut. Coba lagi ya!
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

    fetch(`/api/admin/quiz-v2?bab_id=${babId}&sub_bab_key=is_reflection`)
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
    const passed = score >= 70;

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
              ❌ Skor minimal 70%. Coba lagi ya!
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
function StrukturSection({ babId, lang }: { babId: string; lang: "id" | "en" }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/struktur?bab_id=${babId}`)
      .then((r) => r.json())
      .then((data) => setItems(data.struktur || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [babId]);

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
 * Falls back to the hardcoded bab-level AnimationSection when no per-sub override.
 */
function InlineAnimationSection({
  subKey,
  subMedia,
  fallbackbabId,
  fallbackColor,
  fallbackIcon,
}: {
  subKey: string;
  subMedia: { video_url: string; image_url: string; animation_url: string; animation_type: string };
  fallbackbabId: string;
  fallbackColor: string;
  fallbackIcon: string;
}) {
  const { t } = useLangStore();

  if (subMedia.animation_url) {
    const url = animUrlAsEmbed(subMedia.animation_url);
    const isFullBleed = subMedia.animation_type === "iframe" || subMedia.animation_type === "h5p";
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎬</span>
          <h3 className="font-bold text-sm">{t("animasi")}</h3>
          {subMedia.animation_type && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 font-semibold">
              {subMedia.animation_type.toUpperCase()}
            </span>
          )}
        </div>
        {isFullBleed ? (
          <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden bg-black shadow-card border border-border/50">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={url}
              title={`Animasi ${subKey}`}
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <div className="bg-surface rounded-2xl p-4 shadow-card border border-border/50 flex items-center justify-center">
            <img
              src={subMedia.animation_url}
              alt={`Animasi ${subKey}`}
              className="max-h-[320px] rounded-xl object-contain"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
      </div>
    );
  }

  // No per-sub override → use existing bab-level fallback
  return <AnimationSection babId={fallbackbabId} color={fallbackColor} icon={fallbackIcon} />;
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
