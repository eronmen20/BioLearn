"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FlaskConical,
  Flame,
  Droplet,
  RotateCcw,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  Sparkles,
  Info,
  ChevronDown,
} from "lucide-react";
import {
  FoodSample,
  SampleId,
  PREDEFINED_SAMPLES,
  TestId,
  TestResult,
  runBiochemicalTest,
  ObservationLogEntry,
} from "@/lib/biochem-engine";
import { BIOCHEM_I18N } from "@/lib/biochem-i18n";
import { useLangStore } from "@/lib/lang-store";
import { BiochemProcedureModal } from "./biochem-procedure-modal";

export interface VirtualTestTube {
  id: string;
  tubeNumber: number;
  sample: FoodSample;
  testId?: TestId;
  reagentAdded: boolean;
  heated: boolean;
  mixedWithWater: boolean;
  result?: TestResult;
}

interface FoodTestingBenchProps {
  samples: Record<string, FoodSample>;
  onLogObservation: (entry: ObservationLogEntry) => void;
  onSendToEnzymeLab: (sample: FoodSample) => void;
}

export function FoodTestingBench({
  samples,
  onLogObservation,
  onSendToEnzymeLab,
}: FoodTestingBenchProps) {
  const { lang } = useLangStore();
  const t = BIOCHEM_I18N[lang];

  // State
  const sampleList = Object.values(samples);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(sampleList[0]?.id || "starch_sol");
  const [selectedTestId, setSelectedTestId] = useState<TestId>("lugol");
  const [tubes, setTubes] = useState<VirtualTestTube[]>([
    {
      id: "tube-1",
      tubeNumber: 1,
      sample: samples.starch_sol || sampleList[0],
      testId: "lugol",
      reagentAdded: true,
      heated: false,
      mixedWithWater: false,
      result: runBiochemicalTest(samples.starch_sol || sampleList[0], "lugol"),
    },
  ]);
  const [activeTubeId, setActiveTubeId] = useState<string>("tube-1");
  const [showExplanation, setShowExplanation] = useState(false);
  const [isHeating, setIsHeating] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSampleDropdownOpen, setIsSampleDropdownOpen] = useState(false);
  const [isReagentDropdownOpen, setIsReagentDropdownOpen] = useState(false);
  const [isDispensing, setIsDispensing] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);

  const activeTube = tubes.find((t) => t.id === activeTubeId) || tubes[0];
  const activeSample = samples[selectedSampleId] || sampleList[0];
  const activeReagentColor =
    selectedTestId === "lugol"
      ? "#d97706"
      : selectedTestId === "biuret"
      ? "#8b5cf6"
      : selectedTestId === "benedict"
      ? "#3b82f6"
      : "#10b981";

  // Add new test tube to rack
  const handleAddTube = () => {
    if (tubes.length >= 6) return;
    const newNum = tubes.length + 1;
    const newTube: VirtualTestTube = {
      id: `tube-${Date.now()}`,
      tubeNumber: newNum,
      sample: activeSample,
      reagentAdded: false,
      heated: false,
      mixedWithWater: false,
    };
    setTubes((prev) => [...prev, newTube]);
    setActiveTubeId(newTube.id);
  };

  // Remove a tube
  const handleRemoveTube = (tubeId: string) => {
    if (tubes.length <= 1) {
      // Just clear current tube
      setTubes([
        {
          id: `tube-${Date.now()}`,
          tubeNumber: 1,
          sample: activeSample,
          reagentAdded: false,
          heated: false,
          mixedWithWater: false,
        },
      ]);
      return;
    }
    const filtered = tubes.filter((t) => t.id !== tubeId);
    setTubes(filtered);
    if (activeTubeId === tubeId) {
      setActiveTubeId(filtered[0].id);
    }
  };

  // Dispense Reagent with animated pipette dropper
  const handleDispenseReagent = () => {
    if (!activeTube || isDispensing) return;
    setIsDispensing(true);

    setTimeout(() => {
      const result = runBiochemicalTest(activeTube.sample, selectedTestId, {
        heated: activeTube.heated,
        mixedWithWater: activeTube.mixedWithWater,
      });

      setTubes((prev) =>
        prev.map((t) =>
          t.id === activeTube.id
            ? {
                ...t,
                testId: selectedTestId,
                reagentAdded: true,
                result,
              }
            : t
        )
      );
      setIsDispensing(false);
    }, 1200);
  };

  // Heat over water bath (Benedict test step)
  const handleHeatWaterBath = () => {
    if (!activeTube || !activeTube.reagentAdded) return;
    setIsHeating(true);
    setTimeout(() => {
      setIsHeating(false);
      const updatedResult = runBiochemicalTest(activeTube.sample, activeTube.testId || selectedTestId, {
        heated: true,
        mixedWithWater: activeTube.mixedWithWater,
      });

      setTubes((prev) =>
        prev.map((t) =>
          t.id === activeTube.id
            ? {
                ...t,
                heated: true,
                result: updatedResult,
              }
            : t
        )
      );
    }, 1200);
  };

  // Add water & shake (Emulsion test step)
  const handleAddWaterMix = () => {
    if (!activeTube || !activeTube.reagentAdded) return;
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      const updatedResult = runBiochemicalTest(activeTube.sample, activeTube.testId || selectedTestId, {
        heated: activeTube.heated,
        mixedWithWater: true,
      });

      setTubes((prev) =>
        prev.map((t) =>
          t.id === activeTube.id
            ? {
                ...t,
                mixedWithWater: true,
                result: updatedResult,
              }
            : t
        )
      );
    }, 900);
  };

  // Clear all tubes
  const handleResetRack = () => {
    setTubes([
      {
        id: `tube-${Date.now()}`,
        tubeNumber: 1,
        sample: activeSample,
        reagentAdded: false,
        heated: false,
        mixedWithWater: false,
      },
    ]);
  };

  // Log active observation to lab journal
  const handleLogActive = () => {
    if (!activeTube || !activeTube.result) return;
    const r = activeTube.result;

    const testNames: Record<TestId, { id: string; en: string }> = {
      lugol: { id: "Uji Lugol (Pati)", en: "Lugol Test (Starch)" },
      biuret: { id: "Uji Biuret (Protein)", en: "Biuret Test (Protein)" },
      benedict: { id: "Uji Benedict (Gula Pereduksi)", en: "Benedict's Test (Reducing Sugar)" },
      emulsion: { id: "Uji Emulsi (Lipid)", en: "Emulsion Test (Lipids)" },
    };

    onLogObservation({
      id: `obs-${Date.now()}`,
      timestamp: Date.now(),
      type: "food_test",
      titleId: `${testNames[r.testId].id} pada ${activeTube.sample.nameId}`,
      titleEn: `${testNames[r.testId].en} on ${activeTube.sample.nameEn}`,
      sampleName: lang === "en" ? activeTube.sample.nameEn : activeTube.sample.nameId,
      testOrEnzyme: lang === "en" ? testNames[r.testId].en : testNames[r.testId].id,
      conditionsSummary: r.heated
        ? lang === "en"
          ? "Heated in water bath"
          : "Dipanaskan penangas air"
        : r.mixedWithWater
        ? lang === "en"
          ? "Diluted with water & shaken"
          : "Dikocok + akuades"
        : lang === "en"
        ? "Room temperature (~25°C)"
        : "Suhu ruang (~25°C)",
      observationId: r.appearanceId,
      observationEn: r.appearanceEn,
      interpretationId: r.interpretationId,
      interpretationEn: r.interpretationEn,
      resultBadge: r.qualitativeResult.toUpperCase(),
      colorHex: r.colorHex,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="p-2 rounded-xl bg-accent/10 text-accent font-bold text-sm shrink-0">🧪 Module 1</span>
              <h2 className="text-xl sm:text-2xl font-black text-ink">{t.foodTestTitle}</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted">{t.foodTestSubtitle}</p>
          </div>

          {/* Right Corner Action Buttons */}
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
              onClick={handleResetRack}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl border border-border hover:border-accent/40 bg-surface hover:bg-bg-alt text-ink/80 hover:text-ink text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted shrink-0" />
              <span>{t.resetBench}</span>
            </button>
            <button
              type="button"
              onClick={() => onSendToEnzymeLab(activeTube?.sample || activeSample)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-accent text-white hover:bg-accent-dark transition-all text-xs font-bold shadow-xs hover:shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>{t.sendToEnzymeLab}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bench Layout: Workbench Row (Left Controls & Right Virtual Rack) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Left Column: Sample & Reagent Dispensers (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
          {/* Sample Selector Dropdown */}
          <div className="bg-surface rounded-3xl p-4 border border-border shadow-xs relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-extrabold">1</span>
                <span>{lang === "en" ? "1. Select Food Sample" : "1. Pilih Sampel Makanan"}</span>
              </h3>
              <span className="text-[10px] font-semibold text-muted bg-bg-alt px-2 py-0.5 rounded-full border border-border/60">
                {sampleList.length} {lang === "en" ? "samples" : "sampel"}
              </span>
            </div>

            {/* Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSampleDropdownOpen(!isSampleDropdownOpen)}
                className="w-full text-left px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border border-border bg-bg-alt/70 hover:bg-bg-alt hover:border-accent/50 text-ink flex items-center justify-between shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-2xs"
                    style={{ backgroundColor: activeSample.colorHex }}
                  />
                  <span className="truncate text-ink">{lang === "en" ? activeSample.nameEn : activeSample.nameId}</span>
                  {activeSample.origin === "digested" && (
                    <span className="text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                      Digested ✨
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
                    isSampleDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu Popover */}
              <AnimatePresence>
                {isSampleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsSampleDropdownOpen(false)}
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
                              if (activeTube && !activeTube.reagentAdded) {
                                setTubes((prev) =>
                                  prev.map((t) => (t.id === activeTube.id ? { ...t, sample: s } : t))
                                );
                              }
                              setIsSampleDropdownOpen(false);
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
                              <span className="truncate">{lang === "en" ? s.nameEn : s.nameId}</span>
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

            {/* Active Sample Quick Info */}
            <div className="mt-2.5 p-2.5 rounded-2xl bg-bg-alt/70 border border-border/80 text-[11px] leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-ink mb-0.5">
                <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{lang === "en" ? "Sample Profile" : "Karakteristik Sampel"}</span>
              </div>
              <p className="text-muted leading-relaxed line-clamp-2">
                {lang === "en" ? activeSample.composition.descriptionEn : activeSample.composition.descriptionId}
              </p>
            </div>
          </div>

          {/* Reagent Selector Dropdown */}
          <div className="bg-surface rounded-3xl p-4 border border-border shadow-xs relative flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-extrabold">2</span>
                  <span>{lang === "en" ? "2. Select Reagent" : "2. Pilih Reagen Uji"}</span>
                </h3>
                <span className="text-[10px] font-semibold text-muted bg-bg-alt px-2 py-0.5 rounded-full border border-border/60">
                  4 {lang === "en" ? "reagents" : "reagen"}
                </span>
              </div>

              {/* Reagent Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsReagentDropdownOpen(!isReagentDropdownOpen)}
                  className="w-full text-left px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border border-border bg-bg-alt/70 hover:bg-bg-alt hover:border-accent/50 text-ink flex items-center justify-between shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-2xs"
                      style={{
                        backgroundColor:
                          selectedTestId === "lugol"
                            ? "#d97706"
                            : selectedTestId === "biuret"
                            ? "#8b5cf6"
                            : selectedTestId === "benedict"
                            ? "#3b82f6"
                            : "#10b981",
                      }}
                    />
                    <span className="truncate text-ink">
                      {selectedTestId === "lugol"
                        ? t.reagentLugolName
                        : selectedTestId === "biuret"
                        ? t.reagentBiuretName
                        : selectedTestId === "benedict"
                        ? t.reagentBenedictName
                        : t.reagentEmulsionName}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
                      isReagentDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Reagent Dropdown Menu Popover */}
                <AnimatePresence>
                  {isReagentDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsReagentDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-surface rounded-2xl border border-border shadow-dropdown p-1.5 space-y-1"
                      >
                        {[
                          {
                            id: "lugol" as TestId,
                            name: t.reagentLugolName,
                            target: lang === "en" ? "Starch (Amylose)" : "Pati (Amilosa)",
                            color: "#d97706",
                          },
                          {
                            id: "biuret" as TestId,
                            name: t.reagentBiuretName,
                            target: lang === "en" ? "Peptide Bonds (Protein)" : "Ikatan Peptida (Protein)",
                            color: "#8b5cf6",
                          },
                          {
                            id: "benedict" as TestId,
                            name: t.reagentBenedictName,
                            target: lang === "en" ? "Reducing Sugars (+ Heat)" : "Gula Pereduksi (+ Panas)",
                            color: "#3b82f6",
                          },
                          {
                            id: "emulsion" as TestId,
                            name: t.reagentEmulsionName,
                            target: lang === "en" ? "Lipids/Fats (+ Water)" : "Lemak/Lipid (+ Akuades)",
                            color: "#10b981",
                          },
                        ].map((r) => {
                          const isSelected = selectedTestId === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                setSelectedTestId(r.id);
                                setIsReagentDropdownOpen(false);
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
                                  style={{ backgroundColor: r.color }}
                                />
                                <div className="truncate">
                                  <div className="font-bold text-ink truncate">{r.name}</div>
                                  <div className="text-[10px] text-muted truncate">{r.target}</div>
                                </div>
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-accent shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Active Reagent Info Card */}
              <div className="mt-2.5 p-2.5 rounded-2xl bg-bg-alt/70 border border-border/80 text-[11px] leading-relaxed">
                <div className="flex items-center justify-between gap-1.5 font-bold text-ink mb-1">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{lang === "en" ? "Target:" : "Target Deteksi:"}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">
                    {selectedTestId === "lugol"
                      ? lang === "en"
                        ? "Starch (Amylose)"
                        : "Pati (Amilosa)"
                      : selectedTestId === "biuret"
                      ? lang === "en"
                        ? "Peptide Bonds"
                        : "Ikatan Peptida"
                      : selectedTestId === "benedict"
                      ? lang === "en"
                        ? "Reducing Sugars"
                        : "Gula Pereduksi"
                      : lang === "en"
                      ? "Lipids / Fats"
                      : "Lemak / Lipid"}
                  </span>
                </div>
                <p className="text-muted leading-relaxed line-clamp-2">
                  {selectedTestId === "lugol"
                    ? t.reagentLugolDesc
                    : selectedTestId === "biuret"
                    ? t.reagentBiuretDesc
                    : selectedTestId === "benedict"
                    ? t.reagentBenedictDesc
                    : t.reagentEmulsionDesc}
                </p>
                {selectedTestId === "benedict" && (
                  <div className="mt-2 text-[11px] text-ink font-medium flex items-center gap-1.5 bg-orange/10 p-2 rounded-xl border border-orange/30">
                    <span className="text-orange text-sm shrink-0">♨️</span>
                    <span>{lang === "en" ? "Requires water bath heating after dispensing." : "Perlu pemanasan penangas air setelah diteteskan."}</span>
                  </div>
                )}
                {selectedTestId === "emulsion" && (
                  <div className="mt-2 text-[11px] text-ink font-medium flex items-center gap-1.5 bg-green-light/50 p-2 rounded-xl border border-green/30">
                    <span className="text-green text-sm shrink-0">💧</span>
                    <span>{lang === "en" ? "Requires water addition & shaking to form emulsion." : "Perlu penambahan akuades & pengocokan agar emulsi terbentuk."}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button: Dispense (Pinned to bottom of left card) */}
            <button
              onClick={handleDispenseReagent}
              disabled={isDispensing}
              className="mt-3 w-full py-2.5 px-4 rounded-2xl bg-accent text-white font-bold text-xs sm:text-sm hover:bg-accent-dark transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
            >
              <Droplet className={`w-4 h-4 ${isDispensing ? "animate-bounce text-amber-300" : ""}`} />
              <span>
                {isDispensing
                  ? lang === "en"
                    ? "Dispensing Droplets..."
                    : "Meneteskan Reagen..."
                  : t.addReagent}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Virtual Rack (7 cols) */}
        <div className="lg:col-span-7">
          {/* Test Tube Rack Card */}
          <div className="bg-surface rounded-3xl p-4 sm:p-5 border border-border shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-extrabold">3</span>
                  <span>{lang === "en" ? "3. Dispense & React in Rack" : "3. Teteskan Reagen & Reaksikan"}</span>
                  <span className="text-[11px] font-normal text-muted">({tubes.length}/6)</span>
                </h3>
                <button
                  onClick={handleAddTube}
                  disabled={tubes.length >= 6}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-accent text-white shadow-xs hover:bg-accent-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "New Tube" : "Tabung Baru"}</span>
                </button>
              </div>

              {/* Visual Test Tube Rack */}
              <div className="relative pt-16 pb-4 px-3 sm:px-5 rounded-3xl bg-gradient-to-b from-bg-alt/30 via-bg-alt/70 to-surface border border-border/80 overflow-visible">
                {/* Rack Wood/Metal Bar top */}
                <div className="h-2 w-full rounded-full bg-slate-300 dark:bg-slate-700 mb-3.5 shadow-inner" />

                {/* Tubes Container */}
                <div className="w-full flex items-end justify-center gap-1.5 sm:gap-3.5 min-h-[160px] px-1">
                  {tubes.map((tube) => {
                    const isSelected = tube.id === activeTube.id;
                    const liquidColor = tube.result
                      ? tube.result.colorHex
                      : tube.sample.colorHex;

                    return (
                      <div
                        key={tube.id}
                        onClick={() => setActiveTubeId(tube.id)}
                        className="group flex flex-col items-center cursor-pointer select-none transition-transform hover:-translate-y-1 flex-1 max-w-[48px] min-w-[32px] relative"
                      >
                        {/* Pipette Dropper Tool Animation */}
                        <AnimatePresence>
                          {isDispensing && isSelected && (
                            <motion.div
                              initial={{ y: -30, opacity: 0, scale: 0.85 }}
                              animate={{ y: 0, opacity: 1, scale: 1 }}
                              exit={{ y: -30, opacity: 0, scale: 0.85 }}
                              transition={{ type: "spring", stiffness: 350, damping: 25 }}
                              className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center"
                            >
                              {/* Rubber Squeeze Bulb */}
                              <motion.div
                                animate={{
                                  scaleY: [1, 0.7, 1, 0.7, 1],
                                  scaleX: [1, 1.15, 1, 1.15, 1],
                                }}
                                transition={{
                                  duration: 1.0,
                                  times: [0, 0.25, 0.5, 0.75, 1],
                                }}
                                className="w-3.5 h-5 rounded-t-full rounded-b-xs bg-gradient-to-b from-red-500 via-red-600 to-red-700 shadow-md border border-red-800"
                              />

                              {/* Glass Collar */}
                              <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-xs shadow-2xs" />

                              {/* Glass Stem with liquid */}
                              <div className="w-2.5 h-10 bg-white/70 dark:bg-white/20 border-x border-slate-400 backdrop-blur-xs relative flex flex-col justify-end overflow-hidden shadow-xs">
                                <motion.div
                                  initial={{ height: "80%" }}
                                  animate={{ height: ["80%", "55%", "35%", "15%"] }}
                                  transition={{ duration: 1.1, ease: "easeInOut" }}
                                  className="w-full opacity-90"
                                  style={{ backgroundColor: activeReagentColor }}
                                />
                              </div>

                              {/* Tapered Pipette Tip */}
                              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[8px] border-t-slate-400 relative">
                                <div
                                  className="absolute -top-[8px] -left-[2.5px] w-0 h-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-t-[6px]"
                                  style={{ borderTopColor: activeReagentColor }}
                                />
                              </div>

                              {/* Falling Liquid Droplets */}
                              <div className="relative w-2.5 h-9 overflow-visible">
                                <motion.div
                                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                                  animate={{
                                    y: [0, 6, 28],
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1.2, 0.7],
                                  }}
                                  transition={{
                                    duration: 0.45,
                                    delay: 0.2,
                                    ease: "easeIn",
                                  }}
                                  className="w-2 h-3 rounded-full absolute left-1/2 -translate-x-1/2 shadow-xs"
                                  style={{
                                    backgroundColor: activeReagentColor,
                                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                                  }}
                                />
                                <motion.div
                                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                                  animate={{
                                    y: [0, 6, 28],
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1.2, 0.7],
                                  }}
                                  transition={{
                                    duration: 0.45,
                                    delay: 0.65,
                                    ease: "easeIn",
                                  }}
                                  className="w-2 h-3 rounded-full absolute left-1/2 -translate-x-1/2 shadow-xs"
                                  style={{
                                    backgroundColor: activeReagentColor,
                                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                                  }}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Tube Rim & Glass Container */}
                        <motion.div
                          animate={
                            isShaking && isSelected
                              ? { x: [-3, 3, -3, 3, 0], rotate: [-2, 2, -2, 2, 0] }
                              : isDispensing && isSelected
                              ? { scale: [1, 1.03, 1], transition: { delay: 0.4, duration: 0.3 } }
                              : {}
                          }
                          className={`relative w-full h-32 sm:h-36 rounded-b-full border-2 transition-all flex flex-col justify-end p-0.5 overflow-hidden shadow-sm ${
                            isSelected
                              ? "border-accent ring-2 ring-accent/30 shadow-md bg-white/40 dark:bg-white/5"
                              : "border-slate-300 dark:border-slate-700 bg-white/20 dark:bg-white/5 hover:border-slate-400"
                          }`}
                        >
                          {/* Steam/Bubbles if heating */}
                          {isHeating && isSelected && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6 }}
                              className="absolute top-2 inset-x-0 flex justify-center text-orange text-xs"
                            >
                              ♨️
                            </motion.div>
                          )}

                          {/* Liquid Level */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{
                              height:
                                isDispensing && isSelected
                                  ? "65%"
                                  : tube.reagentAdded
                                  ? "65%"
                                  : "35%",
                            }}
                            transition={{ duration: 0.6, delay: isDispensing ? 0.4 : 0 }}
                            className="w-full rounded-b-full relative transition-colors duration-500 overflow-hidden"
                            style={{
                              backgroundColor:
                                isDispensing && isSelected
                                  ? activeReagentColor
                                  : liquidColor,
                            }}
                          >
                            {/* Meniscus wave */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-white/30 rounded-full" />
                            {/* Emulsion cloudiness overlay if lipid positive */}
                            {tube.result?.testId === "emulsion" && tube.result?.mixedWithWater && (
                              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs animate-pulse-slow" />
                            )}
                          </motion.div>
                        </motion.div>

                        {/* Tube Label Indicator */}
                        <span
                          className={`mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                            isSelected
                              ? "bg-accent text-white shadow-xs"
                              : "bg-border/60 text-muted group-hover:text-ink"
                          }`}
                        >
                          #{tube.tubeNumber}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Rack Base Bar */}
                <div className="h-3 w-full rounded-xl bg-slate-400 dark:bg-slate-600 mt-2 shadow-sm flex items-center justify-center">
                  <div className="w-1/3 h-0.5 bg-slate-500/40 rounded-full" />
                </div>
              </div>
            </div>

            {/* Context Actions for Selected Tube (Pinned to bottom of Right card) */}
            <div className="mt-3 pt-3 border-t border-border/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted">
                  {lang === "en" ? "Selected Tube:" : "Tabung Terpilih:"}{" "}
                  <strong className="text-ink">#{activeTube?.tubeNumber}</strong> (
                  {lang === "en" ? activeTube?.sample.nameEn : activeTube?.sample.nameId})
                </span>
                <button
                  onClick={() => handleRemoveTube(activeTube.id)}
                  title={lang === "en" ? "Remove Tube" : "Hapus Tabung"}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red/10 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Remove" : "Hapus"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Water Bath Button (Needed for Benedict) */}
                <button
                  onClick={handleHeatWaterBath}
                  disabled={!activeTube?.reagentAdded || isHeating}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed ${
                    activeTube?.testId === "benedict" && !activeTube?.heated
                      ? "border-orange bg-orange text-white shadow-md animate-pulse"
                      : "border-border bg-bg-alt/80 text-ink/75 hover:bg-bg-alt hover:text-ink disabled:opacity-50"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-orange" />
                  <span>{isHeating ? (lang === "en" ? "Heating in Water Bath..." : "Memanaskan di Penangas...") : t.heatWaterBath}</span>
                </button>

                {/* Shake & Dilute Button (Needed for Emulsion) */}
                <button
                  onClick={handleAddWaterMix}
                  disabled={!activeTube?.reagentAdded || isShaking}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed ${
                    activeTube?.testId === "emulsion" && !activeTube?.mixedWithWater
                      ? "border-green bg-green text-white shadow-md animate-pulse"
                      : "border-border bg-bg-alt/80 text-ink/75 hover:bg-bg-alt hover:text-ink disabled:opacity-50"
                  }`}
                >
                  <Droplet className="w-3.5 h-3.5 text-green" />
                  <span>{isShaking ? (lang === "en" ? "Mixing with Water..." : "Mengocok + Akuades...") : t.addWaterMix}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Observation Output & Scientific Explanation Card (Full Width Below) */}
      <div className="bg-surface rounded-3xl p-4 sm:p-5 border border-border shadow-xs">
        <h3 className="text-xs font-bold text-ink mb-3 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-accent/15 text-accent text-[10px] flex items-center justify-center font-extrabold">4</span>
          <span>{lang === "en" ? "4. Observe Reaction & Qualitative Result" : "4. Amati Reaksi & Hasil Diagnostik"}</span>
        </h3>

        {activeTube?.result ? (
          <div className="space-y-3">
            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Result Color Preview */}
              <div className="p-3 rounded-2xl bg-bg-alt/70 border border-border flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-full border-2 border-black/15 shadow-sm shrink-0"
                  style={{ backgroundColor: activeTube.result.colorHex }}
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted block">
                    {lang === "en" ? "Observed Color" : "Warna Teramati"}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-ink leading-snug">
                    {lang === "en" ? activeTube.result.appearanceEn : activeTube.result.appearanceId}
                  </p>
                </div>
              </div>

              {/* Qualitative Badge */}
              <div className="p-3 rounded-2xl bg-bg-alt/70 border border-border flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-muted block mb-1">
                  {lang === "en" ? "Diagnostic Result" : "Hasil Kualitatif"}
                </span>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold w-fit shadow-2xs ${
                    activeTube.result.qualitativeResult === "positive"
                      ? "bg-green text-white"
                      : activeTube.result.qualitativeResult === "trace"
                      ? "bg-amber text-white"
                      : activeTube.result.qualitativeResult === "inconclusive"
                      ? "bg-orange text-white"
                      : "bg-muted text-white"
                  }`}
                >
                  {activeTube.result.qualitativeResult === "positive" && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  {activeTube.result.qualitativeResult === "inconclusive" && <AlertCircle className="w-3.5 h-3.5 text-white" />}
                  <span>{activeTube.result.qualitativeResult.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="text-xs sm:text-sm text-ink leading-relaxed bg-accent/5 p-3.5 rounded-2xl border border-accent/20">
              <span className="font-bold block text-accent mb-0.5 flex items-center gap-1.5">
                <span>💡</span> {lang === "en" ? "Biochemical Interpretation:" : "Interpretasi Biokimiawi:"}
              </span>
              <p>{lang === "en" ? activeTube.result.interpretationEn : activeTube.result.interpretationId}</p>
            </div>

            {/* Button: Record Observation to Journal */}
            <button
              onClick={handleLogActive}
              className="w-full py-2.5 px-4 rounded-2xl bg-accent text-white font-bold text-xs sm:text-sm hover:bg-accent-dark transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "en" ? "5. Record Observation to Journal" : "5. Catat Simpulan ke Jurnal"}</span>
            </button>

            {/* Toggle Scientific Explanation */}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full py-2 text-xs font-semibold text-muted hover:text-ink underline text-center cursor-pointer"
            >
              {showExplanation
                ? lang === "en"
                  ? "Hide Molecular Mechanism ▲"
                  : "Sembunyikan Mekanisme Molekuler ▲"
                : lang === "en"
                ? "View Molecular Mechanism 🔬 ▼"
                : "Lihat Mekanisme Molekuler 🔬 ▼"}
            </button>

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-2xl bg-bg-alt/90 border border-border text-xs text-ink/80 leading-relaxed"
              >
                <strong className="text-ink font-bold block mb-1.5">
                  {lang === "en" ? "Biochemical Principle:" : "Prinsip Kimiawi:"}
                </strong>
                <p>{lang === "en" ? activeTube.result.scientificNoteEn : activeTube.result.scientificNoteId}</p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center text-ink/70 text-xs sm:text-sm">
            <FlaskConical className="w-10 h-10 text-muted/40 mx-auto mb-2" />
            <p className="font-medium max-w-sm mx-auto">
              {lang === "en"
                ? `Select a reagent above, then click 'Dispense Reagent' to begin testing on tube #${activeTube?.tubeNumber}.`
                : `Pilih reagen di atas lalu klik 'Teteskan Reagen' untuk memulai reaksi pada tabung #${activeTube?.tubeNumber}.`}
            </p>
          </div>
        )}
      </div>

      {/* Standard reference note (styled just like zone-simulation.tsx) */}
      <p className="text-[11px] text-muted inline-flex items-start gap-1.5">
        <FlaskConical className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-accent" />
        {lang === "en"
          ? "Standard (simplified): Lugol = Blue-black (Starch) · Biuret = Violet (Protein) · Benedict = Brick red (Reducing sugar) · Emulsion = Milky white (Lipid)."
          : "Standar (disederhanakan): Lugol = Biru-hitam (Amilum) · Biuret = Ungu (Protein) · Benedict = Merah bata (Gula pereduksi) · Emulsi = Putih keruh (Lipid)."}
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
            {lang === "en" ? "Full laboratory procedure" : "Prosedur lengkap"}
          </p>
          <p className="text-[11px] text-muted truncate">
            {lang === "en" ? "Tools, materials & 6 work steps" : "Alat, bahan & 6 langkah kerja"}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </button>

      {/* Full Procedure Modal */}
      <BiochemProcedureModal
        isOpen={showProcedureModal}
        onClose={() => setShowProcedureModal(false)}
        activeModule="food"
      />
    </div>
  );
}
