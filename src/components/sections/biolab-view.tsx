"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, BookOpen, ChevronRight, Lock, Sparkles, X } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";
import { useAuthStore } from "@/lib/auth-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import { PraktikumViewer } from "@/components/praktikum-viewer";

interface LabModule {
  id: number;
  bab_id: string;
  sub_bab_key: string | null;
  title_id: string;
  title_en: string;
  description_id: string;
  description_en: string;
  image_url: string | null;
  image_alt: string | null;
  steps: { step?: number; instruction?: string; instruction_en?: string }[];
  flashcards: { name: string; name_en?: string; description: string; description_en?: string; x: number; y: number }[];
  difficulty: string;
}

const DIFF_STYLE: Record<string, string> = {
  mudah: "bg-green-500/15 text-green-700",
  sedang: "bg-yellow-500/15 text-yellow-700",
  sulit: "bg-red-500/15 text-red-700",
};

/* ───────── Daftar modul ───────── */

export function BioLabList() {
  const { lang } = useLangStore();
  const { isAuthenticated } = useAuthStore();
  const mounted = useIsMounted();
  const isGuest = mounted && !isAuthenticated;

  const [modules, setModules] = useState<LabModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [targetModuleTitle, setTargetModuleTitle] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/praktikum?bab_id=all", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (alive) {
          setModules(data.praktikum || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-border-light rounded-xl" />
        <div className="h-56 bg-border-light rounded-2xl" />
      </div>
    );
  }

  // Modul id=1 (Difusi Cakram) tidak ditampilkan di daftar — ia diwakili
  // kartu simulasi di atas & tetap bisa dibuka lewat tombol "Prosedur lengkap".
  const stepModules = modules.filter((m) => m.id !== 1);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-2xl sm:text-3xl">🧪</span>
          <h1 className="text-xl sm:text-2xl font-extrabold">BioLab</h1>
        </div>
        <p className="text-muted text-xs sm:text-sm">
          {lang === "en"
            ? "Virtual practicum: follow the steps, observe, and conclude just like in a real laboratory."
            : "Praktikum virtual: ikuti langkahnya, amati, lalu simpulkan seperti di laboratorium sungguhan."}
        </p>
      </div>

      {/* Simulasi interaktif unggulan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: BioChem Lab */}
        <Link href="/biolab/biochem">
          <div className="group relative p-5 rounded-3xl text-white overflow-hidden shadow-card hover:-translate-y-1 transition-all h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            <div className="absolute top-0 right-6 text-6xl opacity-20 group-hover:scale-110 transition-transform">⚗️</div>
            <div className="absolute bottom-0 left-10 text-4xl opacity-15">🧪</div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
                    {lang === "en" ? "Biochemical Dry-Lab" : "Lab Biokimia Virtual"}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 shadow-xs">
                    ⭐ NEW
                  </span>
                </div>
                <p className="font-extrabold text-base sm:text-lg leading-snug mb-1">
                  BioChem Lab
                </p>
                <p className="text-white/80 text-xs sm:text-sm mb-4">
                  {lang === "en"
                    ? "Investigate food biomolecules, simulate enzyme kinetics, and generate virtual lab reports."
                    : "Uji biomolekul pangan, simulasikan kinetika enzim, dan susun laporan praktikum virtual."}
                </p>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-purple-700 px-4 py-2 rounded-full group-hover:gap-2.5 transition-all shadow-sm">
                  {lang === "en" ? "Enter BioChem Lab" : "Masuk BioChem Lab"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Card 2: Zona Hambat */}
        <Link href="/biolab/zona-hambat">
          <div className="group relative p-5 rounded-3xl text-white overflow-hidden shadow-card hover:-translate-y-1 transition-all h-full bg-gradient-to-br from-accent via-accent-dark to-[#4834d4]">
            <div className="absolute top-0 right-6 text-6xl opacity-20 group-hover:scale-110 transition-transform">🧫</div>
            <div className="absolute bottom-0 left-10 text-4xl opacity-15">🦠</div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
                    {lang === "en" ? "Interactive Dry-Lab" : "Simulasi Interaktif"}
                  </span>
                  {isGuest && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 shadow-xs">
                      ✨ {lang === "en" ? "Open Access" : "Akses Bebas"}
                    </span>
                  )}
                </div>
                <p className="font-extrabold text-base sm:text-lg leading-snug mb-1">
                  {lang === "en" ? "Antibiotic Inhibition Zone" : "Zona Hambat Antibiotik"}
                </p>
                <p className="text-white/80 text-xs sm:text-sm mb-4">
                  {lang === "en"
                    ? "Place discs on a virtual petri dish, incubate, and flip the resistant strain to see resistance happen."
                    : "Taruh cakram di cawan virtual, inkubasi, dan aktifkan strain resisten untuk melihat resistensi terjadi."}
                </p>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-accent px-4 py-2 rounded-full group-hover:gap-2.5 transition-all shadow-sm">
                  {lang === "en" ? "Run simulation" : "Jalankan simulasi"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Card 2: Mikroskop Virtual */}
        <Link href="/biolab/mikroskop">
          <div className="group relative p-5 rounded-3xl text-white overflow-hidden shadow-card hover:-translate-y-1 transition-all h-full bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700">
            <div className="absolute top-0 right-6 text-6xl opacity-20 group-hover:scale-110 transition-transform">🔬</div>
            <div className="absolute bottom-0 left-10 text-4xl opacity-15">🌿</div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20">
                    {lang === "en" ? "Optical Dry-Lab" : "Lab Optik Virtual"}
                  </span>
                  {isGuest && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 shadow-xs">
                      ✨ {lang === "en" ? "2 Free Samples" : "2 Preparat Gratis"}
                    </span>
                  )}
                </div>
                <p className="font-extrabold text-base sm:text-lg leading-snug mb-1">
                  {lang === "en" ? "Virtual Microscope Lab" : "Laboratorium Mikroskop Virtual"}
                </p>
                <p className="text-white/80 text-xs sm:text-sm mb-4">
                  {lang === "en"
                    ? "Observe stomata, onion cells, chick embryos, and other microscopic specimens interactively."
                    : "Amati stomata daun, sel epidermis bawang, embrio ayam, hingga preparat mikroskopis lainnya secara interaktif."}
                </p>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-teal-700 px-4 py-2 rounded-full group-hover:gap-2.5 transition-all shadow-sm">
                  {lang === "en" ? "Open microscope" : "Buka mikroskop"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
      {stepModules.length > 0 && (
        <div className="space-y-3">
          {stepModules.map((m, i) => {
            const title = lang === "en" ? m.title_en || m.title_id : m.title_id;
            const desc = lang === "en" ? m.description_en || m.description_id : m.description_id;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.3) }}
              >
                {isGuest ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetModuleTitle(title);
                      setShowAuthModal(true);
                    }}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-dashed border-accent/40 shadow-card hover:-translate-y-0.5 transition-transform">
                      <div className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/20 text-accent flex items-center justify-center font-extrabold flex-shrink-0">
                        <Lock className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                            {lang === "en" ? "Student Members Only" : "Khusus Akun Siswa"}
                          </span>
                          <span className="text-[11px] text-muted">{m.bab_id}</span>
                        </div>
                        <p className="font-bold text-ink leading-snug group-hover:text-accent transition-colors">{title}</p>
                        {desc && <p className="text-xs text-muted line-clamp-1 mt-0.5">{desc}</p>}
                      </div>
                      <span className="text-xs text-accent font-semibold px-3 py-1.5 rounded-xl bg-accent/10 group-hover:bg-accent group-hover:text-white transition-colors shrink-0">
                        Daftar
                      </span>
                    </div>
                  </button>
                ) : (
                  <Link href={`/biolab/${m.id}`}>
                    <div className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-border/50 shadow-card hover:-translate-y-0.5 transition-transform">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white flex items-center justify-center font-extrabold flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${DIFF_STYLE[m.difficulty] || DIFF_STYLE.sedang}`}>
                            {m.difficulty || "sedang"}
                          </span>
                          <span className="text-[11px] text-muted">{m.bab_id}</span>
                        </div>
                        <p className="font-bold text-ink leading-snug group-hover:text-accent transition-colors">{title}</p>
                        {desc && <p className="text-xs text-muted line-clamp-1 mt-0.5">{desc}</p>}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Ajakan Daftar untuk Modul BioLab */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border/80 overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-accent via-purple-500 to-pink-500" />
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-muted hover:text-ink hover:bg-bg-alt transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-xl shadow-inner">
                  🧪
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    Khusus Akun Siswa
                  </span>
                  <h3 className="text-lg font-bold text-ink mt-0.5">
                    {lang === "en" ? "Unlock BioLab Practical Modules" : "Buka Modul Praktikum BioLab"}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed mb-4">
                {lang === "en" ? <>Practical module <strong className="text-ink">{targetModuleTitle}</strong> and interactive procedures are only available with a registered account. Sign up free now!</> : <>Modul praktikum <strong className="text-ink">{targetModuleTitle}</strong> dan panduan langkah kerja interaktif hanya tersedia untuk akun terdaftar BioLearn. Daftar akun gratis sekarang!</>}
              </p>

              <div className="space-y-2 p-3.5 rounded-2xl bg-bg-alt/70 border border-border/60 mb-5 text-xs text-ink">
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span>{lang === "en" ? "Step-by-step real laboratory procedures guide" : "Panduan langkah demi langkah prosedur praktikum riil"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎴</span>
                  <span>{lang === "en" ? "Equipment, material, and lab safety identification flashcards" : "Flashcard identifikasi alat, bahan, dan keselamatan kerja"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span>{lang === "en" ? "Record and track experimental observation worksheets" : "Catat dan pantau lembar kerja hasil pengamatan"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/login?mode=register&redirect=/biolab"
                  className="w-full py-3 px-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 text-center"
                >
                  <Sparkles className="w-4 h-4" />
                  {lang === "en" ? "Sign Up Free (30 Seconds)" : "Daftar Akun Gratis (30 Detik)"}
                </Link>
                <Link
                  href="/login?mode=login&redirect=/biolab"
                  className="w-full py-2.5 px-4 bg-surface hover:bg-bg-alt border border-border text-ink font-semibold rounded-xl text-xs sm:text-sm transition-all text-center block"
                >
                  {lang === "en" ? "Already have an account? Sign in here" : "Sudah Memiliki Akun? Masuk di Sini"}
                </Link>
              </div>

              <div className="mt-3 text-center">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-[11px] text-muted hover:text-ink underline transition-colors"
                >
                  {lang === "en" ? "Maybe later, stay on BioLab" : "Nanti saja, tetap di halaman BioLab"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Detail modul ───────── */

export function BioLabDetail({ id }: { id: string }) {
  const { lang } = useLangStore();
  const [mod, setMod] = useState<LabModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/praktikum?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        const row = (data.praktikum || [])[0];
        if (row) setMod(row);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => {
        if (alive) {
          setLoading(false);
          setNotFound(true);
        }
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 bg-border-light rounded-xl" />
        <div className="h-64 bg-border-light rounded-2xl" />
      </div>
    );
  }

  if (notFound || !mod) {
    return (
      <div className="text-center py-20">
        <p className="text-muted mb-4">{lang === "en" ? "Module not found." : "Modul tidak ditemukan."}</p>
        <Link href="/biolab" className="text-accent font-semibold text-sm hover:underline">
          ← BioLab
        </Link>
      </div>
    );
  }

  const materialHref = mod.sub_bab_key
    ? `/bab/${mod.bab_id}?sub=${encodeURIComponent(mod.sub_bab_key)}`
    : `/bab/${mod.bab_id}`;

  return (
    <div className="animate-fade-in-up max-w-3xl mx-auto">
      <Link href="/biolab" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        BioLab
      </Link>

      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-4 sm:p-6 md:p-8 mb-5">
        <PraktikumViewer
          title={mod.title_id}
          title_en={mod.title_en}
          description={mod.description_id}
          description_en={mod.description_en}
          steps={mod.steps || []}
          image_url={mod.image_url}
          image_alt={mod.image_alt}
          flashcards={mod.flashcards || []}
          difficulty={mod.difficulty}
          lang={lang}
        />
      </div>

      {/* Simulasi pendamping modul pilot (id=1: Difusi Cakram) */}
      {mod.id === 1 && (
        <Link href="/biolab/zona-hambat">
          <div className="group relative p-5 rounded-2xl text-white overflow-hidden shadow-card hover:-translate-y-0.5 transition-transform mb-5 bg-gradient-to-br from-accent via-accent-dark to-[#4834d4]">
            <div className="absolute top-0 right-6 text-6xl opacity-20 group-hover:scale-110 transition-transform">🧫</div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-extrabold text-sm sm:text-base">
                  {lang === "en" ? "Run the interactive simulation" : "Jalankan simulasi interaktifnya"}
                </p>
                <p className="text-white/80 text-xs">
                  {lang === "en" ? "Virtual petri dish with resistant-strain toggle" : "Cawan virtual dengan toggle strain resisten"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-accent px-4 py-2 rounded-full group-hover:gap-2.5 transition-all flex-shrink-0">
                {lang === "en" ? "Simulate" : "Simulasi"}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="p-5 rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-white flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold flex-1">
          {lang === "en"
            ? "Understand the theory behind this practicum in the full lesson."
            : "Pahami teori di balik praktikum ini di materi lengkap."}
        </p>
        <Link
          href={materialHref}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-accent text-sm font-bold hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          {lang === "en" ? "Open lesson" : "Buka materi"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
