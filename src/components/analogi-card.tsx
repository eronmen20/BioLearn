"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ChevronDown } from "lucide-react";
import { getAnalogiForSub, type AnalogiItem } from "@/lib/analogi-data";

interface AnalogiProps {
  babId: string;
  subKey?: string;
  subIdx?: number;
  lang?: string;
}

export function AnalogiSection({ babId, subKey, subIdx = 0, lang = "id" }: AnalogiProps) {
  const [isOpen, setIsOpen] = useState(false);
  const data = getAnalogiForSub(babId, subKey, subIdx);

  if (!data || !data.items || data.items.length === 0) {
    return null;
  }

  const title = lang === "en" ? data.titleEn || data.title : data.title;
  const subtitle = lang === "en" ? data.subtitleEn || data.subtitle : data.subtitle;

  return (
    <div className="mb-6 rounded-3xl border border-accent/20 bg-surface shadow-card overflow-hidden transition-all">
      {/* Top subtle gradient accent line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-accent via-accent-light to-cyan-400" />

      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer select-none hover:bg-bg-alt/60 transition-colors"
      >
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-white flex items-center justify-center text-xl shadow-sm shrink-0">
            💡
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/10 text-accent">
                {lang === "en" ? "Everyday Analogy" : "Analogi Sehari-hari"}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-ink">
                {title}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="p-2 rounded-xl text-muted hover:text-accent transition-colors shrink-0">
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Grid of Analogy Cards */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {data.items.map((item, i) => (
                  <SingleAnalogiCard key={item.id || i} item={item} lang={lang} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SingleAnalogiCard({ item, lang }: { item: AnalogiItem; lang: string }) {
  const term = lang === "en" ? item.termEn || item.term : item.term;
  const analogyTitle = lang === "en" ? item.analogyTitleEn || item.analogyTitle : item.analogyTitle;
  const story = lang === "en" ? item.storyEn || item.story : item.story;

  return (
    <div className="group rounded-2xl bg-surface border border-border/70 hover:border-accent/40 p-4 sm:p-5 shadow-card hover:-translate-y-0.5 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3 mb-2.5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform select-none">
            {item.emoji || "💡"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                {term}
              </span>
              {item.scientificName && (
                <span className="text-[10px] text-muted font-medium">
                  ({item.scientificName})
                </span>
              )}
            </div>
            <h4 className="text-sm font-extrabold text-ink mt-1 leading-snug group-hover:text-accent transition-colors">
              {analogyTitle}
            </h4>
          </div>
        </div>

        <p className="text-xs sm:text-[13px] text-ink/80 leading-relaxed bg-bg-alt/70 p-3 sm:p-3.5 rounded-xl border border-border/50 mt-2">
          {story}
        </p>
      </div>
    </div>
  );
}
