"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  RotateCcw,
  Sparkles,
  Thermometer,
  Activity,
  Flame,
  Snowflake,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  FlaskConical,
  Plus,
  CheckCircle2,
  Copy,
  BookOpen,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  EnzymeId,
  ENZYME_DEFINITIONS,
  ReactionConditions,
  ReactionSimulationResult,
  simulateEnzymeKinetics,
  calculateTemperatureFactor,
  calculatePhFactor,
  FoodSample,
  createDigestedFoodSample,
  ObservationLogEntry,
} from "@/lib/biochem-engine";
import { BIOCHEM_I18N } from "@/lib/biochem-i18n";
import { useLangStore } from "@/lib/lang-store";
import { BiochemProcedureModal } from "./biochem-procedure-modal";

interface EnzymeReactionBenchProps {
  samples: Record<string, FoodSample>;
  initialSample?: FoodSample;
  onLogObservation: (entry: ObservationLogEntry) => void;
  onSendDigestedToFoodTest: (digestedSample: FoodSample) => void;
}

export function EnzymeReactionBench({
  samples,
  initialSample,
  onLogObservation,
  onSendDigestedToFoodTest,
}: EnzymeReactionBenchProps) {
  const { lang } = useLangStore();
  const t = BIOCHEM_I18N[lang];

  const sampleList = Object.values(samples);

  // States
  const [selectedEnzymeId, setSelectedEnzymeId] = useState<EnzymeId>("amylase");
  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    initialSample?.id || "starch_sol"
  );
  const [temperature, setTemperature] = useState<number>(37);
  const [ph, setPh] = useState<number>(6.8);
  const [substrateConc, setSubstrateConc] = useState<number>(60);
  const [enzymeConc, setEnzymeConc] = useState<number>(50);
  const [duration, setDuration] = useState<number>(20);

  // Dropdown States
  const [isEnzymeDropdownOpen, setIsEnzymeDropdownOpen] = useState(false);
  const [isSubstrateDropdownOpen, setIsSubstrateDropdownOpen] = useState(false);

  // Condition Comparison state
  const [comparedResult, setComparedResult] = useState<ReactionSimulationResult | null>(null);
  const [showProcedureModal, setShowProcedureModal] = useState(false);

  // Active Simulation Result (pure deterministic function of state)
  const currentConditions: ReactionConditions = useMemo(
    () => ({
      temperature,
      ph,
      substrateConc,
      enzymeConc,
      durationMinutes: duration,
    }),
    [temperature, ph, substrateConc, enzymeConc, duration]
  );

  const simulationResult = useMemo(() => {
    return simulateEnzymeKinetics(selectedEnzymeId, currentConditions);
  }, [selectedEnzymeId, currentConditions]);

  const activeSample = samples[selectedSampleId] || sampleList[0];
  const activeEnzyme = ENZYME_DEFINITIONS[selectedEnzymeId];

  // Store run as comparison
  const handleSaveAsComparison = () => {
    setComparedResult(simulationResult);
  };

  const handleClearComparison = () => {
    setComparedResult(null);
  };

  // Log to Journal
  const handleLogObservation = () => {
    onLogObservation({
      id: `enzyme-run-${Date.now()}`,
      timestamp: Date.now(),
      type: "enzyme_reaction",
      titleId: `Reaksi ${activeEnzyme.nameId} (${temperature}°C, pH ${ph})`,
      titleEn: `Reaction ${activeEnzyme.nameEn} (${temperature}°C, pH ${ph})`,
      sampleName: lang === "en" ? activeSample.nameEn : activeSample.nameId,
      testOrEnzyme: lang === "en" ? activeEnzyme.nameEn : activeEnzyme.nameId,
      conditionsSummary: `T=${temperature}°C, pH=${ph}, [S]=${substrateConc}mM, [E]=${enzymeConc}nM, t=${duration}m`,
      observationId: `Laju v₀: ${simulationResult.initialRate} mM/menit | Konversi: ${simulationResult.conversionPercent}%`,
      observationEn: `Initial rate v₀: ${simulationResult.initialRate} mM/min | Conversion: ${simulationResult.conversionPercent}%`,
      interpretationId: simulationResult.explanationId,
      interpretationEn: simulationResult.explanationEn,
      resultBadge: simulationResult.isDenatured
        ? "DENATURED"
        : simulationResult.isColdInhibited
        ? "INHIBITED"
        : `${simulationResult.conversionPercent}% YIELD`,
      colorHex: simulationResult.isDenatured ? "#e74c3c" : "#2ecc71",
    });
  };

  // Export digested aliquot to Food Lab
  const handleExportToFoodLab = () => {
    const digested = createDigestedFoodSample(activeSample, selectedEnzymeId, simulationResult);
    onSendDigestedToFoodTest(digested);
  };

  // Temperature color helper
  const getTempColor = (temp: number) => {
    if (temp <= 15) return "bg-blue-600 text-white border-blue-600 shadow-2xs";
    if (temp >= 62) return "bg-red text-white border-red shadow-2xs";
    if (temp >= 35 && temp <= 40) return "bg-green text-white border-green shadow-2xs";
    return "bg-amber text-white border-amber shadow-2xs";
  };

  // SVG Chart Dimensions
  const chartW = 380;
  const chartH = 170;
  const padding = 28;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 font-bold text-sm shrink-0">
                ⚙️ Module 2
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-ink">{t.enzymeLabTitle}</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted">{t.enzymeLabSubtitle}</p>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0 self-end md:self-center ml-auto flex-wrap">
            <button
              type="button"
              onClick={() => setShowProcedureModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl border border-accent/40 bg-accent/5 hover:bg-accent/10 text-accent text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "Full Procedure" : "Prosedur Lengkap"}</span>
            </button>
            <button
              type="button"
              onClick={handleExportToFoodLab}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-accent to-purple-600 text-white font-bold text-xs shadow-xs hover:shadow-md hover:opacity-95 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{t.sendDigestedToFoodTest}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (4 cols), Center Chamber & Curves (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Reaction Parameter Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Enzyme Selector Dropdown */}
          <div className="bg-surface rounded-3xl p-4 border border-border shadow-xs relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-extrabold">1</span>
                <span>{lang === "en" ? "1. Select Enzyme & Target" : "1. Pilih Enzim & Target"}</span>
              </h3>
              <span className="text-[10px] font-semibold text-muted bg-bg-alt px-2 py-0.5 rounded-full border border-border/60">
                3 {lang === "en" ? "enzymes" : "enzim"}
              </span>
            </div>

            {/* Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEnzymeDropdownOpen(!isEnzymeDropdownOpen)}
                className="w-full text-left px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border border-border bg-bg-alt/70 hover:bg-bg-alt hover:border-accent/50 text-ink flex items-center justify-between shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
                  <span
                    className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-2xs"
                    style={{
                      backgroundColor:
                        selectedEnzymeId === "amylase"
                          ? "#d97706"
                          : selectedEnzymeId === "protease"
                          ? "#8b5cf6"
                          : "#10b981",
                    }}
                  />
                  <span className="truncate text-ink">
                    {lang === "en" ? activeEnzyme.nameEn : activeEnzyme.nameId}
                  </span>
                  <span className="text-[10px] font-semibold text-muted bg-surface px-2 py-0.5 rounded-full border border-border shrink-0">
                    Opt: {activeEnzyme.optimumTemp}°C | pH {activeEnzyme.optimumPh}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
                    isEnzymeDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu Popover */}
              <AnimatePresence>
                {isEnzymeDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsEnzymeDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-surface rounded-2xl border border-border shadow-dropdown p-1.5 max-h-[300px] overflow-y-auto space-y-1"
                    >
                      {(Object.keys(ENZYME_DEFINITIONS) as EnzymeId[]).map((eid) => {
                        const enz = ENZYME_DEFINITIONS[eid];
                        const isSelected = selectedEnzymeId === eid;
                        const dotColor =
                          eid === "amylase"
                            ? "#d97706"
                            : eid === "protease"
                            ? "#8b5cf6"
                            : "#10b981";

                        return (
                          <button
                            key={eid}
                            type="button"
                            onClick={() => {
                              setSelectedEnzymeId(eid);
                              setPh(enz.optimumPh);
                              setTemperature(enz.optimumTemp);
                              setIsEnzymeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col gap-1 cursor-pointer ${
                              isSelected
                                ? "bg-accent/10 text-accent font-bold"
                                : "hover:bg-bg-alt text-ink"
                            }`}
                          >
                            <div className="w-full flex items-center justify-between">
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-2xs"
                                  style={{ backgroundColor: dotColor }}
                                />
                                <span className="font-bold text-ink truncate">
                                  {lang === "en" ? enz.nameEn : enz.nameId}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-semibold text-muted bg-surface px-2 py-0.5 rounded-full border border-border">
                                  Opt: {enz.optimumTemp}°C | pH {enz.optimumPh}
                                </span>
                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                                )}
                              </div>
                            </div>
                            <p className="text-[11px] text-muted pl-5.5">
                              {lang === "en" ? enz.substrateEn : enz.substrateId} ➔{" "}
                              <span className="text-accent font-semibold">
                                {lang === "en" ? enz.productEn : enz.productId}
                              </span>
                            </p>
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Active Enzyme Profile Card */}
            <div className="mt-2.5 p-2.5 rounded-2xl bg-bg-alt/70 border border-border/80 text-[11px] leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-ink">
                  <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{lang === "en" ? "Reaction Target" : "Target Reaksi Katalisis"}</span>
                </div>
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                  {activeEnzyme.substrateType.toUpperCase()}
                </span>
              </div>
              <p className="text-muted leading-relaxed line-clamp-2">
                {lang === "en" ? activeEnzyme.descriptionEn : activeEnzyme.descriptionId}
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-border/60 flex items-center justify-between text-[10px] text-muted">
                <span>
                  {lang === "en" ? "Source: " : "Sumber: "}
                  <strong className="text-ink">
                    {lang === "en" ? activeEnzyme.sourceEn : activeEnzyme.sourceId}
                  </strong>
                </span>
                <span>
                  kcat: <strong className="text-ink">{activeEnzyme.kcat} s⁻¹</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Substrate Source Selector Dropdown */}
          <div className="bg-surface rounded-3xl p-4 border border-border shadow-xs relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-extrabold">2</span>
                <span>{lang === "en" ? "2. Select Substrate Source" : "2. Pilih Sumber Substrat"}</span>
              </h3>
              <span className="text-[10px] font-semibold text-muted bg-bg-alt px-2 py-0.5 rounded-full border border-border/60">
                {sampleList.length} {lang === "en" ? "samples" : "sampel"}
              </span>
            </div>

            {/* Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSubstrateDropdownOpen(!isSubstrateDropdownOpen)}
                className="w-full text-left px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border border-border bg-bg-alt/70 hover:bg-bg-alt hover:border-accent/50 text-ink flex items-center justify-between shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
                  <span
                    className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-2xs"
                    style={{ backgroundColor: activeSample.colorHex }}
                  />
                  <span className="truncate text-ink">
                    {lang === "en" ? activeSample.nameEn : activeSample.nameId}
                  </span>
                  {activeSample.origin === "digested" && (
                    <span className="text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                      Digested ✨
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
                    isSubstrateDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu Popover */}
              <AnimatePresence>
                {isSubstrateDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsSubstrateDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-surface rounded-2xl border border-border shadow-dropdown p-1.5 max-h-[260px] overflow-y-auto space-y-1"
                    >
                      {sampleList.map((s) => {
                        const isSelected = selectedSampleId === s.id;
                        const isDigested = s.origin === "digested";
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSampleId(s.id);
                              setIsSubstrateDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-accent/10 text-accent font-bold"
                                : "hover:bg-bg-alt text-ink"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                                style={{ backgroundColor: s.colorHex }}
                              />
                              <span className="truncate">
                                {lang === "en" ? s.nameEn : s.nameId}
                              </span>
                            </div>
                            {isDigested ? (
                              <span className="text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                                Digested ✨
                              </span>
                            ) : isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                            ) : null}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Active Substrate Sample Quick Info */}
            <div className="mt-2.5 p-2.5 rounded-2xl bg-bg-alt/70 border border-border/80 text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-ink mb-0.5">
                <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{lang === "en" ? "Substrate Matrix Profile" : "Karakteristik Matriks Substrat"}</span>
              </div>
              <p className="text-muted leading-relaxed line-clamp-2">
                {lang === "en" ? activeSample.composition.descriptionEn : activeSample.composition.descriptionId}
              </p>
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="bg-surface rounded-3xl p-5 border border-border shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-extrabold">3</span>
              <span>{lang === "en" ? "3. Configure Conditions" : "3. Atur Kondisi Lingkungan"}</span>
            </h3>

            {/* Temperature Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center gap-1.5 text-muted">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                  {t.tempLabel}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${getTempColor(temperature)}`}>
                  {temperature}°C
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-2 mt-0.5">
                <span>0°C (Ice)</span>
                <span className="text-emerald-600 font-bold">37°C (Body)</span>
                <span>80°C (Boil)</span>
              </div>
            </div>

            {/* pH Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center gap-1.5 text-muted">
                  <Activity className="w-3.5 h-3.5 text-purple-500" />
                  {t.phLabel}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-accent text-white shadow-2xs"
                >
                  pH {ph.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="14.0"
                step="0.2"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-2 mt-0.5">
                <span>pH 1 (Acid)</span>
                <span className="text-emerald-600 font-bold">pH 7 (Neutral)</span>
                <span>pH 14 (Base)</span>
              </div>
            </div>

            {/* Substrate Concentration [S] */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-muted">{t.substrateConcLabel}</span>
                <span className="text-xs font-bold text-ink">{substrateConc} mM</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={substrateConc}
                onChange={(e) => setSubstrateConc(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Enzyme Concentration [E] */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-muted">{t.enzymeConcLabel}</span>
                <span className="text-xs font-bold text-ink">{enzymeConc} nM</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={enzymeConc}
                onChange={(e) => setEnzymeConc(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            {/* Duration */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-muted">{t.durationLabel}</span>
                <span className="text-xs font-bold text-ink">{duration} min</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-slate-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Kinetic Charts & Animated Reaction Chamber (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Reaction Status & Kinetic Gauges Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs">
              <span className="text-[10px] uppercase font-bold text-muted block mb-0.5">
                {t.currentRate}
              </span>
              <p className="text-lg font-black text-ink">
                {simulationResult.initialRate}{" "}
                <span className="text-xs font-medium text-muted">mM/min</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs">
              <span className="text-[10px] uppercase font-bold text-muted block mb-0.5">
                {t.conversionYield}
              </span>
              <p className="text-lg font-black text-emerald-600">
                {simulationResult.conversionPercent}%
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs">
              <span className="text-[10px] uppercase font-bold text-muted block mb-0.5">
                {t.substrateRemaining}
              </span>
              <p className="text-lg font-black text-blue-600">
                {simulationResult.finalSubstrate}{" "}
                <span className="text-xs font-medium text-muted">mM</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs">
              <span className="text-[10px] uppercase font-bold text-muted block mb-0.5">
                {t.productFormed}
              </span>
              <p className="text-lg font-black text-purple-600">
                {simulationResult.finalProduct}{" "}
                <span className="text-xs font-medium text-muted">mM</span>
              </p>
            </div>
          </div>

          {/* Molecular Status Alert */}
          {simulationResult.isDenatured && (
            <div className="p-4 rounded-2xl bg-red-light/35 border-2 border-red/40 text-ink flex items-center gap-3 text-xs leading-relaxed animate-fade-in shadow-xs">
              <Flame className="w-5 h-5 shrink-0 text-red" />
              <div>
                <strong className="font-extrabold text-ink block mb-0.5">
                  {lang === "en" ? "Thermal Denaturation Detected!" : "Denaturasi Termal Terdeteksi!"}
                </strong>
                <p className="text-ink font-medium leading-relaxed">
                  {lang === "en"
                    ? simulationResult.explanationEn
                    : simulationResult.explanationId}
                </p>
              </div>
            </div>
          )}

          {simulationResult.isColdInhibited && !simulationResult.isDenatured && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 text-ink flex items-center gap-3 text-xs leading-relaxed animate-fade-in shadow-xs">
              <Snowflake className="w-5 h-5 shrink-0 text-blue-600" />
              <div>
                <strong className="font-extrabold text-ink block mb-0.5">
                  {lang === "en" ? "Kinetic Inhibition by Low Temperature" : "Hambatan Kinetik Suhu Rendah"}
                </strong>
                <p className="text-ink font-medium leading-relaxed">
                  {lang === "en"
                    ? simulationResult.explanationEn
                    : simulationResult.explanationId}
                </p>
              </div>
            </div>
          )}

          {/* Dynamic SVG Charts */}
          <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-xs space-y-6">
            {/* Chart 1: [S] and [P] vs Time */}
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-extrabold">4</span>
                  <span>{t.chartSubstrateProduct}</span>
                </h4>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-3 h-0.5 bg-blue-600 rounded-full" />
                    [S] Substrat
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-600">
                    <span className="w-3 h-0.5 bg-purple-600 rounded-full" />
                    [P] Produk
                  </span>
                  {comparedResult && (
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-3 h-0.5 border-t border-dashed border-slate-500" />
                      {lang === "en" ? "Comparison Run" : "Kondisi Pembanding"}
                    </span>
                  )}
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-auto bg-bg-alt/30 rounded-2xl border border-border/50"
                >
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = chartH - padding - frac * (chartH - 2 * padding);
                    return (
                      <line
                        key={frac}
                        x1={padding}
                        y1={y}
                        x2={chartW - padding}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity="0.08"
                        strokeDasharray="3 3"
                      />
                    );
                  })}

                  {/* Y-Axis Label */}
                  <text
                    x={padding}
                    y={padding - 8}
                    fill="currentColor"
                    opacity="0.5"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    Conc (mM)
                  </text>

                  {/* X-Axis Label */}
                  <text
                    x={chartW - padding}
                    y={chartH - 6}
                    textAnchor="end"
                    fill="currentColor"
                    opacity="0.5"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    Time (min)
                  </text>

                  {/* Current [S] Substrate Curve */}
                  <path
                    d={simulationResult.timeSeries.reduce((acc, pt, i) => {
                      const x = padding + (pt.timeMinutes / duration) * (chartW - 2 * padding);
                      const y =
                        chartH - padding - (pt.substrate / substrateConc) * (chartH - 2 * padding);
                      return `${acc} ${i === 0 ? "M" : "L"} ${x} ${y}`;
                    }, "")}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Current [P] Product Curve */}
                  <path
                    d={simulationResult.timeSeries.reduce((acc, pt, i) => {
                      const x = padding + (pt.timeMinutes / duration) * (chartW - 2 * padding);
                      const y =
                        chartH - padding - (pt.product / substrateConc) * (chartH - 2 * padding);
                      return `${acc} ${i === 0 ? "M" : "L"} ${x} ${y}`;
                    }, "")}
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Optional Comparison [P] Curve */}
                  {comparedResult && (
                    <path
                      d={comparedResult.timeSeries.reduce((acc, pt, i) => {
                        const x =
                          padding +
                          (pt.timeMinutes / comparedResult.conditions.durationMinutes) *
                            (chartW - 2 * padding);
                        const y =
                          chartH -
                          padding -
                          (pt.product / comparedResult.conditions.substrateConc) *
                            (chartH - 2 * padding);
                        return `${acc} ${i === 0 ? "M" : "L"} ${x} ${y}`;
                      }, "")}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Dual Profile Mini-Charts: v0 vs T and v0 vs pH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/70">
              {/* v0 vs Temperature */}
              <div>
                <h5 className="text-[11px] font-bold text-muted mb-2 flex items-center justify-between">
                  <span>{t.chartRateVsTemp}</span>
                  <span className="text-orange-500 font-extrabold">{temperature}°C</span>
                </h5>
                <svg viewBox="0 0 200 90" className="w-full h-auto bg-bg-alt/30 rounded-xl border border-border/50">
                  {/* Bell Curve */}
                  <path
                    d={Array.from({ length: 41 }, (_, i) => {
                      const temp = i * 2; // 0 to 80
                      const factor = calculateTemperatureFactor(
                        temp,
                        activeEnzyme.optimumTemp,
                        activeEnzyme.denaturationTemp
                      );
                      const x = 15 + (temp / 80) * 170;
                      const y = 80 - factor * 65;
                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                  />
                  {/* Marker for Current Temp */}
                  {(() => {
                    const factor = calculateTemperatureFactor(
                      temperature,
                      activeEnzyme.optimumTemp,
                      activeEnzyme.denaturationTemp
                    );
                    const x = 15 + (temperature / 80) * 170;
                    const y = 80 - factor * 65;
                    return (
                      <circle cx={x} cy={y} r="4" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                    );
                  })()}
                </svg>
              </div>

              {/* v0 vs pH */}
              <div>
                <h5 className="text-[11px] font-bold text-muted mb-2 flex items-center justify-between">
                  <span>{t.chartRateVsPh}</span>
                  <span className="text-purple-600 font-extrabold">pH {ph.toFixed(1)}</span>
                </h5>
                <svg viewBox="0 0 200 90" className="w-full h-auto bg-bg-alt/30 rounded-xl border border-border/50">
                  {/* Bell Curve */}
                  <path
                    d={Array.from({ length: 41 }, (_, i) => {
                      const curPh = 1 + (i / 40) * 13; // 1 to 14
                      const factor = calculatePhFactor(curPh, activeEnzyme.optimumPh, activeEnzyme.phTolerance);
                      const x = 15 + ((curPh - 1) / 13) * 170;
                      const y = 80 - factor * 65;
                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                  />
                  {/* Marker for Current pH */}
                  {(() => {
                    const factor = calculatePhFactor(ph, activeEnzyme.optimumPh, activeEnzyme.phTolerance);
                    const x = 15 + ((ph - 1) / 13) * 170;
                    const y = 80 - factor * 65;
                    return (
                      <circle cx={x} cy={y} r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Bottom Actions: Log Run & Comparison */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAsComparison}
                  className="px-3.5 py-2 rounded-xl border border-border hover:bg-bg-alt text-xs font-semibold text-muted hover:text-ink transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Set as Condition A" : "Simpan Kondisi A"}</span>
                </button>
                {comparedResult && (
                  <button
                    onClick={handleClearComparison}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    {lang === "en" ? "Clear Comparison" : "Hapus Pembanding"}
                  </button>
                )}
              </div>

              <button
                onClick={handleLogObservation}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-dark transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "5. Log Reaction to Journal" : "5. Catat Reaksi ke Jurnal"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Standard reference note (styled just like zone-simulation.tsx) */}
      <p className="text-[11px] text-muted inline-flex items-start gap-1.5">
        <FlaskConical className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-accent" />
        {lang === "en"
          ? "Standard (simplified): Amylase optimum ~37°C pH 6.8 · Pepsin optimum ~37°C pH 2.0 · Lipase optimum ~37°C pH 8.0."
          : "Standar (disederhanakan): Amilase optimum ~37°C pH 6.8 · Pepsin optimum ~37°C pH 2.0 · Lipase optimum ~37°C pH 8.0."}
      </p>

      {/* Prosedur lengkap card (styled identically to zone-simulation.tsx) */}
      <button
        type="button"
        onClick={() => setShowProcedureModal(true)}
        className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface border border-border/50 shadow-card hover:-translate-y-0.5 transition-transform group w-full text-left cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white flex items-center justify-center font-extrabold flex-shrink-0 shadow-sm">
          📋
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-ink group-hover:text-accent transition-colors">
            {lang === "en" ? "Full enzyme kinetics procedure" : "Prosedur lengkap kinetika enzim"}
          </p>
          <p className="text-[11px] text-muted truncate">
            {lang === "en" ? "Apparatus, substrates & 5 work steps" : "Alat, substrat & 5 langkah kerja"}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </button>

      {/* Full Procedure Modal */}
      <BiochemProcedureModal
        isOpen={showProcedureModal}
        onClose={() => setShowProcedureModal(false)}
        activeModule="enzyme"
      />
    </div>
  );
}
