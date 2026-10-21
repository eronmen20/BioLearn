"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { FlaskConical, ArrowRight, Sparkles, ChevronRight, ChevronDown, Dna, Clock, Bell, Eye, Globe, Megaphone } from "lucide-react";
import { useActiveBanners } from "@/store/use-active-banners";
import { useBabArchiveIds, ALWAYS_VISIBLE_BABS } from "@/store/use-bab-archive";
import { useLangStore } from "@/lib/lang-store";
import { useAuthStore } from "@/lib/auth-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import { LearnModes, MiniQuiz, RealWorldIssues, Eyebrow } from "@/components/sections/landing-interactive";

export interface HomepageSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  show_banner: boolean;
  show_pengumuman: boolean;
  show_materi_terbaru: boolean;
  show_statistik: boolean;
  meta_title: string;
  meta_description: string;
  // ── Section konsep (opsional; kosong = pakai teks default) ──
  pillars_title?: string;
  pillars_desc?: string;
  pillar1_title?: string;
  pillar1_desc?: string;
  pillar2_title?: string;
  pillar2_desc?: string;
  pillar3_title?: string;
  pillar3_desc?: string;
  modes_eyebrow?: string;
  modes_title?: string;
  modes_desc?: string;
  tab_lihat_title?: string;
  tab_lihat_desc?: string;
  tab_coba_title?: string;
  tab_coba_desc?: string;
  tab_isu_title?: string;
  tab_isu_desc?: string;
  tab_uji_title?: string;
  tab_uji_desc?: string;
  quiz_title?: string;
  quiz_desc?: string;
  quiz_q?: string;
  quiz_opt_true?: string;
  quiz_opt_false?: string;
  quiz_explain?: string;
  quiz_answer?: number;
  issues_eyebrow?: string;
  issues_title?: string;
  issues_desc?: string;
  issue1_title?: string;
  issue1_desc?: string;
  issue2_title?: string;
  issue2_desc?: string;
  issue3_title?: string;
  issue3_desc?: string;
  issues_cta?: string;
  cta_ready?: string;
  cta_desc?: string;
  cta_register?: string;
}

// Ambil teks settings (trim); kosong/undefined/bukan-string = "" sehingga fallback ke i18n
export function settingsText(v: unknown): string {
  if (typeof v === "number") return String(v);
  return typeof v === "string" ? v.trim() : "";
}

// Hero description/subtitle lines — editable via admin settings
function HeroDesc({ settings }: { settings?: HomepageSettings }) {
  const { t } = useLangStore();
  const desc = settings?.hero_subtitle?.trim() || "Jelajahi 8 bab biologi dengan materi lengkap, kuis, animasi, dan tracking progress.\nCocok untuk siswa SMA & persiapan kuliah.";
  const lines = desc.split("\n");
  return (
    <motion.p
      className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-8 leading-relaxed"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.3 }}
    >
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <><br /></>}
        </span>
      ))}
    </motion.p>
  );
}

const FLOATING_ITEMS = [
  { emoji: "🧬", x: "10%", y: "20%", delay: 0, duration: 6 },
  { emoji: "🔬", x: "85%", y: "15%", delay: 1, duration: 7 },
  { emoji: "🦠", x: "75%", y: "70%", delay: 2, duration: 5 },
  { emoji: "🧪", x: "15%", y: "75%", delay: 0.5, duration: 8 },
  { emoji: "🌿", x: "90%", y: "45%", delay: 1.5, duration: 6 },
  { emoji: "🫀", x: "5%", y: "50%", delay: 3, duration: 7 },
  { emoji: "🧠", x: "22%", y: "18%", delay: 2.5, duration: 9 },
  { emoji: "💉", x: "30%", y: "85%", delay: 0.8, duration: 6 },
  { emoji: "🐛", x: "65%", y: "25%", delay: 1.2, duration: 8 },
  { emoji: "🍃", x: "40%", y: "90%", delay: 2.8, duration: 5 },
];

const PILLARS = [
  {
    icon: <Eye className="w-6 h-6" />,
    titleField: "pillar1_title" as const,
    titleKey: "landing.pillar1_title",
    descField: "pillar1_desc" as const,
    descKey: "landing.pillar1_desc",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    icon: <FlaskConical className="w-6 h-6" />,
    titleField: "pillar2_title" as const,
    titleKey: "landing.pillar2_title",
    descField: "pillar2_desc" as const,
    descKey: "landing.pillar2_desc",
    bg: "bg-cyan-50",
    iconColor: "text-cyan-500",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    titleField: "pillar3_title" as const,
    titleKey: "landing.pillar3_title",
    descField: "pillar3_desc" as const,
    descKey: "landing.pillar3_desc",
    bg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
];

const SUBJECTS = [
  { id: "bakteri", icon: "🧫", name: "Bakteri", kelas: "X", color: "from-emerald-400 to-green-500", subs: 4 },
  { id: "virus", icon: "🧫", name: "Virus", kelas: "X", color: "from-purple-400 to-indigo-500", subs: 6 },
  { id: "sel", icon: "🔬", name: "Sel", kelas: "XI", color: "from-blue-400 to-cyan-500", subs: 4 },
  { id: "pencernaan", icon: "🍽️", name: "Pencernaan", kelas: "XI", color: "from-orange-400 to-amber-500", subs: 4 },
  { id: "sirkulasi", icon: "🫀", name: "Sirkulasi", kelas: "XI", color: "from-red-400 to-rose-500", subs: 4 },
  { id: "syaraf", icon: "🧠", name: "Sistem Saraf", kelas: "XI", color: "from-violet-400 to-purple-500", subs: 4 },
  { id: "genetika", icon: "🧬", name: "Genetika", kelas: "XII", color: "from-amber-400 to-orange-500", subs: 4 },
  { id: "evolusi", icon: "🦕", name: "Evolusi", kelas: "XII", color: "from-lime-400 to-green-500", subs: 4 },
  { id: "ekosistem", icon: "🌿", name: "Ekologi", kelas: "XII", color: "from-teal-400 to-cyan-500", subs: 4 },
];

// AnimatedTitle - slide-up reveal animation
function AnimatedTitle({ heroTitle }: { heroTitle?: string }) {
  const { t } = useLangStore();
  const title = heroTitle?.trim() || "Belajar Biologi Jadi Menyenangkan";
  return (
    <h1 className="text-[2.1rem] sm:text-[2.65rem] md:text-[4rem] font-extrabold mb-6 leading-tight">
      <div className="overflow-hidden">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="gradient-rainbow">{title}</span>
        </motion.div>
      </div>
    </h1>
  );
}

// AnimatedSection - scroll-triggered animation
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 80 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}


export function LandingPage({ settings }: { settings?: HomepageSettings }) {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const { archivedIds, loaded: archiveLoaded } = useBabArchiveIds();
  const { banners: activeBanners } = useActiveBanners();
  const { t } = useLangStore();
  const { isAuthenticated } = useAuthStore();
  const mounted = useIsMounted();
  const isGuest = mounted && !isAuthenticated;
  const showMateri = settings?.show_materi_terbaru !== false;
  const showStatistik = settings?.show_statistik !== false;
  const heroCta = settings?.hero_cta?.trim() || t("landing.cta_start");
  const visibleSubjects = SUBJECTS.filter((s) => {
    if (!ALWAYS_VISIBLE_BABS.includes(s.id)) return false;
    if (archiveLoaded && archivedIds.has(s.id)) return false;
    return true;
  });
  const archivedCount = SUBJECTS.length - visibleSubjects.length;

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Floating Biology Elements */}
      {FLOATING_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl sm:text-4xl opacity-20 pointer-events-none"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 0.2,
            scale: 1,
            y: [0, -15, 10, 0],
            rotate: [0, 5, -3, 0],
          }}
          transition={{
            opacity: { duration: 1, delay: item.delay },
            scale: { duration: 0.8, delay: item.delay },
            y: { duration: item.duration, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: item.duration, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Hero Section */}
      <motion.section
        className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            {t("landing.badge")}
          </motion.div>

          {/* Title */}
          <AnimatedTitle heroTitle={settings?.hero_title} />

          {/* Subtitle */}
          <HeroDesc settings={settings} />

          {/* Pillar chips */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.4 }}
          >
            {[
              { icon: <Eye className="w-3.5 h-3.5" />, label: t("landing.pillar_visual") },
              { icon: <FlaskConical className="w-3.5 h-3.5" />, label: t("landing.pillar_interactive") },
              { icon: <Globe className="w-3.5 h-3.5" />, label: t("landing.pillar_issues") },
            ].map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface border border-border/60 shadow-sm text-xs sm:text-sm font-semibold text-ink"
              >
                <span className="text-accent">{p.icon}</span>
                {p.label}
              </span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="group flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-dark text-white rounded-full font-bold text-base sm:text-lg transition-all shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30"
              >
                {heroCta}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-ink border-2 border-border rounded-full font-bold text-base sm:text-lg transition-all hover:border-accent/30"
              >
                {t("landing.cta_view")}
              </Link>
            </motion.div>
          </motion.div>

          {/* Elegant Biological Nexus & Scroll Cue */}
          <motion.div
            className="flex flex-col items-center mt-2 sm:mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.7 }}
          >
            {/* Bioluminescent Glass Core */}
            <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 mb-1.5">
              {/* Ambient radial blur aura */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent/25 via-teal-400/20 to-purple-400/20 blur-xl animate-pulse-slow pointer-events-none" />

              {/* Orbital Ring 1: Counter-clockwise subtle dash */}
              <motion.div
                className="absolute inset-0 rounded-full border border-dashed border-accent/30 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              />

              {/* Orbital Ring 2: Clockwise with luminous particle */}
              <motion.div
                className="absolute inset-2 sm:inset-2.5 rounded-full border border-accent/20 pointer-events-none"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {/* Luminous satellite particle */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
              </motion.div>

              {/* Center Glass Sphere */}
              <motion.div
                className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-surface/85 border border-white/80 dark:border-white/15 shadow-[0_8px_25px_rgba(108,92,231,0.18)] backdrop-blur-md flex items-center justify-center group"
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Gentle floating DNA Helix (Smooth breathing motion, not a 2D windmill) */}
                <motion.div
                  animate={{
                    y: [-2.5, 2.5, -2.5],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-accent flex items-center justify-center"
                >
                  <Dna className="w-8 h-8 sm:w-9 sm:h-9 text-accent group-hover:text-accent-dark transition-colors drop-shadow-xs" />
                </motion.div>
              </motion.div>
            </div>

            {/* Connecting subtle gradient light beam */}
            <div className="w-[1.5px] h-5 bg-gradient-to-b from-accent/40 via-accent/20 to-transparent" />

            {/* Modern Glass Mouse & Scroll Cue */}
            <Link
              href="#cara-belajar"
              className="group flex flex-col items-center gap-1 pt-1 text-muted hover:text-accent transition-colors cursor-pointer"
            >
              <div className="w-5 h-8 rounded-full border-[1.5px] border-accent/40 bg-white/70 dark:bg-surface/70 backdrop-blur-xs flex justify-center pt-1.5 shadow-xs group-hover:border-accent transition-colors">
                <motion.div
                  className="w-1 h-2 bg-accent rounded-full"
                  animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-extrabold tracking-[0.2em] uppercase text-muted-2 group-hover:text-accent transition-colors mt-0.5">
                <span>{t("landing.scroll") || "Scroll"}</span>
                <ChevronDown className="w-3 h-3 text-accent group-hover:translate-y-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Pillars Section */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink mb-4">
              {settingsText(settings?.pillars_title) || t("landing.pillars_title")}
            </h2>
            <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
              {settingsText(settings?.pillars_desc) || t("landing.pillars_desc")}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {PILLARS.map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <motion.div
                  className="group p-6 rounded-2xl bg-surface border border-border/50 shadow-card h-full"
                  whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(108,92,231,0.12)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 ${f.iconColor}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {f.icon}
                  </motion.div>
                  <h3 className="font-bold text-ink mb-2">{settingsText(settings?.[f.titleField]) || t(f.titleKey)}</h3>
                  <p className="text-sm text-muted leading-relaxed">{settingsText(settings?.[f.descField]) || t(f.descKey)}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to learn — interactive tabs */}
      <section id="cara-belajar" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-transparent to-[#f8f7ff] scroll-mt-16">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-10 sm:mb-12">
            <Eyebrow>{settingsText(settings?.modes_eyebrow) || t("landing.modes_eyebrow")}</Eyebrow>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink mb-4">
              {settingsText(settings?.modes_title) || t("landing.modes_title")}
            </h2>
            <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
              {settingsText(settings?.modes_desc) || t("landing.modes_desc")}
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <LearnModes settings={settings} />
          </AnimatedSection>
        </div>
      </section>

      {/* Mini quiz teaser */}
      <section id="coba-soal" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 scroll-mt-16">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection>
            <MiniQuiz settings={settings} />
          </AnimatedSection>
        </div>
      </section>

      {/* Banners aktif dari Admin Panel */}
      {activeBanners.length > 0 && (
        <section className="relative z-10 px-4 sm:px-6 mb-6">
          <div className="max-w-4xl mx-auto space-y-3">
            {activeBanners.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/10 via-purple-50 to-pink-50 border border-accent/20 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {b.image_url ? (
                    <img src={b.image_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Megaphone className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-ink truncate">{b.judul}</h4>
                    {b.deskripsi && (
                      <p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-2 mt-0.5">{b.deskripsi}</p>
                    )}
                  </div>
                </div>
                {b.link_url && (
                  <a
                    href={b.link_url}
                    className="flex-shrink-0 px-4 py-2 bg-accent text-white hover:bg-accent-dark text-xs font-semibold rounded-xl transition-all shadow-xs"
                    target={b.link_url.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    Buka →
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Stay-tuned banner — only when some babs are archived */}
      {archiveLoaded && archivedCount > 0 && (
        <section className="relative z-10 px-4 sm:px-6 mb-6 sm:mb-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-rose-900/20 border-2 border-dashed border-amber-500/40 p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg text-ink mb-1">
                    📡 {t("landing.stay_tuned_title")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {t("landing.stay_tuned_desc")} {archivedCount > 0 && <span>{t("landing.archived_note").replace("{count}", String(archivedCount))}</span>}
                  </p>
                  <p className="text-[10px] text-muted mt-2 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t("landing.stay_tuned_note")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Subjects Preview */}
      {showMateri && (
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-transparent to-[#f8f7ff]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink mb-4">
              {t("landing.subjects_title")}
            </h2>
            <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
              {t("landing.subjects_desc")}
            </p>
          </AnimatedSection>

          <div className={`grid gap-3 sm:gap-4 ${
              visibleSubjects.length <= 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-lg mx-auto"
                : visibleSubjects.length <= 4
                ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl mx-auto"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            }`}>
            {visibleSubjects.map((s, i) => (
              <AnimatedSection key={s.id} delay={i * 0.08}>
                <Link href={`/bab/${s.id}`}>
                  <motion.div
                    className="group relative p-4 sm:p-5 rounded-2xl bg-surface border border-border/50 shadow-card text-center cursor-pointer h-full overflow-hidden"
                    whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(108,92,231,0.15)" }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Top gradient bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${s.color}`} />
                    {/* Hover glow */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${s.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />

                    {/* Free Preview Hook Tag */}
                    {s.id === "bakteri" && isGuest && (
                      <div className="absolute top-2.5 right-2.5 z-20">
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-accent text-white shadow-sm tracking-wider animate-pulse">
                          ✨ Akses Bebas
                        </span>
                      </div>
                    )}
                    
                    <motion.div
                      className="text-3xl sm:text-4xl mb-2 relative z-10"
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {s.icon}
                    </motion.div>
                    <div className="font-bold text-sm text-ink mb-1 relative z-10">{s.name}</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[10px] font-semibold text-muted bg-border/50 px-2 py-0.5 rounded-full">
                        {t("landing.kelas_label").replace("{kelas}", s.kelas)}
                      </span>
                      <span className="text-[10px] text-muted-2">{t("landing.sub_count").replace("{count}", String(s.subs))}</span>
                    </div>
                    {/* Arrow indicator on hover */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-accent" />
                    </div>
                  </motion.div>
                </Link>
              </AnimatedSection>
            ))}
            {/* Placeholder slot for archived subjects */}
            {archiveLoaded && archivedCount > 0 && (
              <AnimatedSection className="col-span-full" delay={(visibleSubjects.length + 1) * 0.08}>
                <div className="rounded-2xl border-2 border-dashed border-border bg-bg-alt/40 p-4 sm:p-5 text-center">
                  <div className="text-xs sm:text-sm text-muted inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t("landing.more_coming")}
                  </div>
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Real-world issues */}
      <section id="isu-nyata" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-transparent to-[#f8f7ff] scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <Eyebrow>{settingsText(settings?.issues_eyebrow) || t("landing.issues_eyebrow")}</Eyebrow>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink mb-4">
              {settingsText(settings?.issues_title) || t("landing.issues_title")}
            </h2>
            <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
              {settingsText(settings?.issues_desc) || t("landing.issues_desc")}
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <RealWorldIssues settings={settings} />
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section */}
      {showStatistik && (
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            {[
              { num: archiveLoaded ? String(visibleSubjects.length) : "…", labelKey: "landing.stat_active", icon: "📚" },
              { num: archiveLoaded && archivedCount > 0 ? `+${archivedCount}` : "—", labelKey: "landing.coming_soon", icon: "🚀" },
              { num: "32+", labelKey: "landing.stat_subs", icon: "📑" },
              { num: "100+", labelKey: "landing.stat_quiz", icon: "❓" },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <motion.div
                  className="p-5 sm:p-6 rounded-2xl bg-surface border border-border/50 shadow-card"
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="text-2xl mb-2"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {s.icon}
                  </motion.div>
                  <div className="text-2xl sm:text-3xl font-extrabold gradient-text mb-1">{s.num}</div>
                  <div className="text-xs sm:text-sm text-muted font-medium">{t(s.labelKey)}</div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <motion.div
              className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-accent via-accent-dark to-[#4834d4] text-white text-center overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Decorative */}
              <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"
                animate={{ scale: [1.2, 1, 1.2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute top-1/2 right-10 text-5xl opacity-20">🧬</div>
              <div className="absolute bottom-4 left-10 text-4xl opacity-15">🔬</div>

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
                  {settingsText(settings?.cta_ready) || t("landing.cta_ready")}
                </h2>
                <p className="text-white/80 text-sm sm:text-base mb-8 max-w-lg mx-auto">
                  {settingsText(settings?.cta_desc) || t("landing.cta_desc")}
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-accent font-bold rounded-full text-base sm:text-lg hover:bg-gray-50 transition-all shadow-xl"
                  >
                    {settingsText(settings?.cta_register) || t("landing.cta_register")}
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-border/50 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span className="font-extrabold">
              <span className="gradient-text">Bio</span>
              <span className="text-ink">Learn</span>
            </span>
          </div>
          <p>&copy; 2026 BioLearn. {t("landing.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
