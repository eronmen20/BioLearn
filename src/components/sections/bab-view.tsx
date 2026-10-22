"use client";

import { useState } from "react";
import { useBabContent } from "@/lib/use-bab-content";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore } from "@/lib/progress-store";
import { useIsMounted } from "@/lib/use-is-mounted";
import { useAuthStore } from "@/lib/auth-store";
import { RichContentRenderer } from "@/components/rich-content-renderer";
import { AnalogiSection } from "@/components/analogi-card";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Modularized subcomponents
import { ObjectivesCard } from "@/components/bab/objectives-card";
import { ProgressBar, SubbabNav, ScrollToTopButton } from "@/components/bab/subbab-nav";
import {
  GuestPreviewBanner,
  GuestBottomHookCard,
  AuthGateModal,
} from "@/components/bab/auth-gate-modal";
import {
  AnimationSection,
  HotspotSection,
  PraktikumSection,
  StrukturSection,
  InlineAnimationSection,
  InlineVideoSection,
  InlineImageSection,
} from "@/components/bab/media-sections";
import { SubBabQuiz } from "@/components/bab/sub-bab-quiz";
import { ReflectionQuiz } from "@/components/bab/reflection-quiz";

/* ───────── BabContent (Refactored Modular Orchestrator) ───────── */
export function BabContent({
  babId,
  initialSubKey,
}: {
  babId: string;
  initialSubKey?: string | null;
}) {
  const { lang, t } = useLangStore();
  const progress = useProgressStore();
  const mounted = useIsMounted();
  const { isAuthenticated } = useAuthStore();
  const isHookBab = babId === "bakteri";
  const isGuestOnHook = isHookBab && mounted && !isAuthenticated;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTarget, setAuthModalTarget] = useState<string | null>(null);

  const handleRequireAuth = (targetTitle?: string) => {
    setAuthModalTarget(targetTitle || null);
    setAuthModalOpen(true);
  };

  const { data: content, loading, error } = useBabContent(babId);
  const [subIdx, setSubIdx] = useState(0);
  const [appliedDeepLink, setAppliedDeepLink] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"full" | "summary">("summary");
  const [showReflection, setShowReflection] = useState(false);

  // Loading skeleton
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-border-light rounded-xl" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-border-light rounded" />
            <div className="h-3 w-60 bg-border-light rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-border-light rounded-full" />
          <div className="h-8 w-24 bg-border-light rounded-full" />
          <div className="h-8 w-22 bg-border-light rounded-full" />
        </div>
        <div className="h-64 bg-border-light rounded-2xl" />
        <div className="h-48 bg-border-light rounded-2xl" />
      </div>
    );
  }

  // Error state — fetch failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red" />
        </div>
        <h3 className="text-lg font-bold text-ink mb-2">{t("auth.error")}</h3>
        <p className="text-sm text-muted max-w-sm mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t("quiz.again")}
        </button>
      </div>
    );
  }

  if (!content) {
    return <div className="text-center py-20 text-muted">{t("bab.notfound")}</div>;
  }

  const { bab, summary, full, subs, subTitles, subHooks, mediaBySub, objectives } = content;

  // Apply deep link ?sub= once
  if (!loading && !error && mounted && initialSubKey && appliedDeepLink !== initialSubKey) {
    setAppliedDeepLink(initialSubKey);
    const deepIdx = subs.indexOf(initialSubKey);
    if (deepIdx >= 0) {
      if (isGuestOnHook && deepIdx > 0) {
        setSubIdx(0);
        handleRequireAuth(subTitles?.[deepIdx]?.id || subs[deepIdx]);
      } else if (progress.isSubUnlocked(babId, initialSubKey, subs)) {
        setSubIdx(deepIdx);
      }
    }
  }

  const currentSubKey = subs[subIdx];
  const currentMedia = (mediaBySub && mediaBySub[currentSubKey]) || {
    video_url: "",
    image_url: "",
    animation_url: "",
    animation_type: "",
  };

  const completionPct = mounted ? progress.getCompletionPct(babId, subs) : 0;
  const prog = mounted ? progress.getProgress(babId) : null;
  const doneCount = subs.filter((s) => prog?.subs[s]?.done).length;

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectSub = (i: number) => {
    if (isGuestOnHook && i > 0) {
      handleRequireAuth(subTitles?.[i]?.id || subs[i]);
      return;
    }
    setShowReflection(false);
    setSubIdx(i);
    scrollToTop();
  };

  const nextSubTitle = (() => {
    const nextIdx = subIdx + 1;
    if (nextIdx >= subs.length) return null;
    const fromDb = subTitles?.[nextIdx];
    if (fromDb) {
      const titleForLang = lang === "en" ? fromDb.en || fromDb.id : fromDb.id || fromDb.en;
      if (titleForLang && titleForLang.trim()) return titleForLang;
    }
    return subs[nextIdx];
  })();

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

      {/* Guest Preview Notification Banner */}
      {isGuestOnHook && (
        <GuestPreviewBanner onRegisterClick={() => handleRequireAuth()} />
      )}

      {/* Capaian & Tujuan Pembelajaran */}
      <ObjectivesCard objectives={objectives} />

      {/* Progress Bar */}
      <ProgressBar completionPct={completionPct} doneCount={doneCount} totalCount={subs.length} />

      {/* Subbab Nav with lock/check */}
      <SubbabNav
        subs={subs}
        subTitles={subTitles}
        babId={babId}
        subIdx={showReflection ? -1 : subIdx}
        onSelect={handleSelectSub}
        reflectionActive={showReflection}
        onSelectReflection={() => {
          if (isGuestOnHook) {
            handleRequireAuth("Quiz Refleksi");
            return;
          }
          setShowReflection(true);
          scrollToTop();
        }}
        isGuestOnHook={isGuestOnHook}
        onRequireAuth={handleRequireAuth}
      />

      {/* Quiz Refleksi sebagai tampilan mandiri jika aktif */}
      {showReflection ? (
        <ReflectionQuiz babId={babId} allSubKeys={subs} />
      ) : (
        <>
          {/* Hook "Kenapa penting?" */}
          {(() => {
            const hook = subHooks?.[subIdx];
            const hookText = lang === "en" ? hook?.en || hook?.id : hook?.id || hook?.en;
            return hookText ? (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex items-start gap-3">
                <span className="text-xl leading-none mt-0.5">💡</span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                    {lang === "en" ? "Why does this matter?" : "Kenapa ini penting?"}
                  </p>
                  <p className="text-sm text-ink leading-relaxed">{hookText}</p>
                </div>
              </div>
            ) : null;
          })()}

          {/* View Toggle (Ringkasan vs Materi Lengkap) */}
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
                  <p className="text-[13.5px] sm:text-sm leading-relaxed text-ink/80">
                    {summary[lang]?.[subIdx] || summary.id?.[subIdx] || ""}
                  </p>
                </div>
              ) : (
                <RichContentRenderer
                  html={full[lang]?.[subIdx] || full.id?.[subIdx] || "<p>Konten belum tersedia</p>"}
                  lang={lang}
                />
              )}
            </div>
          </div>

          {/* Analogi Sehari-hari ("Ibaratnya Begini 💡") */}
          <AnalogiSection
            babId={babId}
            subKey={currentSubKey}
            subIdx={subIdx}
            lang={lang}
          />

          {/* Animation Viewer */}
          <InlineAnimationSection
            subKey={currentSubKey}
            subMedia={currentMedia}
          />

          {/* Video Section */}
          <InlineVideoSection
            subVideoUrl={currentMedia.video_url}
            babVideoId={bab.videoId || ""}
          />

          {/* Interactive Image */}
          <InlineImageSection
            imageUrl={currentMedia.image_url}
            altText={`${bab.id} ${currentSubKey}`}
          />

          {/* Interactive Hotspot */}
          <HotspotSection babId={bab.id} hotspotted={bab.hotspotted} />

          {/* Struktur & Fungsi */}
          <StrukturSection babId={babId} subBabKey={currentSubKey} lang={lang} />

          {/* Praktikum */}
          <PraktikumSection babId={babId} subBabKey={currentSubKey} lang={lang} />

          {/* Sub-bab Quiz (Secure Server-Verified) */}
          <SubBabQuiz
            babId={babId}
            subKey={subs[subIdx]}
            allSubKeys={subs}
            onContinue={subIdx < subs.length - 1 ? () => handleSelectSub(subIdx + 1) : undefined}
            nextSubTitle={nextSubTitle}
            isGuestOnHook={isGuestOnHook}
            onRequireAuth={handleRequireAuth}
          />

          {/* Bottom Hook Conversion Card khusus tamu */}
          {isGuestOnHook && subIdx === 0 && (
            <GuestBottomHookCard
              nextSubTitle={nextSubTitle}
              onOpenModal={() => handleRequireAuth(nextSubTitle || undefined)}
            />
          )}
        </>
      )}

      {/* Modal Ajakan Daftar/Login untuk Tamu */}
      <AuthGateModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        targetTitle={authModalTarget}
      />

      {/* Tombol melayang kembali ke atas */}
      <ScrollToTopButton />
    </div>
  );
}
