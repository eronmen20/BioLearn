"use client";

import { useState } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";

/* ───────── ObjectivesCard ─────────
 * Capaian Pembelajaran (CP) berupa paragraf; Tujuan Pembelajaran (TP) berupa
 * daftar — tiap baris teks jadi satu bullet. Kosong → kartu disembunyikan.
 *
 * Compact by default: satu baris tipis (CP terpotong 1 baris + jumlah TP).
 * Di-expand → tampil penuh dua kolom. Materi tetap dekat setelah header.
 */
export function ObjectivesCard({
  objectives,
}: {
  objectives?: { capaian: { id: string; en: string }; tujuan: { id: string; en: string } };
}) {
  const { lang } = useLangStore();
  const [expanded, setExpanded] = useState(false);
  if (!objectives) return null;

  const capaian = lang === "en" ? objectives.capaian.en || objectives.capaian.id : objectives.capaian.id || objectives.capaian.en;
  const tujuanRaw = lang === "en" ? objectives.tujuan.en || objectives.tujuan.id : objectives.tujuan.id || objectives.tujuan.en;
  const tujuanItems = (tujuanRaw || "")
    .split("\n")
    .map((s) => s.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean);

  if (!capaian && tujuanItems.length === 0) return null;

  // Versi ringkas — header pilnya saja
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="mb-5 w-full rounded-2xl border border-accent/15 bg-gradient-to-r from-accent/5 to-surface px-4 py-2.5 flex items-center gap-2.5 text-left hover:border-accent/30 transition-colors group"
      >
        <span className="inline-flex items-center gap-1 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent-dark">
          🎯 {lang === "en" ? "Outcome" : "Capaian"}
        </span>
        {capaian && (
          <span className="text-xs sm:text-[13px] text-muted truncate flex-1 min-w-0">{capaian}</span>
        )}
        <span className="inline-flex items-center gap-1.5 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent-dark">
          ✅ {tujuanItems.length} {lang === "en" ? "objectives" : "tujuan"}
        </span>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-accent group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  // Versi terbuka — dua kolom penuh
  return (
    <div className="mb-5 rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/5 to-surface p-4 sm:p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capaian && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent-dark mb-1.5 flex items-center gap-1.5">
              <span className="text-sm leading-none">🎯</span>
              {lang === "en" ? "Learning Outcome" : "Capaian Pembelajaran"}
            </p>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">{capaian}</p>
          </div>
        )}
        {tujuanItems.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent-dark mb-1.5 flex items-center gap-1.5">
              <span className="text-sm leading-none">✅</span>
              {lang === "en" ? "Learning Objectives" : "Tujuan Pembelajaran"}
            </p>
            <p className="text-[11px] text-muted mb-2">
              {lang === "en" ? "After this chapter, you are expected to be able to:" : "Setelah menyelesaikan bab ini, kamu diharapkan mampu:"}
            </p>
            <ul className="space-y-1.5">
              {tujuanItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted leading-relaxed">
                  <span className="mt-[3px] w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button
        onClick={() => setExpanded(false)}
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-dark transition-colors"
      >
        <RotateCcw className="w-3 h-3 rotate-90" />
        {lang === "en" ? "Collapse" : "Tutup"}
      </button>
    </div>
  );
}
