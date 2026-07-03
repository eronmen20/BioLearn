"use client";

import { useState } from "react";
import { useBabContent } from "@/lib/use-bab-content";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore } from "@/lib/progress-store";
import { showToast } from "@/components/ui/toaster";
import { CheckCircle, XCircle, Lightbulb, ChevronRight, RotateCcw, Database } from "lucide-react";

export function BabContent({ babId }: { babId: string }) {
  const { lang, t } = useLangStore();
  const content = useBabContent(babId);
  const [subIdx, setSubIdx] = useState(0);
  const [viewType, setViewType] = useState<"full" | "summary">("full");

  if (!content) {
    return <div className="text-center py-20 text-muted">{t("bab.notfound")}</div>;
  }

  const { bab, summary, full, quiz, subs, source } = content;

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

      {/* Subbab Nav */}
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

      {/* Animation */}
      <AnimationSection babId={bab.id} color={bab.color} icon={bab.icon} />

      {/* Video */}
      {bab.videoId && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">▶</span>
            <h3 className="font-bold text-sm">{t("video")}</h3>
          </div>
          <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden bg-black shadow-card">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${bab.videoId}`}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Interactive Image */}
      <HotspotSection babId={bab.id} hotspotted={bab.hotspotted} />

      {/* Quiz */}
      <QuizSection babId={bab.id} quiz={quiz} subIdx={subIdx} />
    </div>
  );
}

function SubbabNav({ subs, babId, subIdx, onSelect }: { subs: string[]; babId: string; subIdx: number; onSelect: (i: number) => void }) {
  const { t } = useLangStore();
  const progress = useProgressStore();
  const p = progress.getProgress(babId);

  return (
    <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-5">
      {subs.map((s, i) => {
        const subP = p.subs[s] || { done: false };
        const isActive = i === subIdx;
        return (
          <button
            key={s}
            onClick={() => onSelect(i)}
            className={`relative px-3 sm:px-4 py-2 sm:py-2 rounded-full text-xs font-semibold border-2 transition-all touch-manipulation active:scale-[0.97] ${
              isActive
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-surface text-muted border-border hover:border-accent-light hover:text-accent"
            }`}
          >
            {t(s)}
            {subP.done && <span className="ml-1">✅</span>}
          </button>
        );
      })}
    </div>
  );
}

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

function QuizSection({ babId, quiz, subIdx }: { babId: string; quiz: import("@/lib/quiz-data").QuizQuestion[]; subIdx: number }) {
  const { lang, t } = useLangStore();
  const progress = useProgressStore();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const questions = quiz;
  if (questions.length === 0) return null;

  const q = questions[currentQ];
  const isCorrect = selected === q.ans;

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
    progress.recordAnswer(babId, `sub.${babId}${subIdx + 1}`, isCorrect);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setChecked(false);
    } else {
      setShowResult(true);
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
    return (
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-6 text-center">
        <h3 className="text-lg font-bold mb-2">{t("quiz.complete")}</h3>
        <p className="text-3xl font-extrabold text-accent mb-2">{score}%</p>
        <p className="text-sm text-muted mb-4">
          {correctCount}/{questions.length} {t("quiz.correct")}
        </p>
        <button onClick={handleRetry} className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors">
          <RotateCcw className="w-4 h-4 inline mr-2" />
          {t("quiz.again")}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border/50 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">{t("quiz.title")}</h3>
          <span className="text-xs text-muted">
            {currentQ + 1}/{questions.length}
          </span>
        </div>

        <p className="text-sm font-medium mb-4">{q.q[lang] || q.q.id}</p>

        <div className="space-y-2 mb-4">
          {q.opts[lang]?.map((opt: string, i: number) => {
            const optText = q.opts[lang]?.[i] || q.opts.id?.[i] || "";
            return (
              <button
                key={i}
                onClick={() => !checked && setSelected(i)}
                disabled={checked}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all ${
                  checked
                    ? i === q.ans
                      ? "border-green bg-green-light text-green"
                      : i === selected && !isCorrect
                      ? "border-red bg-red-light text-red"
                      : "border-border text-muted"
                    : selected === i
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border hover:border-accent-light text-ink"
                }`}
              >
                {optText}
              </button>
            );
          })}
        </div>

        {checked && (
          <div className={`p-4 rounded-xl mb-4 ${isCorrect ? "bg-green-light" : "bg-red-light"}`}>
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <CheckCircle className="w-4 h-4 text-green" />
              ) : (
                <XCircle className="w-4 h-4 text-red" />
              )}
              <span className={`text-sm font-semibold ${isCorrect ? "text-green" : "text-red"}`}>
                {isCorrect ? t("quiz.correct") : t("quiz.wrong")}
              </span>
            </div>
            {q.explanation && (
              <div className="flex items-start gap-2 mt-2">
                <Lightbulb className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted">
                  {q.explanation[lang] || q.explanation.id}
                </p>
              </div>
            )}
          </div>
        )}

        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {t("quiz.check")}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2"
          >
            {currentQ < questions.length - 1 ? t("quiz.next") : t("quiz.result")}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
