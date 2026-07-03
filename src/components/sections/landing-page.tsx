"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { BookOpen, Brain, FlaskConical, Heart, ArrowRight, Sparkles, ChevronRight, Dna, Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/lib/theme-store";

const FLOATING_ITEMS = [
  { emoji: "🧬", x: "10%", y: "20%", delay: 0, duration: 6 },
  { emoji: "🔬", x: "85%", y: "15%", delay: 1, duration: 7 },
  { emoji: "🦠", x: "75%", y: "70%", delay: 2, duration: 5 },
  { emoji: "🧪", x: "15%", y: "75%", delay: 0.5, duration: 8 },
  { emoji: "🌿", x: "90%", y: "45%", delay: 1.5, duration: 6 },
  { emoji: "🫀", x: "5%", y: "50%", delay: 3, duration: 7 },
  { emoji: "🧠", x: "50%", y: "10%", delay: 2.5, duration: 9 },
  { emoji: "💉", x: "30%", y: "85%", delay: 0.8, duration: 6 },
  { emoji: "🐛", x: "65%", y: "25%", delay: 1.2, duration: 8 },
  { emoji: "🍃", x: "40%", y: "90%", delay: 2.8, duration: 5 },
];

const FEATURES = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Materi Lengkap",
    desc: "8 bab biologi lengkap dari sel, pencernaan, sirkulasi, saraf, bakteri, genetika, evolusi, hingga ekosistem.",
    color: "from-purple-500 to-indigo-500",
    bg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Kuis Interaktif",
    desc: "Uji pemahamanmu dengan kuis di setiap subbab. Langsung dapat feedback dan penjelasan!",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    iconColor: "text-pink-500",
  },
  {
    icon: <FlaskConical className="w-6 h-6" />,
    title: "Animasi & Visual",
    desc: "Visualisasi interaktif struktur sel, sistem pencernaan, dan DNA double helix.",
    color: "from-cyan-500 to-teal-500",
    bg: "bg-cyan-50",
    iconColor: "text-cyan-500",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Track Progress",
    desc: "Pantai penguasaanmu di setiap bab. Lihat statistik kuis dan mastery score.",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
];

const SUBJECTS = [
  { icon: "🧫", name: "Bakteri", kelas: "X", color: "from-emerald-400 to-green-500" },
  { icon: "🫀", name: "Sirkulasi", kelas: "XI", color: "from-red-400 to-rose-500" },
  { icon: "🧠", name: "Sistem Saraf", kelas: "XI", color: "from-violet-400 to-purple-500" },
  { icon: "🧬", name: "Genetika", kelas: "XII", color: "from-amber-400 to-orange-500" },
  { icon: "🦕", name: "Evolusi", kelas: "XII", color: "from-lime-400 to-green-500" },
  { icon: "🌿", name: "Ekologi", kelas: "XII", color: "from-teal-400 to-cyan-500" },
];

// AnimatedTitle - slide-up reveal animation
function AnimatedTitle() {
  return (
    <h1 className="text-[2.1rem] sm:text-[2.65rem] md:text-[4rem] font-extrabold mb-6 leading-tight">
      <div className="overflow-hidden">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="gradient-text">Belajar</span>{" "}
          <span className="gradient-text">Biologi</span>
        </motion.div>
      </div>
      <div className="overflow-hidden mt-1">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="bg-gradient-to-r from-[#fd79a8] via-[#fdcb6e] to-[#00cec9] bg-clip-text text-transparent">
            Jadi Menyenangkan
          </span>
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

// Floating Theme Switcher
function ThemeSwitcher() {
  const { resolved, setTheme } = useThemeStore();

  return (
    <motion.button
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-surface border-2 border-border shadow-lg flex items-center justify-center hover:border-accent hover:shadow-xl transition-all"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={resolved === "dark" ? "Mode Terang" : "Mode Gelap"}
    >
      {resolved === "dark" ? (
        <Sun className="w-5 h-5 text-yellow" />
      ) : (
        <Moon className="w-5 h-5 text-accent" />
      )}
    </motion.button>
  );
}

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0edff] via-white to-[#f0fdf4] overflow-hidden relative">
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
            Pembelajaran Biologi Interaktif
          </motion.div>

          {/* Title */}
          <AnimatedTitle />

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3 }}
          >
            Jelajahi 8 bab biologi dengan materi lengkap, kuis interaktif, animasi visual, dan progress tracking.
            Cocok untuk siswa SMA & persiapan kuliah.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="group flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-dark text-white rounded-full font-bold text-base sm:text-lg transition-all shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30"
              >
                Mulai Belajar
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
                Lihat Materi
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Illustration - DNA Helix */}
          <motion.div
            className="relative w-full max-w-md mx-auto h-[200px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.7 }}
          >
            <div className="absolute left-1/2 top-0 w-[4px] h-full bg-gradient-to-b from-transparent via-accent to-transparent opacity-30" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="relative w-[120px] h-[120px]"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/20 to-accent-2/20" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-accent/30 to-accent-2/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dna className="w-16 h-16 text-accent" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <span className="text-xs text-muted-2 font-medium">Scroll</span>
          <motion.div
            className="w-5 h-8 border-2 border-muted-2/30 rounded-full flex justify-center pt-1.5"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-2 bg-muted-2/50 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink mb-4">
              Kenapa <span className="gradient-text">BioLearn</span>?
            </h2>
            <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
              Belajar biologi nggak harus membosankan. Fitur lengkap untuk bantu kamu paham dan ingat.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {FEATURES.map((f, i) => (
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
                  <h3 className="font-bold text-ink mb-2">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-transparent to-[#f8f7ff]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink mb-4">
              Materi <span className="text-accent">Lengkap</span> untuk Semua Kelas
            </h2>
            <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
              Dari Kelas X sampai XII, semua tersedia dengan penjelasan detail dan visual menarik.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {SUBJECTS.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <motion.div
                  className="group relative p-4 sm:p-5 rounded-2xl bg-surface border border-border/50 shadow-card text-center cursor-pointer h-full"
                  whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(108,92,231,0.12)" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${s.color}`} />
                  <motion.div
                    className="text-3xl sm:text-4xl mb-2"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {s.icon}
                  </motion.div>
                  <div className="font-bold text-sm text-ink mb-1">{s.name}</div>
                  <div className="text-[10px] font-semibold text-muted-2 bg-border/50 px-2 py-0.5 rounded-full inline-block">
                    Kelas {s.kelas}
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            {[
              { num: "8", label: "Bab Lengkap", icon: "📚" },
              { num: "32+", label: "Subbab", icon: "📑" },
              { num: "100+", label: "Soal Kuis", icon: "❓" },
              { num: "2", label: "Bahasa", icon: "🌐" },
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
                  <div className="text-xs sm:text-sm text-muted font-medium">{s.label}</div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

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
                  Siap Belajar Biologi?
                </h2>
                <p className="text-white/80 text-sm sm:text-base mb-8 max-w-lg mx-auto">
                  Mulai petualangan belajarmu sekarang. Gratis, interaktif, dan menyenangkan!
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-accent font-bold rounded-full text-base sm:text-lg hover:bg-gray-50 transition-all shadow-xl"
                  >
                    Daftar Sekarang
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

      {/* Floating Theme Switcher */}
      <ThemeSwitcher />

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-border/50 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span className="font-extrabold">
              <span className="gradient-text">Bio</span>
              <span className="text-ink">Learn</span>
            </span>
          </div>
          <p>&copy; 2026 BioLearn. Dibuat dengan ❤️ untuk pelajar Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
