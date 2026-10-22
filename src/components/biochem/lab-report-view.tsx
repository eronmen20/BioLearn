"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Download,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Calendar,
  User,
  FlaskConical,
} from "lucide-react";
import {
  ObservationLogEntry,
  VirtualLabReport,
  DEFAULT_LAB_REPORT,
} from "@/lib/biochem-engine";
import { BIOCHEM_I18N } from "@/lib/biochem-i18n";
import { useLangStore } from "@/lib/lang-store";

interface LabReportViewProps {
  observations: ObservationLogEntry[];
  onDeleteObservation: (id: string) => void;
  onClearObservations: () => void;
}

export function LabReportView({
  observations,
  onDeleteObservation,
  onClearObservations,
}: LabReportViewProps) {
  const { lang } = useLangStore();
  const t = BIOCHEM_I18N[lang];

  const [activeSubTab, setActiveSubTab] = useState<"log" | "report">("log");
  const [report, setReport] = useState<VirtualLabReport>(DEFAULT_LAB_REPORT);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("biolearn_biochem_report_draft");
      if (saved) {
        setReport({ ...DEFAULT_LAB_REPORT, ...JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveDraft = () => {
    try {
      localStorage.setItem("biolearn_biochem_report_draft", JSON.stringify(report));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (observations.length === 0) return;
    const headers = [
      "ID",
      "Timestamp",
      "Type",
      "Sample",
      "Test / Enzyme",
      "Conditions",
      "Observation",
      "Interpretation",
      "Result Badge",
    ];
    const rows = observations.map((o) => [
      o.id,
      new Date(o.timestamp).toLocaleString(),
      o.type,
      `"${o.sampleName}"`,
      `"${o.testOrEnzyme}"`,
      `"${o.conditionsSummary}"`,
      `"${o.observationId}"`,
      `"${o.interpretationId}"`,
      o.resultBadge,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `biochem-lab-observations-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-accent/10 text-accent font-bold text-sm">
                📊 Module 3
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-ink">{t.reportTitle}</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted">{t.reportSubtitle}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCsv}
              disabled={observations.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border hover:bg-bg-alt text-xs font-semibold text-muted hover:text-ink transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportCsv}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-dark transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printReport}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Log vs Full Report */}
        <div className="flex items-center gap-2 mt-5 border-t border-border pt-4">
          <button
            onClick={() => setActiveSubTab("log")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "log"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-ink hover:bg-bg-alt"
            }`}
          >
            📋 {t.tabObservationLog} ({observations.length})
          </button>
          <button
            onClick={() => setActiveSubTab("report")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "report"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-ink hover:bg-bg-alt"
            }`}
          >
            📝 {t.tabFullReport}
          </button>
        </div>
      </div>

      {/* VIEW 1: OBSERVATION LOG TABLE */}
      {activeSubTab === "log" && (
        <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-xs print:border-none print:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              {t.tabObservationLog}
            </h3>
            {observations.length > 0 && (
              <button
                onClick={onClearObservations}
                className="text-xs text-red-500 hover:text-red-700 font-semibold inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.clearLog}</span>
              </button>
            )}
          </div>

          {observations.length === 0 ? (
            <div className="py-12 text-center text-muted text-xs">
              <FlaskConical className="w-8 h-8 text-muted/40 mx-auto mb-2" />
              <p>{t.noObservationsYet}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">Sampel</th>
                    <th className="py-2.5 px-3">Uji / Enzim</th>
                    <th className="py-2.5 px-3">Kondisi</th>
                    <th className="py-2.5 px-3">Hasil Visual</th>
                    <th className="py-2.5 px-3">Interpretasi</th>
                    <th className="py-2.5 px-3 text-right print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {observations.map((obs) => (
                    <tr key={obs.id} className="hover:bg-bg-alt/40 transition-colors">
                      <td className="py-3 px-3 text-muted-2 whitespace-nowrap text-[11px]">
                        {new Date(obs.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            obs.type === "food_test"
                              ? "bg-blue-600 text-white shadow-2xs"
                              : "bg-purple-600 text-white shadow-2xs"
                          }`}
                        >
                          {obs.type === "food_test"
                            ? lang === "en"
                              ? "Food Assay"
                              : "Uji Pangan"
                            : lang === "en"
                            ? "Enzyme Rxn"
                            : "Reaksi Enzim"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-ink whitespace-nowrap">
                        {obs.sampleName}
                      </td>
                      <td className="py-3 px-3 font-medium text-ink whitespace-nowrap">
                        {obs.testOrEnzyme}
                      </td>
                      <td className="py-3 px-3 text-muted text-[11px] whitespace-nowrap">
                        {obs.conditionsSummary}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          {obs.colorHex && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: obs.colorHex }}
                            />
                          )}
                          <span className="font-semibold text-ink text-[11px]">
                            {lang === "en" ? obs.observationEn : obs.observationId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted text-[11px] min-w-[180px]">
                        {lang === "en" ? obs.interpretationEn : obs.interpretationId}
                      </td>
                      <td className="py-3 px-3 text-right print:hidden">
                        <button
                          onClick={() => onDeleteObservation(obs.id)}
                          className="text-muted hover:text-red-500 p-1 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FULL VIRTUAL LAB REPORT */}
      {activeSubTab === "report" && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-border print:hidden">
            <span className="text-xs text-muted">
              {lang === "en"
                ? "Fill in your hypotheses, analysis, and conclusions before printing or saving."
                : "Lengkapi hipotesis, pembahasan, dan kesimpulanmu sebelum mencetak atau menyimpan."}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-dark transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveSuccess ? (lang === "en" ? "Saved!" : "Tersimpan!") : t.saveReport}</span>
              </button>
            </div>
          </div>

          {/* Report Paper Header */}
          <div className="text-center pb-4 border-b-2 border-border/80">
            <h1 className="text-xl sm:text-2xl font-black text-ink mb-1">
              BIOCHEM LAB — VIRTUAL SCIENTIFIC REPORT
            </h1>
            <p className="text-xs text-muted uppercase tracking-wider">
              {lang === "en"
                ? "Department of Biology & Biomolecular Sciences • BioLearn Platform"
                : "Laboratorium Biologi & Sains Biomolekuler • Platform BioLearn"}
            </p>
          </div>

          {/* Student Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-alt/40 p-4 rounded-2xl border border-border">
            <div>
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                {t.studentNameLabel}
              </label>
              <input
                type="text"
                value={report.studentName}
                onChange={(e) => setReport({ ...report, studentName: e.target.value })}
                placeholder={lang === "en" ? "Enter your full name" : "Nama lengkap praktikan"}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                {t.dateLabel}
              </label>
              <input
                type="date"
                value={report.date}
                onChange={(e) => setReport({ ...report, date: e.target.value })}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Section 1: Research Question & Hypothesis */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-black text-ink block mb-1">
                1. {t.researchQuestionLabel}
              </label>
              <textarea
                rows={2}
                value={report.researchQuestion}
                onChange={(e) => setReport({ ...report, researchQuestion: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink block mb-1">
                2. {t.hypothesisLabel}
              </label>
              <textarea
                rows={2}
                value={report.hypothesis}
                onChange={(e) => setReport({ ...report, hypothesis: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Variables */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                {t.independentVarLabel}
              </label>
              <input
                type="text"
                value={report.independentVariable}
                onChange={(e) => setReport({ ...report, independentVariable: e.target.value })}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                {t.dependentVarLabel}
              </label>
              <input
                type="text"
                value={report.dependentVariable}
                onChange={(e) => setReport({ ...report, dependentVariable: e.target.value })}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                {t.controlledVarLabel}
              </label>
              <input
                type="text"
                value={report.controlledVariables}
                onChange={(e) => setReport({ ...report, controlledVariables: e.target.value })}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Section 3: Materials & Procedure */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-black text-ink block mb-1">
                3. {t.materialsLabel}
              </label>
              <textarea
                rows={2}
                value={report.materialsAndReagents}
                onChange={(e) => setReport({ ...report, materialsAndReagents: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink block mb-1">
                4. {t.procedureLabel}
              </label>
              <textarea
                rows={3}
                value={report.procedureSummary}
                onChange={(e) => setReport({ ...report, procedureSummary: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: Auto-embedded Observation Table */}
          <div>
            <label className="text-xs font-black text-ink block mb-2">
              5. {lang === "en" ? "Empirical Observations Table" : "Tabel Data Hasil Pengamatan"}
            </label>
            {observations.length === 0 ? (
              <p className="text-xs text-muted italic bg-bg-alt/30 p-3 rounded-xl">
                {lang === "en"
                  ? "(No observations recorded in current session. Perform experiments in Module 1 and 2 to populate this table.)"
                  : "(Belum ada data pengamatan tercatat. Lakukan uji pada Modul 1 dan 2 untuk mengisi tabel ini secara otomatis.)"}
              </p>
            ) : (
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-alt text-muted text-[10px] uppercase font-bold border-b border-border">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Sampel</th>
                      <th className="py-2 px-3">Uji / Enzim</th>
                      <th className="py-2 px-3">Pengamatan</th>
                      <th className="py-2 px-3">Hasil / Simpulan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {observations.map((o, idx) => (
                      <tr key={o.id}>
                        <td className="py-2 px-3 font-mono text-muted">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold">{o.sampleName}</td>
                        <td className="py-2 px-3">{o.testOrEnzyme}</td>
                        <td className="py-2 px-3">{lang === "en" ? o.observationEn : o.observationId}</td>
                        <td className="py-2 px-3 font-bold">{o.resultBadge}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 5: Discussion & Conclusion */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-ink block mb-1">
                6. {t.discussionLabel}
              </label>
              <textarea
                rows={4}
                value={report.discussion}
                onChange={(e) => setReport({ ...report, discussion: e.target.value })}
                placeholder={
                  lang === "en"
                    ? "Discuss your findings: Why did the Lugol and Benedict results change after adding amylase? How did temperature and pH alter reaction velocity?"
                    : "Bahas temuanmu: Mengapa hasil Lugol dan Benedict berubah setelah penambahan amilase? Bagaimana pengaruh variasi suhu dan pH terhadap laju reaksi enzim?"
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink block mb-1">
                7. {t.conclusionLabel}
              </label>
              <textarea
                rows={3}
                value={report.conclusion}
                onChange={(e) => setReport({ ...report, conclusion: e.target.value })}
                placeholder={
                  lang === "en"
                    ? "Summarize whether the hypothesis was supported and the biochemical conclusions drawn."
                    : "Simpulkan apakah hipotesis terbukti dan apa kesimpulan biokimia utama yang diperoleh."
                }
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink block mb-1">
                8. {t.limitationsLabel}
              </label>
              <textarea
                rows={3}
                value={report.modelLimitations}
                onChange={(e) => setReport({ ...report, modelLimitations: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-surface text-ink outline-none focus:border-accent leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
