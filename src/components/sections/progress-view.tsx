"use client";

import { BAB } from "@/lib/bab-data";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore, useProgressReady } from "@/lib/progress-store";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { useIsMounted } from "@/lib/use-is-mounted";

export function ProgressView() {
  const { t } = useLangStore();
  const mounted = useIsMounted();
  const hydrated = useProgressReady();
  const progress = useProgressStore();
  const ready = mounted && hydrated;

  const mastery = ready ? progress.getMastery() : 0;
  const totalQuizzes = ready ? progress.getTotalQuizzes() : 0;
  const totalCorrect = ready ? progress.getTotalCorrect() : 0;
  const totalQs = ready ? Object.values(progress.progress).reduce((s, p) => s + Math.max(0, p.total), 0) : 0;
  const totalCorrectClamped = Math.min(Math.max(0, totalCorrect), totalQs);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">📊 {t("progress.title")}</h1>
            <p className="text-sm sm:text-base text-muted leading-relaxed">{t("progress.desc")}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-surface rounded-2xl p-5 sm:p-6 shadow-card border border-border/50 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold gradient-text">{mastery}%</div>
          <p className="text-xs sm:text-sm text-muted mt-1">{t("stat.mastery")}</p>
        </div>
        <div className="bg-surface rounded-2xl p-6 shadow-card border border-border/50 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-light flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-green" />
          </div>
          <div className="text-3xl font-extrabold gradient-text">{totalCorrectClamped}/{totalQs}</div>
          <p className="text-sm text-muted mt-1">{t("quiz.correct")}</p>
        </div>
        <div className="bg-surface rounded-2xl p-6 shadow-card border border-border/50 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber/10 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-amber" />
          </div>
          <div className="text-3xl font-extrabold gradient-text">{totalQuizzes}</div>
          <p className="text-sm text-muted mt-1">{t("stat.quiz")}</p>
        </div>
      </div>

      {/* Overall bar */}
      <div className="bg-surface rounded-2xl p-6 shadow-card border border-border/50 mb-6">
        <h3 className="font-bold text-base mb-4">{t("progress.overall")}</h3>
        <div className="h-4 bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${mastery}%`, background: "linear-gradient(90deg, #6c5ce7, #00cec9)" }} />
        </div>
        <p className="text-center text-sm text-muted mt-2">{mastery}% {t("progress.completed")}</p>
      </div>

      {/* Per chapter */}
      <div className="bg-surface rounded-2xl p-6 shadow-card border border-border/50">
        <h3 className="font-bold text-base mb-5">{t("progress.chapter")}</h3>
        <div className="space-y-4">
          {BAB.map((b, i) => {
            const p = progress.getProgress(b.id);
            const pct = mounted && p.total > 0 ? Math.max(0, Math.min(100, Math.round((p.correct / p.total) * 100))) : 0;
            const quizzes = mounted ? p.quizzes : 0;
            const correct = mounted ? p.correct : 0;
            const total = mounted ? p.total : 0;
            return (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{b.icon}</span>
                    <span className="font-semibold text-sm">{t(`bab.${b.id}`)}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: pct > 0 ? "#6c5ce7" : "#9ca3af" }}>{pct}%</span>
                </div>
                <div className="h-2.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${b.color}, ${b.color}88)` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-2">{Math.min(correct, total)}/{total} {t("progress.correct")}</span>
                  <span className="text-xs text-muted-2">{quizzes} {t("progress.quizzes")}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-bg-alt rounded-xl border border-border/50 text-center">
          <p className="text-xs text-muted">💡 {t("progress.desc")}</p>
        </div>
      </div>
    </div>
  );
}