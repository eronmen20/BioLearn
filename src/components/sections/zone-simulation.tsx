"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, FlaskConical, RotateCcw, Play, Ruler } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";

/* ───────── Model simulasi (disederhanakan untuk pembelajaran) ───────── */

interface Antibiotic {
  id: string;
  labelId: string;
  labelEn: string;
  short: string;
  color: string;
  zoneColor: string;
  // Diameter zona (mm) pada strain sensitif & faktor pengali strain resisten
  baseSensitive: number;
  resistantFactor: number;
}

const ANTIBIOTICS: Antibiotic[] = [
  { id: "penisilin", labelId: "Penisilin", labelEn: "Penicillin", short: "P", color: "#6c5ce7", zoneColor: "rgba(108,92,231,0.18)", baseSensitive: 24, resistantFactor: 0 },
  { id: "tetrasiklin", labelId: "Tetrasiklin", labelEn: "Tetracycline", short: "T", color: "#00b894", zoneColor: "rgba(0,184,148,0.18)", baseSensitive: 27, resistantFactor: 0.45 },
  { id: "kloramfenikol", labelId: "Kloramfenikol", labelEn: "Chloramphenicol", short: "K", color: "#e17055", zoneColor: "rgba(225,112,85,0.20)", baseSensitive: 20, resistantFactor: 0.6 },
];

interface PlacedDisc {
  antibioticId: string;
  x: number; // koordinat SVG 0-300
  y: number;
}

type Phase = "setup" | "incubating" | "results";

const DISH_C = 150;
const DISH_R = 138;
const MM_TO_PX = DISH_R / 45; // cawan 90 mm

// Variasi deterministik (±2 mm) dari posisi — stabil antar render
function variation(x: number, y: number): number {
  return ((Math.round(x) * 13 + Math.round(y) * 7) % 5) - 2;
}

function zoneDiameter(ab: Antibiotic, strain: "sensitif" | "resisten", d: PlacedDisc): number {
  const base = ab.baseSensitive * (strain === "resisten" ? ab.resistantFactor : 1);
  return Math.max(0, Math.round(base + variation(d.x, d.y)));
}

function zoneCategory(dmm: number, lang: string): { label: string; cls: string } {
  if (dmm < 6) return { label: lang === "en" ? "No zone" : "Tak ada zona", cls: "bg-red-500/15 text-red-700" };
  if (dmm >= 20) return { label: lang === "en" ? "Sensitive" : "Sensitif", cls: "bg-green-500/15 text-green-700" };
  if (dmm >= 15) return { label: lang === "en" ? "Intermediate" : "Intermediet", cls: "bg-yellow-500/15 text-yellow-700" };
  return { label: lang === "en" ? "Resistant" : "Resisten", cls: "bg-red-500/15 text-red-700" };
}

/* ───────── Komponen ───────── */

export function ZoneSimulation() {
  const { lang } = useLangStore();

  const [strain, setStrain] = useState<"sensitif" | "resisten">("sensitif");
  const [selectedAb, setSelectedAb] = useState<string>("penisilin");
  const [discs, setDiscs] = useState<PlacedDisc[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [progress, setProgress] = useState(0);
  const [conclusion, setConclusion] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const T = {
    title: lang === "en" ? "Antibiotic Inhibition Zone" : "Zona Hambat Antibiotik",
    subtitle: lang === "en"
      ? "Virtual petri dish — place discs, incubate, and see which antibiotic still works."
      : "Cawan petri virtual — taruh cakram, inkubasi, dan lihat antibiotik mana yang masih mempan.",
    step1: lang === "en" ? "1. Choose strain" : "1. Pilih strain",
    sensitive: lang === "en" ? "Sensitive" : "Sensitif",
    resistant: lang === "en" ? "Resistant" : "Resisten",
    sensitiveHint: lang === "en" ? "Normal S. aureus" : "S. aureus biasa",
    resistantHint: lang === "en" ? "Resistant S. aureus (MRSA-like)" : "S. aureus resisten (tipe-MRSA)",
    step2: lang === "en" ? "2. Place discs (click dish)" : "2. Taruh cakram (klik cawan)",
    removeHint: lang === "en" ? "Click a placed disc to remove it" : "Klik cakram yang terpasang untuk melepasnya",
    step3: lang === "en" ? "3. Incubate 24 h" : "3. Inkubasi 24 jam",
    incubate: lang === "en" ? "Incubate" : "Inkubasi",
    incubating: lang === "en" ? "Incubating at 37°C…" : "Menginkubasi pada 37°C…",
    needDisc: lang === "en" ? "Place at least 1 disc first" : "Taruh minimal 1 cakram dulu",
    step4: lang === "en" ? "4. Observe & measure" : "4. Amati & ukur",
    zoneLabel: lang === "en" ? "zone" : "zona",
    noZone: lang === "en" ? "overgrown — no zone" : "tertutup bakteri — tak ada zona",
    step5: lang === "en" ? "5. Conclude" : "5. Simpulkan",
    question: lang === "en" ? "Which antibiotic is most effective on this strain?" : "Antibiotik mana yang paling efektif untuk strain ini?",
    noneEffective: lang === "en" ? "None are effective" : "Tidak ada yang efektif",
    check: lang === "en" ? "Check conclusion" : "Cek simpulan",
    correct: lang === "en" ? "Correct! 🎉" : "Tepat! 🎉",
    wrong: lang === "en" ? "Not quite — compare the diameters again." : "Belum tepat — bandingkan lagi diameternya.",
    explainResistant: lang === "en"
      ? "On the resistant strain the zones shrink or vanish: its genes defeat the antibiotic. This is why unfinished courses are dangerous — survivors pass on resistance."
      : "Pada strain resisten, zona menyusut atau hilang: gennya mengalahkan antibiotik. Inilah bahaya obat yang tidak dihabiskan — yang selamat mewariskan resistensi.",
    explainSensitive: lang === "en"
      ? "The widest zone wins — the antibiotic diffuses and kills bacteria around the disc. Different walls need different weapons."
      : "Zona terlebar menang — antibiotik berdifusi dan membunuh bakteri di sekitar cakram. Dinding sel berbeda butuh senjata berbeda.",
    reset: lang === "en" ? "Repeat simulation" : "Ulangi simulasi",
    openLesson: lang === "en" ? "Open lesson" : "Buka materi",
    mm: "mm",
  };

  const startIncubate = () => {
    if (discs.length === 0) return;
    setPhase("incubating");
    setProgress(0);
    setChecked(false);
    setConclusion(null);
    const t0 = Date.now();
    const DURATION = 2600;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / DURATION);
      setProgress(Math.round(p * 100));
      if (p >= 1) {
        if (timer.current) clearInterval(timer.current);
        setPhase("results");
      }
    }, 60);
  };

  const resetAll = () => {
    if (timer.current) clearInterval(timer.current);
    setDiscs([]);
    setPhase("setup");
    setProgress(0);
    setConclusion(null);
    setChecked(false);
  };

  const placeDisc = (e: ReactMouseEvent<SVGSVGElement>) => {
    if (phase !== "setup") return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 300;
    const dist = Math.hypot(x - DISH_C, y - DISH_C);
    if (dist > DISH_R - 12) return; // di luar cawan
    // Klik cakram yang sudah ada = lepas
    const hit = discs.findIndex((d) => Math.hypot(d.x - x, d.y - y) < 14);
    if (hit >= 0) {
      setDiscs(discs.filter((_, i) => i !== hit));
      return;
    }
    if (discs.some((d) => d.antibioticId === selectedAb)) return; // 1 cakram per antibiotik
    if (discs.length >= 3) return;
    setDiscs([...discs, { antibioticId: selectedAb, x, y }]);
  };

  const changeStrain = (s: "sensitif" | "resisten") => {
    if (s === strain) return;
    setStrain(s);
    if (phase === "results") {
      setPhase("setup");
      setChecked(false);
      setConclusion(null);
    }
  };

  const results = discs.map((d) => {
    const ab = ANTIBIOTICS.find((a) => a.id === d.antibioticId)!;
    return { disc: d, ab, dmm: zoneDiameter(ab, strain, d) };
  });
  const best = results.length > 0 ? results.reduce((a, b) => (b.dmm > a.dmm ? b : a)) : null;
  const bestId = best && best.dmm >= 6 ? best.ab.id : "none";
  const isConclusionCorrect = conclusion === bestId;

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <Link href="/biolab" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent mb-4 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        BioLab
      </Link>

      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-2xl sm:text-3xl">🧫</span>
          <h1 className="text-xl sm:text-2xl font-extrabold">{T.title}</h1>
        </div>
        <p className="text-muted text-xs sm:text-sm">{T.subtitle}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700">
          🧬 {lang === "en" ? "Culture: Staphylococcus aureus" : "Kultur: Staphylococcus aureus"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Panel kontrol */}
        <div className="lg:col-span-2 space-y-4">
          {/* Strain */}
          <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-card">
            <p className="text-xs font-bold text-ink mb-2">{T.step1}</p>
            <div className="grid grid-cols-2 gap-2">
              {(["sensitif", "resisten"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => changeStrain(s)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                    strain === s
                      ? s === "resisten"
                        ? "border-red bg-red-light text-red"
                        : "border-green bg-green-light text-green"
                      : "border-border text-muted hover:border-accent/40 hover:text-ink"
                  }`}
                >
                  {s === "sensitif" ? T.sensitive : T.resistant}
                  <span className="block text-[10px] font-medium opacity-80 mt-0.5">
                    {s === "sensitif" ? T.sensitiveHint : T.resistantHint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Antibiotik */}
          <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-card">
            <p className="text-xs font-bold text-ink mb-2">{T.step2}</p>
            <div className="flex gap-2 mb-2">
              {ANTIBIOTICS.map((a) => {
                const used = discs.some((d) => d.antibioticId === a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAb(a.id)}
                    className={`flex-1 px-2 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      selectedAb === a.id ? "text-white border-transparent" : used ? "opacity-40 border-border text-muted" : "border-border text-ink hover:border-accent/40"
                    }`}
                    style={selectedAb === a.id ? { background: a.color } : undefined}
                  >
                    {a.short} · {lang === "en" ? a.labelEn : a.labelId}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted">{T.removeHint}</p>
          </div>

          {/* Inkubasi */}
          <div className="p-4 rounded-2xl bg-surface border border-border/50 shadow-card">
            <p className="text-xs font-bold text-ink mb-2">{T.step3}</p>
            {phase === "incubating" ? (
              <div>
                <div className="h-2.5 rounded-full bg-border/50 overflow-hidden mb-2">
                  <motion.div className="h-full bg-gradient-to-r from-accent to-accent-dark" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted">{T.incubating} {progress}%</p>
              </div>
            ) : (
              <button
                onClick={startIncubate}
                disabled={discs.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-dark transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {T.incubate} ({discs.length}/3)
              </button>
            )}
            {discs.length === 0 && phase === "setup" && (
              <p className="text-[11px] text-muted mt-2">{T.needDisc}</p>
            )}
            {(discs.length > 0 || phase !== "setup") && (
              <button onClick={resetAll} className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-ink transition-colors cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" />
                {T.reset}
              </button>
            )}
          </div>
        </div>

        {/* Cawan */}
        <div className="lg:col-span-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/50 shadow-card">
            <svg viewBox="0 0 300 300" className={`w-full max-w-[420px] mx-auto select-none ${phase === "setup" ? "cursor-crosshair" : ""}`} onClick={placeDisc}>
              <defs>
                <clipPath id="dishClip">
                  <circle cx={DISH_C} cy={DISH_C} r={DISH_R} />
                </clipPath>
                <radialGradient id="agarGrad" cx="50%" cy="42%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#f7f7f8" />
                  <stop offset="100%" stopColor="#e9e9ec" />
                </radialGradient>
              </defs>
              {/* Cawan kaca */}
              <circle cx={DISH_C} cy={DISH_C} r={DISH_R + 8} fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="3" />
              <circle cx={DISH_C} cy={DISH_C} r={DISH_R} fill="url(#agarGrad)" stroke="#d4d4d8" strokeWidth="1.5" />
              {/* Lawn samar merata (tumbuh bertahap saat inkubasi) */}
              {(phase === "incubating" || phase === "results") && (
                <g clipPath="url(#dishClip)">
                  {(() => {
                    const growth = phase === "results" ? 1 : progress / 100;
                    return (
                      <>
                        <circle cx={DISH_C} cy={DISH_C} r={DISH_R} fill="#e9e7d8" opacity={0.35 * growth} />
                        {Array.from({ length: 46 }).map((_, i) => {
                          const angle = i * 2.39996;
                          const rr = (DISH_R - 8) * Math.sqrt(((i * 2654435761) % 1000) / 1000);
                          const px = DISH_C + Math.cos(angle) * rr;
                          const py = DISH_C + Math.sin(angle) * rr;
                          if (i / 46 > growth) return null;
                          return <circle key={`sp-${i}`} cx={px} cy={py} r={0.9 + (i % 3) * 0.4} fill="#a9b198" opacity={0.3} />;
                        })}
                      </>
                    );
                  })()}
                </g>
              )}
              {/* Zona bening tegas (agar bersih, koloni "mati") */}
              {phase === "results" &&
                results.map(({ disc, dmm }, i) =>
                  dmm >= 6 ? (
                    <circle
                      key={`clear-${i}`}
                      cx={disc.x}
                      cy={disc.y}
                      r={(dmm / 2) * MM_TO_PX}
                      fill="#f8fbfd"
                      opacity="0.96"
                      stroke="#c3cfdb"
                      strokeWidth="1"
                    />
                  ) : null
                )}
              {/* Cakram putih polos ala Kirby-Bauer */}
              {results.map(({ disc, ab }, i) => (
                <g key={`${disc.antibioticId}-${i}`}>
                  <circle cx={disc.x} cy={disc.y} r="9" fill="#ffffff" stroke="#9fb0c3" strokeWidth="1.5" />
                  <text x={disc.x} y={disc.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155">
                    {ab.short}
                  </text>
                </g>
              ))}
              {discs.length === 0 && phase === "setup" && (
                <text x={DISH_C} y={DISH_C} textAnchor="middle" fontSize="12" fill="#9aa3b2">
                  {lang === "en" ? "Click to place a disc" : "Klik untuk menaruh cakram"}
                </text>
              )}
            </svg>

            {/* Hasil ukur */}
            {phase === "results" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <p className="text-xs font-bold text-ink mb-2 inline-flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-accent" />
                  {T.step4}
                </p>
                <div className="space-y-1.5">
                  {results.map(({ ab, dmm }) => {
                    const cat = zoneCategory(dmm, lang);
                    return (
                      <div key={ab.id} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: ab.color }}>
                          {ab.short}
                        </span>
                        <span className="font-semibold text-ink">{lang === "en" ? ab.labelEn : ab.labelId}</span>
                        <span className="text-muted">Ø {dmm} {T.mm}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.cls}`}>{cat.label}</span>
                        {dmm < 6 && <span className="text-[11px] text-muted">— {T.noZone}</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Simpulan */}
                <p className="text-xs font-bold text-ink mt-4 mb-2">{T.step5}: {T.question}</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {results.map(({ ab }) => (
                    <button
                      key={ab.id}
                      onClick={() => !checked && setConclusion(ab.id)}
                      disabled={checked}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                        checked
                          ? ab.id === bestId
                            ? "border-green bg-green-light text-green"
                            : conclusion === ab.id
                            ? "border-red bg-red-light text-red"
                            : "border-border text-muted"
                          : conclusion === ab.id
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-border text-ink hover:border-accent/50"
                      }`}
                    >
                      {lang === "en" ? ab.labelEn : ab.labelId}
                    </button>
                  ))}
                  <button
                    onClick={() => !checked && setConclusion("none")}
                    disabled={checked}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      checked
                        ? bestId === "none"
                          ? "border-green bg-green-light text-green"
                          : conclusion === "none"
                          ? "border-red bg-red-light text-red"
                          : "border-border text-muted"
                        : conclusion === "none"
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border text-ink hover:border-accent/50"
                    }`}
                  >
                    {T.noneEffective}
                  </button>
                </div>
                {checked ? (
                  <div className={`p-3.5 rounded-xl text-xs leading-relaxed ${isConclusionCorrect ? "bg-green-light text-green" : "bg-red-light text-red"}`}>
                    <p className="font-bold mb-1">{isConclusionCorrect ? T.correct : T.wrong}</p>
                    <p className="text-muted">{strain === "resisten" ? T.explainResistant : T.explainSensitive}</p>
                    <Link href="/bab/bakteri?sub=sub.bakteri3" className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white text-xs font-bold hover:bg-accent-dark transition-colors">
                      <BookOpen className="w-3.5 h-3.5" />
                      {T.openLesson}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => conclusion && setChecked(true)}
                    disabled={!conclusion}
                    className="px-5 py-2.5 rounded-full bg-accent text-white text-xs font-bold hover:bg-accent-dark transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {T.check}
                  </button>
                )}
              </motion.div>
            )}
          </div>
          <p className="text-[11px] text-muted mt-2 inline-flex items-start gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-accent" />
            {lang === "en"
              ? "Standard (simplified): ≥20 mm sensitive · 15–19 mm intermediate · <15 mm resistant."
              : "Standar (disederhanakan): ≥20 mm sensitif · 15–19 mm intermediet · <15 mm resisten."}
          </p>
          {/* Prosedur lengkap = modul BioLab pendamping */}
          <Link
            href="/biolab/1"
            className="mt-3 flex items-center gap-3 p-3.5 rounded-2xl bg-surface border border-border/50 shadow-card hover:-translate-y-0.5 transition-transform group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white flex items-center justify-center font-extrabold flex-shrink-0">
              📋
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-ink group-hover:text-accent transition-colors">
                {lang === "en" ? "Full procedure" : "Prosedur lengkap"}
              </p>
              <p className="text-[11px] text-muted truncate">
                {lang === "en" ? "Tools, materials & 6 work steps" : "Alat, bahan & 6 langkah kerja"}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
