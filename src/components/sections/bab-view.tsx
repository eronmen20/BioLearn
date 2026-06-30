"use client";

import { useState } from "react";
import { BAB, type BabData } from "@/lib/bab-data";
import { QUIZ } from "@/lib/quiz-data";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore } from "@/lib/progress-store";
import { showToast } from "@/components/ui/toaster";
import { CheckCircle, XCircle, Lightbulb, ChevronRight, RotateCcw } from "lucide-react";

export function BabContent({ babId }: { babId: string }) {
  const { lang, t } = useLangStore();
  const bab = BAB.find((b) => b.id === babId);
  const [subIdx, setSubIdx] = useState(0);
  const [viewType, setViewType] = useState<"full" | "summary">("full");

  if (!bab) {
    return <div className="text-center py-20 text-muted">{t("bab.notfound")}</div>;
  }

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

      {/* Subbab Nav */}
      <SubbabNav bab={bab} subIdx={subIdx} onSelect={setSubIdx} />

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
              <p className="text-sm leading-relaxed text-muted">{bab.summary[lang][subIdx]}</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none [&_h3]:text-accent-dark [&_h3]:font-bold [&_p]:leading-relaxed [&_strong]:text-ink [&_em]:text-accent" dangerouslySetInnerHTML={{ __html: bab.full[lang][subIdx] }} />
          )}
        </div>
      </div>

      {/* Animation */}
      <AnimationSection bab={bab} lang={lang} />

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
      <HotspotSection bab={bab} lang={lang} />

      {/* Quiz */}
      <QuizSection babId={bab.id} subIdx={subIdx} />
    </div>
  );
}

function SubbabNav({ bab, subIdx, onSelect }: { bab: BabData; subIdx: number; onSelect: (i: number) => void }) {
  const { t } = useLangStore();
  const progress = useProgressStore();
  const p = progress.getProgress(bab.id);

  return (
    <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-5">
      {bab.subs.map((s, i) => {
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

function AnimationSection({ bab, lang }: { bab: BabData; lang: string }) {
  const { t } = useLangStore();

  if (bab.id === "sel") {
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

  if (bab.id === "pencernaan") {
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
      <div className="rounded-2xl p-8 text-center min-h-[180px] flex flex-col items-center justify-center shadow-card border border-border/50" style={{ background: `linear-gradient(135deg, ${bab.color}15, ${bab.color}08)` }}>
        <div className="text-5xl animate-glow">{bab.icon}</div>
        <div className="text-sm font-semibold text-muted mt-3">{t(`bab.${bab.id}`)}</div>
      </div>
    </div>
  );
}

function HotspotSection({ bab, lang }: { bab: BabData; lang: string }) {
  if (bab.hotspotted === "sel") {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🖼️</span>
          <h3 className="font-bold text-sm">{t("animasi.sel.title")}</h3>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-card border border-border/50">
          <div className="min-h-[280px] bg-gradient-to-br from-[#e8e5ff] to-[#d4d0ff] flex items-center justify-center p-5">
            <div className="w-[220px] h-[220px] border-[3px] border-dashed border-accent/30 rounded-full relative flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="text-sm text-center text-muted font-medium">
                🔬 {t("animasi.sel.hint")}
              </div>
              <HotspotDot style={{ top: "20%", left: "25%" }} label={t("hotspot.nukleus")} desc={t("hotspot.nukleus.desc")} />
              <HotspotDot style={{ top: "50%", right: "15%" }} label={t("hotspot.mito")} desc={t("hotspot.mito.desc")} />
              <HotspotDot style={{ bottom: "25%", left: "30%" }} label={t("hotspot.rekasar")} desc={t("hotspot.rekasar.desc")} />
              <HotspotDot style={{ bottom: "15%", right: "30%" }} label={t("hotspot.golgi")} desc={t("hotspot.golgi.desc")} />
            </div>
          </div>
          <p className="text-xs text-muted-2 text-center py-2 bg-bg-alt">{t("hotspot.click")}</p>
        </div>
      </div>
    );
  }

  if (bab.hotspotted === "pencernaan") {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🖼️</span>
          <h3 className="font-bold text-sm">{t("animasi.pencernaan.title")}</h3>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-card border border-border/50">
          <div className="min-h-[320px] bg-gradient-to-b from-[#fff7ed] to-[#fef3c7] flex items-center justify-center p-5">
            <div className="relative h-[260px] flex flex-col items-center gap-[2px]">
              <div className="w-[60px] h-[20px] bg-red rounded-t-lg flex items-center justify-center text-[9px] text-white font-semibold">{t("hotspot.mulut")}</div>
              <div className="w-[14px] h-[30px] bg-[#d63031] rounded-full cursor-pointer hover:scale-110 transition-transform" onClick={() => showToast(t("hotspot.esofagus"))} />
              <div className="w-[40px] h-[35px] bg-red rounded-[50%_50%_30%_30%] flex items-center justify-center text-[8px] text-white font-semibold cursor-pointer hover:scale-110 transition-transform" onClick={() => showToast(t("hotspot.lambung.desc"))}>
                {t("hotspot.lambung")}
              </div>
              <div className="w-[12px] h-[50px] bg-[#fab1a0] flex items-center justify-center flex-wrap cursor-pointer hover:scale-110 transition-transform" onClick={() => showToast(t("hotspot.usushalus"))}>
                {[1, 2, 3].map((i) => (<div key={i} className="w-[4px] h-[8px] bg-red rounded-sm mx-px" />))}
              </div>
              <div className="w-[30px] h-[20px] bg-green rounded-md flex items-center justify-center text-[7px] text-white font-semibold cursor-pointer hover:scale-110 transition-transform" onClick={() => showToast(t("hotspot.ususbesar.desc"))}>
                {t("hotspot.ususbesar")}
              </div>
              <p className="text-[9px] text-muted mt-1">{t("organ.click")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function HotspotDot({ style, label, desc }: { style: React.CSSProperties; label: string; desc: string }) {
  return (
    <div className="absolute w-[24px] h-[24px] rounded-full bg-accent/70 border-[3px] border-white shadow-md cursor-pointer transition-transform hover:scale-130 animate-pulse-dot z-10" style={style} onClick={() => showToast(desc)}>
      <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 bg-ink text-white px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20">{label}</div>
    </div>
  );
}

function QuizSection({ babId, subIdx }: { babId: string; subIdx: number }) {
  const { lang, t } = useLangStore();
  const progress = useProgressStore();
  const [quizIdx, setQuizIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState(false);

  const bab = BAB.find((b) => b.id === babId);
  const qs = QUIZ[babId];
  if (!qs || !bab) return null;

  const qPerSub = Math.ceil(qs.length / bab.subs.length);
  const startIdx = subIdx * qPerSub;
  const subQs = qs.slice(startIdx, Math.min(startIdx + qPerSub, qs.length));
  if (subQs.length === 0) return null;

  const currentQ = subQs[quizIdx % subQs.length];
  const letters = ["A", "B", "C", "D"];
  const subKey = `${babId}.sub${subIdx + 1}`;
  const isCorrect = selected === currentQ.ans;

  const handleSelect = (idx: number) => {
    if (checked) return;
    setSelected(idx);
  };

  const handleCheck = () => {
    if (selected === null) {
      showToast(t("quiz.select"));
      return;
    }
    setChecked(true);
    progress.recordAnswer(babId, subKey, isCorrect);
  };

  const handleNext = () => {
    if (quizIdx + 1 >= subQs.length) {
      setCompleted(true);
      showToast(`${t("quiz.complete")} 🎉`);
      setQuizIdx(0);
    } else {
      setQuizIdx(quizIdx + 1);
    }
    setSelected(null);
    setChecked(false);
  };

  const handleRetry = () => {
    setQuizIdx(0);
    setSelected(null);
    setChecked(false);
    setCompleted(false);
  };

  const p = progress.getProgress(babId);
  const subP = p.subs[subKey] || { done: false };

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border/50 overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
          <div>
            <h2 className="text-lg font-bold">{t("quiz.title")}</h2>
            <p className="text-muted text-xs sm:text-sm mt-0.5">
              {t(`bab.${babId}`)} — {t(bab.subs[subIdx])}
              {subP.done && <span className="ml-2">✅</span>}
            </p>
          </div>
          <div className="text-sm font-bold text-accent bg-accent/5 px-3 py-1.5 rounded-full w-fit">
            📊 {p.correct}/{p.total}
          </div>
        </div>

        {completed ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">{t("quiz.complete")}</h3>
            <p className="text-muted mb-6">
              {t("quiz.score")}: {p.correct}/{p.total}
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-semibold text-sm hover:bg-accent-dark transition-all shadow-sm hover:shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              {t("quiz.again")}
            </button>
          </div>
        ) : (
          <>
            {/* Question */}
            <div className="flex items-start gap-3 mb-5">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                {quizIdx + 1}
              </span>
              <p className="font-semibold leading-relaxed pt-1">{currentQ.q[lang]}</p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2.5 mb-5">
              {currentQ.opts[lang].map((o, i) => {
                let bgClass = "bg-surface border-border hover:border-accent-light hover:bg-accent/[0.03]";
                if (checked) {
                  if (i === currentQ.ans) bgClass = "border-green bg-green-light/50 hover:bg-green-light/50";
                  else if (i === selected) bgClass = "border-red bg-red-light/50 hover:bg-red-light/50";
                  else bgClass = "border-border/50 opacity-60";
                } else if (i === selected) {
                  bgClass = "border-accent bg-accent/5";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`flex items-center gap-3 p-3.5 sm:p-4 min-h-[48px] rounded-xl border-2 text-sm leading-snug transition-all touch-manipulation ${bgClass} ${checked ? "cursor-default" : "cursor-pointer active:scale-[0.98]"}`}
                    disabled={checked}
                  >
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      checked
                        ? i === currentQ.ans ? "bg-green text-white" : i === selected ? "bg-red text-white" : "bg-border text-muted"
                        : i === selected ? "bg-accent text-white" : "bg-border text-muted"
                    }`}>{letters[i]}</span>
                    <span className="text-left">{o}</span>
                    {checked && i === currentQ.ans && <CheckCircle className="w-4 h-4 text-green ml-auto flex-shrink-0" />}
                    {checked && i === selected && i !== currentQ.ans && <XCircle className="w-4 h-4 text-red ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {checked && currentQ.explanation && (
              <div className={`p-4 rounded-xl mb-5 border ${isCorrect ? "bg-green-light/30 border-green/20" : "bg-red-light/30 border-red/20"}`}>
                <div className="flex items-start gap-2">
                  <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCorrect ? "text-green" : "text-red"}`} />
                  <div>
                    <p className="text-xs font-semibold text-ink mb-1">
                      {isCorrect ? t("quiz.explanation") : t("quiz.correct_answer") + " " + currentQ.opts[lang][currentQ.ans]}
                    </p>
                    <p className="text-sm text-muted leading-relaxed">{currentQ.explanation[lang]}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback for old questions without explanation */}
            {checked && !currentQ.explanation && (
              <div className={`p-4 rounded-xl mb-5 border ${isCorrect ? "bg-green-light/30 border-green/20" : "bg-red-light/30 border-red/20"}`}>
                <p className="text-sm flex items-center gap-2">
                  {isCorrect ? (
                    <><CheckCircle className="w-4 h-4 text-green" /> {t("quiz.correct")} 🎉</>
                  ) : (
                    <><XCircle className="w-4 h-4 text-red" /> {t("quiz.wrong")} — {t("quiz.correct_answer")} {currentQ.opts[lang][currentQ.ans]}</>
                  )}
                </p>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={checked ? handleNext : handleCheck}
              className="w-full py-3.5 sm:py-3 bg-accent hover:bg-accent-dark text-white rounded-full font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98] touch-manipulation min-h-[48px]"
            >
              {checked ? (
                <>{t("quiz.next")} <ChevronRight className="w-4 h-4" /></>
              ) : (
                t("quiz.check")
              )}
            </button>

            {/* Progress */}
            <div className="flex justify-between items-center mt-5 pt-4 border-t border-border/50">
              <span className="text-xs font-semibold text-muted">
                {quizIdx + 1} / {subQs.length}
              </span>
              <div className="h-2 bg-border rounded-full flex-1 mx-4 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-500" style={{ width: `${((quizIdx + 1) / subQs.length) * 100}%` }} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}