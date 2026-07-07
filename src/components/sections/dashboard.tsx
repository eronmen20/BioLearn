"use client";

import { BAB } from "@/lib/bab-data";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore, useProgressReady } from "@/lib/progress-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import { useBabArchiveIds, ALWAYS_VISIBLE_BABS } from "@/store/use-bab-archive";
import Link from "next/link";
import { BookOpen, CheckCircle, TrendingUp, Library, Loader2, Sparkles, Megaphone } from "lucide-react";

export function Dashboard() {
  const { t } = useLangStore();
  const mounted = useIsMounted();
  const hydrated = useProgressReady();
  const progress = useProgressStore();
  const { archivedIds, loaded: archiveLoaded } = useBabArchiveIds();
  const ready = mounted && hydrated;
  // Apply whitelist filter: only ALWAYS_VISIBLE babs by default; after
  // archiveLoaded, also exclude babs explicitly archived in DB.
  const visibleBabs = (mounted ? BAB.filter((b) => {
    if (!ALWAYS_VISIBLE_BABS.includes(b.id)) return false;
    if (archiveLoaded && archivedIds.has(b.id)) return false;
    return true;
  }) : BAB.filter((b) => ALWAYS_VISIBLE_BABS.includes(b.id)));
  const visibleSubCount = visibleBabs.reduce((s, b) => s + b.subs.length, 0);
  const visibleBabCount = visibleBabs.length;

  const totalQuizzes = ready ? progress.getTotalQuizzes() : 0;
  const totalCorrect = ready ? progress.getTotalCorrect() : 0;
  const totalQs = ready ? Object.values(progress.progress).reduce((s, p) => s + p.total, 0) : 0;
  // Count of fully completed visible babs
  const visibleBabIds = visibleBabs.map((b) => b.id);
  const completedBabs = ready
    ? visibleBabIds.filter((id) => {
        const p = progress.progress[id];
        return p && (p.completion_pct || 0) >= 100;
      }).length
    : 0;

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2" dangerouslySetInnerHTML={{ __html: t("welcome.title") }} />
        <p className="text-sm sm:text-base text-muted leading-relaxed max-w-2xl">{t("welcome.desc")}</p>

        {/* Stay-tuned banner — Materi baru akan di-update berkala */}
        <div className="mt-4 sm:mt-5 relative overflow-hidden flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-200/60 shadow-sm animate-fade-in-up">
          {/* Pulse ring glow di pojok */}
          <span className="absolute -top-1 -right-1 w-20 h-20 rounded-full bg-amber-300/30 blur-2xl animate-pulse-slow pointer-events-none" />
          <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Megaphone className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                Stay Tuned
              </span>
              <span className="text-[10px] font-semibold text-amber-700">
                Materi baru segera hadir
              </span>
            </div>
            <p className="text-sm text-ink leading-snug">
              Kami akan menambahkan <span className="font-bold text-amber-700">materi bab baru secara berkala</span>. Sementara ini, BAB Bakteri sudah lengkap untuk kamu pelajari.
              <span className="inline-flex items-center gap-0.5 ml-1 text-amber-600 font-semibold">
                <Sparkles className="w-3 h-3" /> Nantikan update selanjutnya!
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <StatCard icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />} num={visibleBabCount} label={t("stat.chapters")} sub={`${visibleSubCount} ${t("stat.subtopics").toLowerCase()}`} color="accent" />
        <StatCard icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />} num={totalQuizzes} label={t("stat.quiz")} sub={`${totalQs} ${t("stat.questions").toLowerCase()}`} color="green" />
        <StatCard icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />} num={`${completedBabs}/${visibleBabCount}`} label={t("stat.mastery")} sub={completedBabs === visibleBabCount && visibleBabCount > 0 ? `Selesai!` : `${Math.round((completedBabs / Math.max(1, visibleBabCount)) * 100)}%`} color="amber" />
        <StatCard icon={<Library className="w-4 h-4 sm:w-5 sm:h-5" />} num="24" label={t("stat.glossary")} sub={t("stat.bilingual")} color="blue" />
      </div>

      {/* Chapter Cards */}
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-bold">{t("browse.title")}</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {visibleBabs.map((b) => {
          const p = progress.getProgress(b.id);
          // Use completion_pct (bab done based) instead of quiz score.
          // completion_pct = sub-bab done + reflection done, in 0-100.
          const rawPct = mounted ? p.completion_pct || 0 : 0;
          const pct = Math.max(0, Math.min(100, rawPct));
          const quizzes = mounted ? p.quizzes : 0;
          return (
            <Link
              key={b.id}
              href={`/bab/${b.id}`}
              className="group card-lift bg-surface rounded-2xl p-4 sm:p-5 shadow-card border border-border/50 relative overflow-hidden active:scale-[0.98] touch-manipulation"
            >
              <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5" style={{ background: `linear-gradient(90deg, ${b.color}, ${b.color}88)` }} />
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 mt-1">{b.icon}</div>
              <h3 className="font-bold text-sm sm:text-base mb-1 group-hover:text-accent transition-colors">{t(`bab.${b.id}`)}</h3>
              <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-3 sm:mb-4">{t(`bab.${b.id}.desc`)}</p>
              <div className="flex items-center justify-between text-xs text-muted-2">
                <span className="flex items-center gap-1">📝 {quizzes}</span>
                <span className="flex items-center gap-1 font-medium text-ink">{pct}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${b.color}, ${b.color}88)` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon, num, label, sub, color }: { icon: React.ReactNode; num: number | string; label: string; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    accent: "bg-accent/10 text-accent",
    green: "bg-green-light text-green",
    amber: "bg-amber/10 text-amber",
    blue: "bg-blue/10 text-blue",
  };

  return (
    <div className="bg-surface rounded-2xl p-3.5 sm:p-5 shadow-card border border-border/50 card-lift">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${colorMap[color] || colorMap.accent}`}>
        {icon}
      </div>
      <div className="text-xl sm:text-2xl font-extrabold gradient-text mb-0.5">{num}</div>
      <div className="text-xs sm:text-sm text-muted font-medium">{label}</div>
      <div className="text-[10px] sm:text-xs text-muted-2 mt-0.5">{sub}</div>
    </div>
  );
}