"use client";

import { useState } from "react";
import { GLOSSARY } from "@/lib/glossary-data";
import { useLangStore } from "@/lib/lang-store";
import { Search, Book, ChevronDown } from "lucide-react";

export function GlossaryView() {
  const { lang, t } = useLangStore();
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const filtered = GLOSSARY.filter((g) => {
    const term = g.term[lang].toLowerCase();
    const def = g.def[lang].toLowerCase();
    const q = filter.toLowerCase();
    return term.includes(q) || def.includes(q);
  });

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">📖 {t("glossary.title")}</h1>
            <p className="text-sm sm:text-base text-muted leading-relaxed">{t("glossary.desc")}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
        <input
          type="text"
          placeholder={t("glossary.search")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-2xl text-sm outline-none focus:border-accent-light transition-colors bg-surface shadow-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((g, i) => (
          <div
            key={i}
            onClick={() => setOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
            className="bg-surface rounded-2xl p-5 border border-border/50 cursor-pointer card-lift group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Book className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink group-hover:text-accent transition-colors">{g.term[lang]}</h3>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold mt-0.5">
                    {t("glossary.lang")}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-2 transition-transform mt-1 flex-shrink-0 ${open[i] ? "rotate-180" : ""}`} />
            </div>
            {open[i] && (
              <p className="text-sm text-muted leading-relaxed mt-3 pt-3 border-t border-border/50 animate-fade-in">
                {g.def[lang]}
              </p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-2 mx-auto mb-4" />
          <p className="text-muted-2 text-lg font-medium">{t("search.noresult")}</p>
          <p className="text-muted-2/70 text-sm mt-1">&quot;{filter}&quot;</p>
        </div>
      )}
    </div>
  );
}