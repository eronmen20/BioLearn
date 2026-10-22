"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  FlaskConical,
  Activity,
  FileText,
  HelpCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Compass,
} from "lucide-react";
import {
  FoodSample,
  PREDEFINED_SAMPLES,
  ObservationLogEntry,
} from "@/lib/biochem-engine";
import { BIOCHEM_I18N } from "@/lib/biochem-i18n";
import { useLangStore } from "@/lib/lang-store";
import { FoodTestingBench } from "./food-testing-bench";
import { EnzymeReactionBench } from "./enzyme-reaction-bench";
import { LabReportView } from "./lab-report-view";
import { BiochemCheckpoints } from "./biochem-checkpoints";

export type BiochemTab = "overview" | "food_testing" | "enzyme" | "report";

const VALID_TABS: BiochemTab[] = ["overview", "food_testing", "enzyme", "report"];

export function BiochemLabView() {
  const { lang } = useLangStore();
  const t = BIOCHEM_I18N[lang];

  // Active Tab initialized with URL query / hash / localStorage persistence so refresh never loses state
  const [activeTab, setActiveTab] = useState<BiochemTab>(() => {
    if (typeof window === "undefined") return "overview";
    try {
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get("tab") as BiochemTab | null;
      if (queryTab && VALID_TABS.includes(queryTab)) return queryTab;

      const hash = window.location.hash.replace("#", "") as BiochemTab;
      if (VALID_TABS.includes(hash)) return hash;

      const saved = localStorage.getItem("biolearn_biochem_active_tab") as BiochemTab | null;
      if (saved && VALID_TABS.includes(saved)) return saved;
    } catch {
      // fallback
    }
    return "overview";
  });

  const [labMode, setLabMode] = useState<"guided" | "free">(() => {
    if (typeof window === "undefined") return "guided";
    try {
      const saved = localStorage.getItem("biolearn_biochem_lab_mode");
      if (saved === "guided" || saved === "free") return saved;
    } catch {
      // fallback
    }
    return "guided";
  });

  // Shared state: samples catalog (includes predefined + any dynamically generated digested aliquots)
  const [samples, setSamples] = useState<Record<string, FoodSample>>({
    ...PREDEFINED_SAMPLES,
  });

  // Selected sample passed between labs
  const [sampleForEnzyme, setSampleForEnzyme] = useState<FoodSample>(
    PREDEFINED_SAMPLES.starch_sol
  );

  // Shared observation log
  const [observations, setObservations] = useState<ObservationLogEntry[]>([]);

  // Guided investigation progress
  const [guidedStep, setGuidedStep] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const saved = localStorage.getItem("biolearn_biochem_guided_step");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 1 && parsed <= 4) return parsed;
      }
    } catch {
      // fallback
    }
    return 1;
  });

  // Sync activeTab to URL and localStorage
  useEffect(() => {
    try {
      localStorage.setItem("biolearn_biochem_active_tab", activeTab);
      const url = new URL(window.location.href);
      if (url.searchParams.get("tab") !== activeTab) {
        url.searchParams.set("tab", activeTab);
        window.history.replaceState(null, "", url.toString());
      }
    } catch {
      // ignore
    }
  }, [activeTab]);

  // Handle browser Back / Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const queryTab = params.get("tab") as BiochemTab | null;
        if (queryTab && VALID_TABS.includes(queryTab)) {
          setActiveTab(queryTab);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync labMode & guidedStep
  useEffect(() => {
    try {
      localStorage.setItem("biolearn_biochem_lab_mode", labMode);
    } catch {
      // ignore
    }
  }, [labMode]);

  useEffect(() => {
    try {
      localStorage.setItem("biolearn_biochem_guided_step", guidedStep.toString());
    } catch {
      // ignore
    }
  }, [guidedStep]);

  // Load saved observations from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("biolearn_biochem_observations");
      if (saved) {
        setObservations(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAddObservation = (entry: ObservationLogEntry) => {
    setObservations((prev) => {
      const updated = [entry, ...prev];
      try {
        localStorage.setItem("biolearn_biochem_observations", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Advance guided step if in guided mode
    if (labMode === "guided") {
      if (guidedStep === 1 && entry.type === "food_test") {
        setGuidedStep(2);
      } else if (guidedStep === 2 && entry.type === "enzyme_reaction") {
        setGuidedStep(3);
      } else if (guidedStep === 3 && entry.type === "food_test" && entry.sampleName.includes("Digested")) {
        setGuidedStep(4);
      }
    }
  };

  const handleDeleteObservation = (id: string) => {
    setObservations((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      try {
        localStorage.setItem("biolearn_biochem_observations", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearObservations = () => {
    setObservations([]);
    try {
      localStorage.removeItem("biolearn_biochem_observations");
    } catch {
      // ignore
    }
  };

  // Cross-module bridge 1: from Food Lab to Enzyme Lab
  const handleTransferToEnzymeLab = (sample: FoodSample) => {
    setSampleForEnzyme(sample);
    setActiveTab("enzyme");
  };

  // Cross-module bridge 2: from Enzyme Lab to Food Lab
  const handleTransferDigestedToFoodTest = (digestedSample: FoodSample) => {
    setSamples((prev) => ({
      ...prev,
      [digestedSample.id]: digestedSample,
    }));
    setActiveTab("food_testing");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Back to BioLab Hub navigation */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link
          href="/biolab"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-ink transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 text-muted group-hover:-translate-x-1 transition-transform" />
          <span>{lang === "en" ? "Back to BioLab Modules" : "Kembali ke Menu BioLab"}</span>
        </Link>

        {/* Mode Selector Pill */}
        <div className="flex items-center gap-1 p-1 bg-border/50 rounded-2xl border border-border/60">
          <button
            onClick={() => setLabMode("guided")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              labMode === "guided"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t.modeGuided}</span>
          </button>
          <button
            onClick={() => setLabMode("free")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              labMode === "free"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.modeFree}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-surface rounded-3xl border border-border shadow-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "overview"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-ink hover:bg-bg-alt/50"
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.tabOverview}</span>
        </button>

        <button
          onClick={() => setActiveTab("food_testing")}
          className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "food_testing"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-ink hover:bg-bg-alt/50"
          }`}
        >
          <FlaskConical className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.tabFoodTest}</span>
        </button>

        <button
          onClick={() => setActiveTab("enzyme")}
          className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "enzyme"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-ink hover:bg-bg-alt/50"
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.tabEnzyme}</span>
        </button>

        <button
          onClick={() => setActiveTab("report")}
          className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "report"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-ink hover:bg-bg-alt/50"
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {t.tabReport} {observations.length > 0 && `(${observations.length})`}
          </span>
        </button>
      </div>

      {/* Guided Mode Stepper Bar */}
      {labMode === "guided" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-accent/10 via-purple-500/5 to-surface border border-accent/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              {lang === "en" ? "Guided Investigation: Starch Hydrolysis Mystery" : "Investigasi Terpandu: Misteri Hidrolisis Amilum"}
            </span>
            <span className="text-xs font-semibold text-muted">
              {lang === "en" ? `Step ${guidedStep} of 4` : `Langkah ${guidedStep} dari 4`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {/* Step 1 */}
            <div
              onClick={() => setActiveTab("food_testing")}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                guidedStep === 1
                  ? "border-2 border-accent bg-accent/10 text-ink font-bold shadow-2xs"
                  : guidedStep > 1
                  ? "border-green/40 bg-green-light/35 text-ink font-bold shadow-2xs"
                  : "border-border/70 bg-surface text-ink/70 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {guidedStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold shrink-0">1</span>
                )}
                <span className="text-ink">{lang === "en" ? "1. Baseline Test" : "1. Uji Awal Pati"}</span>
              </div>
              <p className="text-[11px] leading-tight text-ink/70 font-normal">
                {lang === "en" ? "Test starch solution with Lugol & Benedict" : "Uji larutan pati dengan Lugol & Benedict"}
              </p>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setActiveTab("enzyme")}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                guidedStep === 2
                  ? "border-2 border-accent bg-accent/10 text-ink font-bold shadow-2xs"
                  : guidedStep > 2
                  ? "border-green/40 bg-green-light/35 text-ink font-bold shadow-2xs"
                  : "border-border/70 bg-surface text-ink/70 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {guidedStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold shrink-0">2</span>
                )}
                <span className="text-ink">{lang === "en" ? "2. Digest with Amylase" : "2. Hidrolisis Amilase"}</span>
              </div>
              <p className="text-[11px] leading-tight text-ink/70 font-normal">
                {lang === "en" ? "Run reaction at 37°C pH 6.8 for 20 min" : "Reaksikan amilase suhu 37°C pH 6.8"}
              </p>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setActiveTab("food_testing")}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                guidedStep === 3
                  ? "border-2 border-accent bg-accent/10 text-ink font-bold shadow-2xs"
                  : guidedStep > 3
                  ? "border-green/40 bg-green-light/35 text-ink font-bold shadow-2xs"
                  : "border-border/70 bg-surface text-ink/70 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {guidedStep > 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold shrink-0">3</span>
                )}
                <span className="text-ink">{lang === "en" ? "3. Re-test Aliquot" : "3. Uji Ulang Alikuot"}</span>
              </div>
              <p className="text-[11px] leading-tight text-ink/70 font-normal">
                {lang === "en" ? "Verify Lugol loss & Benedict positive" : "Buktikan Lugol negatif & Benedict merah bata"}
              </p>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setActiveTab("report")}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                guidedStep === 4
                  ? "border-2 border-accent bg-accent/10 text-ink font-bold shadow-2xs"
                  : "border-border/70 bg-surface text-ink/70 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold shrink-0">4</span>
                <span className="text-ink">{lang === "en" ? "4. Conclude & Report" : "4. Simpulkan & Cetak"}</span>
              </div>
              <p className="text-[11px] leading-tight text-ink/70 font-normal">
                {lang === "en" ? "Synthesize lab report & discuss" : "Susun kesimpulan pada lembar laporan"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT RENDERING */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white shadow-xl">
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider">
                ⚗️ BioLearn Advanced Simulation
              </span>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                {t.labTitle} — {t.labSubtitle}
              </h1>
              <p className="text-xs sm:text-base text-white/80 leading-relaxed">
                {t.labDescription}
              </p>
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  onClick={() => setActiveTab("food_testing")}
                  className="px-6 py-3 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
                >
                  <span>{lang === "en" ? "Start Food Testing" : "Mulai Uji Makanan"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab("enzyme")}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all inline-flex items-center gap-2"
                >
                  <span>{lang === "en" ? "Explore Enzyme Kinetics" : "Jelajahi Lab Enzim"}</span>
                </button>
                <div className="text-xs text-white/70 flex items-center gap-1.5 ml-auto">
                  <Clock className="w-4 h-4" />
                  <span>{t.estimatedTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Objectives & Simulation Disclaimer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-surface rounded-3xl p-6 border border-border shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <span>🎯</span> {t.learningObjectivesTitle}
              </h3>
              <ul className="space-y-2.5">
                {t.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4 bg-surface rounded-3xl p-6 border border-border shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-ink font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber" />
                <span>{t.safetyNote}</span>
              </div>
              <p className="text-xs text-ink/80 leading-relaxed font-medium">
                {t.safetyNoteText}
              </p>
            </div>
          </div>

          {/* Formative Concept Mastery Checkpoints */}
          <BiochemCheckpoints />
        </div>
      )}

      {activeTab === "food_testing" && (
        <FoodTestingBench
          samples={samples}
          onLogObservation={handleAddObservation}
          onSendToEnzymeLab={handleTransferToEnzymeLab}
        />
      )}

      {activeTab === "enzyme" && (
        <EnzymeReactionBench
          samples={samples}
          initialSample={sampleForEnzyme}
          onLogObservation={handleAddObservation}
          onSendDigestedToFoodTest={handleTransferDigestedToFoodTest}
        />
      )}

      {activeTab === "report" && (
        <LabReportView
          observations={observations}
          onDeleteObservation={handleDeleteObservation}
          onClearObservations={handleClearObservations}
        />
      )}
    </div>
  );
}
