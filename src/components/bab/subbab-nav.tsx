"use client";

import { useEffect, useState } from "react";
import { Lock, Check, Trophy, ArrowUp } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore } from "@/lib/progress-store";
import { useIsMounted } from "@/lib/use-is-mounted";

/* ───────── ProgressBar ───────── */
export function ProgressBar({
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
export function SubbabNav({
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

        {/* Quiz Refleksi — item nav terpisah */}
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

/* ───────── ScrollToTopButton ───────── */
export function ScrollToTopButton() {
  const { lang } = useLangStore();
  const [visible, setVisible] = useState(false);
  const mounted = useIsMounted();

  useEffect(() => {
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
