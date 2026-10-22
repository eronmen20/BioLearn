"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";

export interface Flashcard {
  name?: string;
  name_en?: string;
  front?: string;
  front_en?: string;
  description?: string;
  description_en?: string;
  back?: string;
  back_en?: string;
  x?: number;
  y?: number;
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
  flashcards = [],
  lang = "id",
}: StrukturViewerProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);
  const [flipped, setFlipped] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { t } = useLangStore();

  const normalizedCards = (flashcards || []).map((card, i) => ({
    name: card.name || card.front || `Bagian ${i + 1}`,
    name_en: card.name_en || card.front_en || card.name || card.front || `Part ${i + 1}`,
    description: card.description || card.back || "",
    description_en: card.description_en || card.back_en || card.description || card.back || "",
    x: typeof card.x === "number" ? card.x : 25 + (i % 3) * 25,
    y: typeof card.y === "number" ? card.y : 30 + Math.floor(i / 3) * 25,
  }));

  const currentIdx = activeIdx !== null && activeIdx < normalizedCards.length ? activeIdx : 0;
  const current = normalizedCards.length > 0 ? normalizedCards[currentIdx] : null;

  const handleDotClick = (idx: number) => {
    if (activeIdx === idx) {
      setFlipped(!flipped);
    } else {
      setActiveIdx(idx);
      setFlipped(false);
    }
  };

  const goNext = () => {
    if (currentIdx < normalizedCards.length - 1) {
      setActiveIdx(currentIdx + 1);
      setFlipped(false);
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      setActiveIdx(currentIdx - 1);
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
          <div className="relative inline-block w-full rounded-xl overflow-hidden border border-border/70 bg-bg-alt shadow-sm">
            {image_url ? (
              <img
                src={image_url}
                alt={image_alt || title}
                className="w-full h-auto block"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted">
                <p className="text-sm">Belum ada gambar</p>
              </div>
            )}

            {/* Dots overlay */}
            {normalizedCards.map((card, i) => (
              <button
                key={i}
                type="button"
                className={`absolute w-7 h-7 rounded-full border-2 border-white shadow-md cursor-pointer transition-all duration-200 z-10 flex items-center justify-center ${
                  currentIdx === i
                    ? "bg-accent scale-110 ring-4 ring-accent/20"
                    : "bg-primary hover:scale-110 hover:bg-accent/80"
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
                aria-label={lang === "id" ? card.name : card.name_en}
              >
                <span className="text-white text-[11px] font-bold leading-none">{i + 1}</span>
              </button>
            ))}

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredIdx !== null && hoveredIdx !== currentIdx && normalizedCards[hoveredIdx] && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-20 px-3 py-1.5 bg-ink text-white text-xs font-medium rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
                  style={{
                    left: `${normalizedCards[hoveredIdx].x}%`,
                    top: `${normalizedCards[hoveredIdx].y - 8}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  {lang === "id" ? normalizedCards[hoveredIdx].name : normalizedCards[hoveredIdx].name_en}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dot legend */}
          <div className="flex flex-wrap gap-2 mt-3">
            {normalizedCards.map((card, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDotClick(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentIdx === i
                    ? "bg-accent text-white shadow-sm"
                    : "bg-surface border border-border/70 text-muted hover:text-ink hover:border-accent/40"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${currentIdx === i ? "bg-white" : "bg-accent"}`} />
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
                key={`${currentIdx}-${flipped}`}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="perspective-1000"
              >
                <div
                  className={`relative rounded-xl border p-6 min-h-[220px] cursor-pointer transition-all shadow-sm ${
                    flipped
                      ? "bg-accent/5 border-accent/60"
                      : "bg-surface border-border/70 hover:border-accent/40 hover:shadow-md"
                  }`}
                  onClick={() => setFlipped(!flipped)}
                >
                  {/* Flip indicator */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-bg-alt text-muted text-[10px] font-medium border border-border/50">
                    <span>{flipped ? "Fungsi" : "Struktur"}</span>
                    <RotateCcw className="w-3 h-3 text-muted" />
                  </div>

                  {/* Content */}
                  <div className="mt-3">
                    {!flipped ? (
                      // Front: Name
                      <>
                        <div className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/10 text-accent uppercase tracking-wider mb-2">
                          Pin #{currentIdx + 1} • Struktur
                        </div>
                        <h4 className="text-xl font-bold text-ink">
                          {lang === "id" ? current.name : current.name_en}
                        </h4>
                        <p className="text-xs text-muted mt-5 flex items-center gap-1 font-medium">
                          <span>Klik kartu untuk membalik &amp; lihat fungsi</span>
                          <span className="text-accent">→</span>
                        </p>
                      </>
                    ) : (
                      // Back: Description/Function
                      <>
                        <div className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 uppercase tracking-wider mb-2">
                          Pin #{currentIdx + 1} • Fungsi Fisiologis
                        </div>
                        <p className="text-sm text-ink leading-relaxed font-normal">
                          {lang === "id" ? current.description : current.description_en}
                        </p>
                        <p className="text-xs text-muted mt-5 flex items-center gap-1 font-medium">
                          <span className="text-accent">←</span>
                          <span>Klik untuk melihat nama struktur</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-border/70 bg-surface p-6 min-h-[220px] flex flex-col items-center justify-center text-center shadow-sm"
              >
                <p className="text-sm font-medium text-muted">Klik titik pada gambar</p>
                <p className="text-xs text-muted-2 mt-1">untuk melihat struktur &amp; fungsi organ</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {current && (
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border/70 text-muted hover:text-ink disabled:opacity-30 transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> {t("nav.prev")}
              </button>
              <span className="text-xs font-medium text-muted">
                {currentIdx + 1} / {normalizedCards.length}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={currentIdx === normalizedCards.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border/70 text-muted hover:text-ink disabled:opacity-30 transition-colors shadow-2xs"
              >
                {t("nav.next")} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
