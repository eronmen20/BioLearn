"use client";

import { BAB } from "@/lib/bab-data";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore, useProgressReady } from "@/lib/progress-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import { useBabArchiveIds, ALWAYS_VISIBLE_BABS } from "@/store/use-bab-archive";
import { useDashboardSettings } from "@/store/use-dashboard-settings";
import { useActiveBanners } from "@/store/use-active-banners";
import Link from "next/link";
import { BookOpen, CheckCircle, TrendingUp, Library, Loader2, Sparkles, Megaphone, ArrowRight } from "lucide-react";

export function Dashboard() {
  const { t, lang } = useLangStore();
  const mounted = useIsMounted();
  const hydrated = useProgressReady();
  const progress = useProgressStore();
  const { archivedIds, subKeysByBab, loaded: archiveLoaded } = useBabArchiveIds();
  const { settings: dashSettings } = useDashboardSettings();
  const { banners: activeBanners } = useActiveBanners();
  const ready = mounted && hydrated;
  // Apply whitelist filter: only ALWAYS_VISIBLE babs by default; after
  // archiveLoaded, also exclude babs explicitly archived in DB.
  const visibleBabs = (mounted ? BAB.filter((b) => {
    if (!archiveLoaded) return ALWAYS_VISIBLE_BABS.includes(b.id);
    if (archivedIds.has(b.id)) return false;
    return true;
  }) : BAB.filter((b) => ALWAYS_VISIBLE_BABS.includes(b.id)));
  const visibleSubCount = visibleBabs.reduce((s, b) => s + b.subs.length, 0);
  const visibleBabCount = visibleBabs.length;

  const totalQuizzes = ready ? progress.getTotalQuizzes() : 0;
  const totalCorrect = ready ? progress.getTotalCorrect() : 0;
  const totalQs = ready ? Object.values(progress.progress).reduce((s, p) => s + p.total, 0) : 0;
  // Live per-bab completion (sama rumusnya dengan halaman bab: sub-bab done +
  // refleksi dibagi TOTAL sub-bab). Key sub-bab dipakai dari DB (sub_bab)
  // supaya identik dengan key yang direkam quiz di halaman bab.
  const pctForBab = (babId: string): number => {
    if (!ready) return 0;
    const keys =
      archiveLoaded && subKeysByBab[babId]?.length
        ? subKeysByBab[babId]
        : (BAB.find((b) => b.id === babId)?.subs ?? []);
    return progress.getCompletionPct(babId, keys);
  };
  // Count of fully completed visible babs
  const visibleBabIds = visibleBabs.map((b) => b.id);
  const completedBabs = visibleBabIds.filter((id) => pctForBab(id) >= 100).length;

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-2xl sm:text-3xl font-extrabold mb-2"
          dangerouslySetInnerHTML={{
            __html: lang === "en" ? dashSettings?.welcome_title_en?.trim() || t("welcome.title") : dashSettings?.welcome_title?.trim() || t("welcome.title"),
          }}
        />
        <p className="text-sm sm:text-base text-muted leading-relaxed max-w-2xl">
          {lang === "en" ? dashSettings?.welcome_desc_en?.trim() || t("welcome.desc") : dashSettings?.welcome_desc?.trim() || t("welcome.desc")}
        </p>

        {/* Stay-tuned banner — Materi baru akan di-update berkala (dapat dikontrol admin) */}
        {(dashSettings?.show_banner ?? true) && (
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
                  {dashSettings?.banner_badge?.trim() || t("dashboard.stay_tuned")}
                </span>
                <span className="text-[10px] font-semibold text-amber-700">
                  {dashSettings?.banner_title?.trim() || t("dashboard.new_material_soon")}
                </span>
              </div>
              <p className="text-sm text-ink leading-snug">
                {dashSettings?.banner_desc?.trim() || t("dashboard.material_desc")}
                {(dashSettings?.banner_cta?.trim() || t("dashboard.stay_tuned_cta")) && (
                  <span className="inline-flex items-center gap-0.5 ml-1 text-amber-600 font-semibold">
                    <Sparkles className="w-3 h-3" /> {dashSettings?.banner_cta?.trim() || t("dashboard.stay_tuned_cta")}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Published Banners from Admin Panel */}
        {activeBanners.length > 0 && (
          <div className="mt-4 space-y-3">
            {activeBanners.map((b) => (
              <div
                key={b.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/10 via-purple-50 to-pink-50 border border-accent/20 p-4 flex items-center justify-between gap-4 shadow-sm animate-fade-in-up"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {b.image_url ? (
                    <img src={b.image_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Megaphone className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-ink">{b.judul}</h4>
                    {b.deskripsi && (
                      <p className="text-xs text-muted leading-relaxed mt-0.5">{b.deskripsi}</p>
                    )}
                  </div>
                </div>
                {b.link_url && (
                  <a
                    href={b.link_url}
                    className="flex-shrink-0 px-3.5 py-1.5 bg-accent text-white hover:bg-accent-dark text-xs font-semibold rounded-xl transition-all shadow-xs"
                    target={b.link_url.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    Buka →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <StatCard icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />} num={visibleBabCount} label={t("stat.chapters")} sub={`${visibleSubCount} ${t("stat.subtopics").toLowerCase()}`} color="accent" />
        <StatCard icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />} num={totalQuizzes} label={t("stat.quiz")} sub={`${totalQs} ${t("stat.questions").toLowerCase()}`} color="green" />
        <StatCard icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />} num={`${completedBabs}/${visibleBabCount}`} label={t("stat.mastery")} sub={completedBabs === visibleBabCount && visibleBabCount > 0 ? t("dashboard.complete") : `${Math.round((completedBabs / Math.max(1, visibleBabCount)) * 100)}%`} color="amber" />
        <StatCard icon={<Library className="w-4 h-4 sm:w-5 sm:h-5" />} num="24" label={t("stat.glossary")} sub={t("stat.bilingual")} color="blue" />
      </div>

      {/* Fitur Unggulan Interaktif (BioLab & BioNow) */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-ink flex items-center gap-2">
            <span>✨</span>
            <span>{lang === "en" ? "Explore Interactive Features" : "Eksplor Fitur Interaktif"}</span>
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: BioLab */}
          <Link href="/biolab" className="group">
            <div className="relative p-5 sm:p-6 rounded-3xl text-white overflow-hidden shadow-card hover:-translate-y-1 transition-all duration-300 h-full bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 flex flex-col justify-between">
              <div className="absolute top-2 right-4 text-7xl opacity-15 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 pointer-events-none select-none">
                🔬
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
                    {lang === "en" ? "Virtual Laboratory" : "Laboratorium Virtual"}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-300 text-emerald-950 shadow-xs">
                    {lang === "en" ? "Interactive" : "Simulasi Aktif"}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl leading-snug mb-1.5">
                  BioLab
                </h3>
                <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-4 max-w-sm">
                  {lang === "en"
                    ? "Interactive dry-labs: virtual microscope, antibiotic inhibition zone, and BioChem food & enzyme reactions."
                    : "Simulasi praktikum interaktif: mikroskop virtual, uji daya hambat bakteri, dan BioChem Lab (uji makanan & enzim)."}
                </p>
              </div>
              <div className="relative z-10 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-800 px-4 py-2 rounded-full group-hover:gap-2.5 transition-all shadow-sm">
                  {lang === "en" ? "Enter BioLab" : "Buka BioLab"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: BioNow */}
          <Link href="/bionow" className="group">
            <div className="relative p-5 sm:p-6 rounded-3xl text-white overflow-hidden shadow-card hover:-translate-y-1 transition-all duration-300 h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col justify-between">
              <div className="absolute top-2 right-4 text-7xl opacity-15 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 pointer-events-none select-none">
                🧬
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
                    {lang === "en" ? "Science Insights" : "Wawasan Sains"}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-300 text-pink-950 shadow-xs">
                    {lang === "en" ? "Latest Issues" : "Isu Terkini"}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl leading-snug mb-1.5">
                  BioNow
                </h3>
                <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-4 max-w-sm">
                  {lang === "en"
                    ? "Discover real-world biology articles, superbug phenomena, breakthroughs, and scientific infographics."
                    : "Eksplor artikel sains biologi dunia nyata, infografis terkini, fenomena resistensi, dan fakta menarik."}
                </p>
              </div>
              <div className="relative z-10 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-purple-800 px-4 py-2 rounded-full group-hover:gap-2.5 transition-all shadow-sm">
                  {lang === "en" ? "Read BioNow" : "Jelajahi BioNow"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Chapter Cards */}
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-bold">{t("browse.title")}</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {visibleBabs.map((b) => {
          const p = progress.getProgress(b.id);
          // Live same-formula completion (bab SELESAI berdasarkan total sub-bab
          // + refleksi), konsisten dengan halaman bab.
          const rawPct = pctForBab(b.id);
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