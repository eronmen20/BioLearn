"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";

interface PraktikumCard {
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  x: number;
  y: number;
}

interface PraktikumStep {
  step?: number;
  instruction?: string;
  instruction_en?: string;
}

interface PraktikumViewerProps {
  title: string;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  steps?: PraktikumStep[];
  image_url?: string | null;
  image_alt?: string | null;
  flashcards?: PraktikumCard[];
  difficulty?: string;
  lang?: "id" | "en";
}

export function PraktikumViewer({
  title,
  title_en,
  description,
  description_en,
  steps = [],
  image_url,
  image_alt,
  flashcards = [],
  difficulty,
  lang = "id",
}: PraktikumViewerProps) {
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const { t } = useLangStore();

  const DIFFICULTY_BADGE_LOCAL: Record<string, { label: string; color: string }> = {
    mudah: { label: `🟢 ${t("diff.easy")}`, color: "bg-green-500/15 text-green-700" },
    sedang: { label: `🟡 ${t("diff.medium")}`, color: "bg-yellow-500/15 text-yellow-700" },
    sulit: { label: `🔴 ${t("diff.hard")}`, color: "bg-red-500/15 text-red-700" },
  };

  const diff = DIFFICULTY_BADGE_LOCAL[difficulty ?? "sedang"] || DIFFICULTY_BADGE_LOCAL.sedang;

  // Bilingual content display — chrome stays Indonesian
  const praktikumTitle = lang === "en" ? title_en || title : title;
  const desc = lang === "en" ? description_en || description : description;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-ink">{praktikumTitle}</h3>
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${diff.color}`}>
          {diff.label}
        </span>
      </div>

      {desc && <p className="text-sm text-muted leading-relaxed">{desc}</p>}

      {steps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-accent" />
            📋 Langkah Praktikum
          </h4>
          <ol className="space-y-3">
            {steps.map((s, i) => {
              const stepNum = s.step || i + 1;
              const instrText = lang === "en" ? s.instruction_en || s.instruction : s.instruction;
              return (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-bg-alt/60 border border-border/40">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                    {stepNum}
                  </div>
                  <p className="text-sm text-ink leading-relaxed flex-1 pt-1.5">{instrText}</p>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {(image_url || flashcards.length > 0) && (
        <div>
          <h4 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-accent" />
            🔬 Visual Praktikum
          </h4>
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-1 relative rounded-xl overflow-hidden border border-border bg-bg-alt">
              {image_url && (
                <img src={image_url} alt={image_alt || title} className="w-full h-auto" />
              )}
              {flashcards.map((card, i) => (
                <button
                  key={i}
                  className={`absolute w-7 h-7 rounded-full border-2 border-white shadow-lg font-bold text-xs transition-all z-10 ${
                    activeFlashcardIdx === i ? "bg-accent scale-125 ring-2 ring-accent/40" : "bg-red hover:scale-110"
                  } text-white`}
                  style={{ left: `${card.x}%`, top: `${card.y}%`, transform: "translate(-50%, -50%)" }}
                  onClick={() => {
                    setActiveFlashcardIdx(activeFlashcardIdx === i ? null : i);
                    setFlipped(false);
                  }}
                  title={lang === "en" ? card.name_en || card.name : card.name}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="lg:w-80">
              <AnimatePresence mode="wait">
                {activeFlashcardIdx !== null && flashcards[activeFlashcardIdx] ? (
                  <motion.div
                    key={`${activeFlashcardIdx}-${flipped}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative rounded-xl border-2 p-5 min-h-[180px] cursor-pointer transition-colors ${
                      flipped ? "bg-accent/5 border-accent" : "bg-surface border-border hover:border-accent/50"
                    }`}
                    onClick={() => setFlipped(!flipped)}
                  >
                    <div className="absolute top-3 right-3 text-[10px] text-muted uppercase tracking-wider flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />
                      {flipped ? "Fungsi" : "Struktur"}
                    </div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-1.5 mt-7">
                      {flipped ? "Fungsi" : "Struktur"}
                    </p>
                    <p className="text-base font-bold text-ink leading-snug">
                      {flipped
                        ? (lang === "en"
                            ? flashcards[activeFlashcardIdx].description_en || flashcards[activeFlashcardIdx].description
                            : flashcards[activeFlashcardIdx].description)
                        : (lang === "en"
                            ? flashcards[activeFlashcardIdx].name_en || flashcards[activeFlashcardIdx].name
                            : flashcards[activeFlashcardIdx].name)}
                    </p>
                    <p className="text-[10px] text-muted mt-4 text-center">
                      {flipped ? "← Tap untuk balik" : "Tap untuk lihat fungsi →"}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-dashed border-border bg-bg-alt/40 p-6 min-h-[180px] flex flex-col items-center justify-center text-center"
                  >
                    {flashcards.length > 0 ? (
                      <ol className="w-full space-y-2">
                        {flashcards.map((c, i) => (
                          <li key={i}>
                            <button
                              onClick={() => setActiveFlashcardIdx(i)}
                              className="w-full text-left p-2 rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-bg-alt transition-colors flex items-center gap-2"
                            >
                              <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] flex items-center justify-center flex-shrink-0">
                                {i + 1}
                              </span>
                              <span className="truncate">{lang === "en" ? c.name_en || c.name : c.name}</span>
                            </button>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-muted">Belum ada flashcard.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {flashcards.length > 1 && (
                <div className="flex items-center justify-between mt-3 text-xs">
                  <button
                    onClick={() => {
                      setActiveFlashcardIdx((cur) => (cur === null || cur === 0 ? flashcards.length - 1 : cur - 1));
                      setFlipped(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg-alt transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3" /> {t("nav.prev")}
                  </button>
                  <span className="text-muted">
                    {(activeFlashcardIdx ?? 0) + 1} / {flashcards.length}
                  </span>
                  <button
                    onClick={() => {
                      setActiveFlashcardIdx((cur) => (cur === null ? 0 : (cur + 1) % flashcards.length));
                      setFlipped(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg-alt transition-colors"
                  >
                    {t("nav.next")} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
