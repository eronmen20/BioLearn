"use client";

import Link from "next/link";
import { Sparkles, Lock, X } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";

/* ───────── GuestPreviewBanner (Banner atas pratinjau gratis materi Bakteri) ───────── */
export function GuestPreviewBanner({ onRegisterClick }: { onRegisterClick: () => void }) {
  return (
    <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-accent/10 via-purple-500/5 to-accent/5 border border-accent/20 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-ink">Pratinjau Terbuka: Materi Bakteri</span>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-accent text-white tracking-wider">
                Akses Bebas
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Kamu sedang menikmati sub-materi <strong>Karakteristik Bakteri</strong> tanpa perlu login. Untuk membuka sub-bab lanjutan, kuis, dan menyimpan progres, silakan daftar akun gratis!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link
            href="/login?mode=register&redirect=/bab/bakteri"
            className="flex-1 sm:flex-none text-center px-3.5 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-xs font-semibold transition-all shadow-xs hover:shadow active:scale-95 whitespace-nowrap"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/login?mode=login&redirect=/bab/bakteri"
            className="flex-1 sm:flex-none text-center px-3 py-2 bg-surface border border-border hover:border-accent text-ink rounded-lg text-xs font-semibold transition-all hover:bg-bg-alt active:scale-95 whitespace-nowrap"
          >
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────── GuestBottomHookCard (CTA konversi di bawah materi sub-bab 1) ───────── */
export function GuestBottomHookCard({
  nextSubTitle,
  onOpenModal,
}: {
  nextSubTitle?: string | null;
  onOpenModal: () => void;
}) {
  const { lang } = useLangStore();
  return (
    <div className="mt-6 mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-accent/10 via-purple-500/5 to-surface border border-accent/25 shadow-sm text-center relative overflow-hidden">
      <div className="relative z-10 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] sm:text-[11px] font-bold mb-2">
          <span>🚀</span> {lang === "en" ? "Unlock Full Bacteria Chapter" : "Buka Seluruh Bab Bakteri"}
        </div>
        <h3 className="text-sm sm:text-base font-bold text-ink mb-1.5">
          {lang === "en" ? "Interested in Learning More About Bacteria?" : "Tertarik Belajar Lebih Dalam tentang Bakteri?"}
        </h3>
        <p className="text-muted text-xs sm:text-[13px] leading-relaxed mb-4">
          {lang === "en" ? <>In the next sub-chapter ({nextSubTitle || "Bacterial Cell Structure"}), you will explore prokaryotic cell organelles, Gram staining, and virtual microscope labs!</> : <>Di sub-bab berikutnya ({nextSubTitle || "Struktur Sel Bakteri"}), kamu bisa mempelajari organel sel prokariotik, pewarnaan Gram positif vs negatif, serta praktikum mikroskop virtual!</>}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-md mx-auto">
          <Link
            href="/login?mode=register&redirect=/bab/bakteri"
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 text-center flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === "en" ? "Sign Up Free & Continue" : "Daftar Gratis & Lanjut"}</span>
          </Link>
          <button
            onClick={onOpenModal}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-surface hover:bg-bg-alt text-ink border border-border hover:border-accent rounded-xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Lock className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{lang === "en" ? "View Locked Features" : "Lihat Fitur Terkunci"}</span>
          </button>
        </div>
        <p className="text-[10px] text-muted-2 mt-2.5">
          {lang === "en" ? "⚡ 100% Free. Takes 30 seconds to sign up and unlock all materials." : "⚡ Gratis 100%. Cukup daftar 30 detik untuk membuka seluruh materi."}
        </p>
      </div>
    </div>
  );
}

/* ───────── AuthGateModal (Modal dialog ajakan daftar/login bagi tamu) ───────── */
export function AuthGateModal({
  isOpen,
  onClose,
  targetTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetTitle?: string | null;
}) {
  const { lang } = useLangStore();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-border/80 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-accent via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted hover:text-ink hover:bg-bg-alt transition-colors"
          aria-label={lang === "en" ? "Close" : "Tutup"}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-2xl shadow-inner">
              🔒
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                {lang === "en" ? "Registered Student Feature" : "Fitur Siswa Terdaftar"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-ink mt-1">
                {lang === "en" ? "Unlock Full Course Access" : "Buka Akses Penuh Materi"}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted leading-relaxed mb-5">
            {targetTitle ? (
              lang === "en" ? (
                <>
                  Sub-chapter <strong className="text-ink">{targetTitle}</strong> and other advanced features require a BioLearn account. Create a free account now to continue!
                </>
              ) : (
                <>
                  Sub-materi <strong className="text-ink">{targetTitle}</strong> dan fitur lanjutan lainnya membutuhkan akun BioLearn. Buat akun gratis sekarang untuk melanjutkan!
                </>
              )
            ) : (
              lang === "en" ? (
                <>
                  Continue your learning adventure by unlocking all chapter materials, interactive labs, and quizzes for free.
                </>
              ) : (
                <>
                  Lanjutkan petualangan belajarmu dengan membuka seluruh sub-bab materi, praktikum interaktif, dan kuis secara gratis.
                </>
              )
            )}
          </p>

          {/* Benefits */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-bg-alt/70 border border-border/60 mb-6">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <span className="text-accent text-base leading-none">📖</span>
              <span>{lang === "en" ? <><strong>Full Access to All Sub-Chapters:</strong> Cell Structure, Reproduction, Gram Staining, & Bacterial Roles</> : <><strong>Akses Lengkap Seluruh Sub-Bab:</strong> Struktur Sel, Reproduksi, Klasifikasi Gram, & Peranan Bakteri</>}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <span className="text-green text-base leading-none">🔬</span>
              <span>{lang === "en" ? <><strong>Virtual Labs & 3D Visuals:</strong> Directly observe microscopic specimens</> : <><strong>Praktikum Virtual & Visualisasi 3D:</strong> Amati preparat mikroskopis secara langsung</>}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <span className="text-amber-500 text-base leading-none">🏆</span>
              <span>{lang === "en" ? <><strong>Quizzes & In-depth Solutions:</strong> Test understanding with updated curriculum question banks</> : <><strong>Kuis & Pembahasan Mendalam:</strong> Uji pemahaman dengan bank soal kurikulum terbaru</>}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <span className="text-purple-500 text-base leading-none">📊</span>
              <span>{lang === "en" ? <><strong>Save Notes & Learning Progress:</strong> Track completion rate and quiz scores</> : <><strong>Simpan Catatan & Progres Belajar:</strong> Lacak persentase ketuntasan materi dan riwayat nilai kuis</>}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <Link
              href="/login?mode=register&redirect=/bab/bakteri"
              className="w-full py-3.5 px-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] text-center"
            >
              <Sparkles className="w-4 h-4" />
              {lang === "en" ? "Sign Up Free Now (30 Seconds)" : "Daftar Akun Gratis Sekarang (30 Detik)"}
            </Link>

            <Link
              href="/login?mode=login&redirect=/bab/bakteri"
              className="w-full py-3 px-4 bg-surface hover:bg-bg-alt border border-border text-ink font-semibold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 text-center"
            >
              {lang === "en" ? "Already have an account? Sign in here" : "Sudah Memiliki Akun? Masuk di Sini"}
            </Link>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-xs text-muted hover:text-ink underline transition-colors"
            >
              {lang === "en" ? "Maybe later, continue exploring free lessons" : "Nanti saja, tetap pelajari Karakteristik Bakteri"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
