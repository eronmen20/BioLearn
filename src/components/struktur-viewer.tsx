"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";

interface Flashcard {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  x: number;
  y: number;
}

interface StrukturViewerProps {
  title: string;
  title_en?: string;
  image_url: string;
  image_alt?: string;
  flashcards: Flashcard[];
  lang?: "id" | "en";
}

export function StrukturViewer({
  title,
  title_en,
  image_url,
  image_alt,
  flashcards,
  lang = "id",
}: StrukturViewerProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { t } = useLangStore();

  const current = activeIdx !== null ? flashcards[activeIdx] : null;

  const handleDotClick = (idx: number) => {
    if (activeIdx === idx) {
      setFlipped(!flipped);
    } else {
      setActiveIdx(idx);
      setFlipped(false);
    }
  };

  const goNext = () => {
    if (activeIdx !== null && activeIdx < flashcards.length - 1) {
      setActiveIdx(activeIdx + 1);
      setFlipped(false);
    }
  };

  const goPrev = () => {
    if (activeIdx !== null && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
      setFlipped(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-lg font-bold text-ink">
        {lang === "id" ? title : (title_en || title)}
      </h3>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image with dots */}
        <div className="flex-1">
          <div className="relative inline-block w-full rounded-xl overflow-hidden border border-border bg-bg-alt">
            {image_url ? (
              <img
                src={image_url}
                alt={image_alt || title}
                className="w-full h-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted">
                <p className="text-sm">Belum ada gambar</p>
              </div>
            )}

            {/* Dots overlay */}
            {flashcards.map((card, i) => (
              <button
                key={i}
                className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-200 z-10 ${
                  activeIdx === i
                    ? "bg-accent scale-125 ring-2 ring-accent/30"
                    : "bg-red hover:scale-110 hover:bg-red-600"
                }`}
                style={{
                  left: `${card.x}%`,
                  top: `${card.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => handleDotClick(i)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                title={lang === "id" ? card.name : card.name_en}
              >
                <span className="text-white text-[10px] font-bold">{i + 1}</span>
              </button>
            ))}

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredIdx !== null && hoveredIdx !== activeIdx && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-20 px-3 py-1.5 bg-ink text-white text-xs font-medium rounded-lg shadow-lg pointer-events-none"
                  style={{
                    left: `${flashcards[hoveredIdx].x}%`,
                    top: `${flashcards[hoveredIdx].y - 8}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  {lang === "id" ? flashcards[hoveredIdx].name : flashcards[hoveredIdx].name_en}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dot legend */}
          <div className="flex flex-wrap gap-2 mt-3">
            {flashcards.map((card, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeIdx === i
                    ? "bg-accent text-white"
                    : "bg-surface border border-border text-muted hover:text-ink hover:border-accent/50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeIdx === i ? "bg-white" : "bg-red"}`} />
                {lang === "id" ? card.name : card.name_en}
              </button>
            ))}
          </div>
        </div>

        {/* Flashcard */}
        <div className="lg:w-80">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={`${activeIdx}-${flipped}`}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="perspective-1000"
              >
                <div
                  className={`relative rounded-xl border-2 p-6 min-h-[200px] cursor-pointer transition-colors ${
                    flipped
                      ? "bg-accent/5 border-accent"
                      : "bg-surface border-border hover:border-accent/50"
                  }`}
                  onClick={() => setFlipped(!flipped)}
                >
                  {/* Flip indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="text-[10px] text-muted">
                      {flipped ? "Fungsi" : "Struktur"}
                    </span>
                    <RotateCcw className="w-3 h-3 text-muted" />
                  </div>

                  {/* Content */}
                  <div className="mt-4">
                    {!flipped ? (
                      // Front: Name
                      <>
                        <p className="text-xs text-muted uppercase tracking-wider mb-2">Struktur</p>
                        <h4 className="text-xl font-bold text-ink">
                          {lang === "id" ? current.name : current.name_en}
                        </h4>
                        <p className="text-xs text-muted mt-4">Klik untuk lihat fungsi →</p>
                      </>
                    ) : (
                      // Back: Description/Function
                      <>
                        <p className="text-xs text-accent uppercase tracking-wider mb-2">Fungsi</p>
                        <p className="text-sm text-ink leading-relaxed">
                          {lang === "id" ? current.description : current.description_en}
                        </p>
                        <p className="text-xs text-muted mt-4">← Klik untuk kembali</p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-border bg-surface p-6 min-h-[200px] flex flex-col items-center justify-center text-center"
              >
                <p className="text-sm text-muted">Klik titik pada gambar</p>
                <p className="text-xs text-muted-2 mt-1">untuk melihat struktur & fungsi</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {current && (
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={goPrev}
                disabled={activeIdx === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-muted hover:text-ink disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" /> {t("nav.prev")}
              </button>
              <span className="text-xs text-muted">
                {(activeIdx ?? 0) + 1} / {flashcards.length}
              </span>
              <button
                onClick={goNext}
                disabled={activeIdx === flashcards.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-muted hover:text-ink disabled:opacity-30 transition-colors"
              >
                {t("nav.next")} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
