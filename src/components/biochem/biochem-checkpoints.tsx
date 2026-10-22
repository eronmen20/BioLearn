"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";

interface CheckpointQuestion {
  id: string;
  questionId: string;
  questionEn: string;
  optionsId: string[];
  optionsEn: string[];
  correctAnswer: number;
  explanationId: string;
  explanationEn: string;
}

const CHECKPOINTS: CheckpointQuestion[] = [
  {
    id: "q-lugol-limit",
    questionId:
      "Mengapa hasil uji Lugol yang negatif TIDAK cukup untuk menyimpulkan bahwa suatu makanan bebas dari karbohidrat?",
    questionEn:
      "Why is a negative Lugol test INSUFFICIENT to conclude that a food sample contains no carbohydrates?",
    optionsId: [
      "Karena reagen Lugol hanya bereaksi dengan karbohidrat hewani saja.",
      "Karena Lugol spesifik mendeteksi amilosa (pati), bukan monosakarida (glukosa) atau disakarida (sukrosa/maltosa).",
      "Karena reagen Lugol harus selalu dicampur dengan enzim terlebih dahulu.",
      "Karena karbohidrat hanya dapat diuji menggunakan mikroskop digital.",
    ],
    optionsEn: [
      "Because Lugol reagent only reacts with animal carbohydrates.",
      "Because Lugol specifically binds amylose helical coils in starch, not free monosaccharides or disaccharides.",
      "Because Lugol reagent must always be pre-mixed with enzymes first.",
      "Because carbohydrates can only be observed under an optical microscope.",
    ],
    correctAnswer: 1,
    explanationId:
      "Tepat! Karbohidrat terdiri dari banyak jenis: monosakarida, disakarida, dan polisakarida. Lugol hanya spesifik membentuk kompleks inklusi dengan heliks amilosa pada pati/amilum.",
    explanationEn:
      "Exact! Carbohydrates span monosaccharides, disaccharides, and polysaccharides. Lugol specifically forms an optical complex with helical amylose in starch, leaving simple sugars undetected.",
  },
  {
    id: "q-benedict-heat",
    questionId:
      "Mengapa uji Benedict WAJIB dipanaskan dalam penangas air (water bath), berbeda dengan uji Lugol atau Biuret?",
    questionEn:
      "Why MUST Benedict's test be heated in a water bath, unlike Lugol's or Biuret assays?",
    optionsId: [
      "Pemanasan diperlukan untuk membunuh bakteri yang ada di dalam tabung reaksi.",
      "Reaksi reduksi ion Cu²⁺ oleh gugus pereduksi memiliki energi aktivasi tinggi yang membutuhkan panas agar berlangsung cepat.",
      "Panas membuat larutan menjadi encer sehingga warna reagen lebih mudah terlihat.",
      "Untuk menguapkan pelarut air agar terbentuk kristal padat di dasar tabung.",
    ],
    optionsEn: [
      "Heating is needed to sterilize bacteria inside the virtual test tube.",
      "Reduction of Cu²⁺ to Cu₂O has a high activation energy requiring heat to proceed within observable laboratory time.",
      "Heat dilutes the solution so the color becomes brighter.",
      "To evaporate water solvent so solid crystals form at the bottom.",
    ],
    correctAnswer: 1,
    explanationId:
      "Tepat! Berbeda dengan kompleks koordinasi instan pada Lugol dan Biuret, reaksi redoks antara gugus aldehida/keton bebas dengan tembaga(II) membutuhkan energi termal untuk mengatasi energi aktivasi reaksi.",
    explanationEn:
      "Correct! Unlike coordination complexes in Lugol and Biuret, the redox reduction of copper(II) requires thermal energy to overcome the reaction's activation energy barrier.",
  },
  {
    id: "q-denaturation",
    questionId:
      "Pada suhu 75°C, laju hidrolisis enzim amilase turun drastis hingga mendekati nol. Apa penyebab biologis utamanya?",
    questionEn:
      "At 75°C, the rate of amylase hydrolysis plummets to near zero. What is the primary biochemical cause?",
    optionsId: [
      "Suhu tinggi membekukan molekul pati sehingga tidak bisa masuk ke dalam tabung.",
      "Substrat pati menguap seluruhnya menjadi gas pada suhu di atas 60°C.",
      "Suhu tinggi merusak ikatan hidrogen dan struktur tersier protein enzim, menyebabkan denaturasi permanen pada sisi aktif.",
      "Enzim amilase berubah wujud menjadi enzim protease pada suhu tinggi.",
    ],
    optionsEn: [
      "High temperature freezes starch molecules so they cannot enter the active site.",
      "Starch substrate evaporates into vapor above 60°C.",
      "Excessive heat disrupts hydrogen and tertiary bonds, causing irreversible thermal denaturation of the active site.",
      "Amylase enzyme mutates into protease enzyme under heat.",
    ],
    correctAnswer: 2,
    explanationId:
      "Tepat! Enzim adalah protein globular dengan struktur 3 dimensi yang presisi. Panas berlebih mengacaukan ikatan hidrogen dan interaksi hidrofobik, menyebabkan sisi aktif kehilangan bentuk komplementernya.",
    explanationEn:
      "Exactly! Enzymes are 3D globular proteins. Excessive thermal energy disrupts non-covalent bonds, causing irreversible conformational collapse of the catalytic active site.",
  },
];

export function BiochemCheckpoints() {
  const { lang } = useLangStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);

  const q = CHECKPOINTS[currentIdx];
  const isCorrect = selectedOpt === q.correctAnswer;
  const isLast = currentIdx === CHECKPOINTS.length - 1;

  const handleCheck = () => {
    if (selectedOpt === null) return;
    setChecked(true);
    if (isCorrect) setScoreCount((s) => s + 1);
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentIdx((c) => c + 1);
      setSelectedOpt(null);
      setChecked(false);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setChecked(false);
    setScoreCount(0);
  };

  return (
    <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-border shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-accent/10 text-accent font-bold text-xs">
            🧠 Checkpoint
          </span>
          <h4 className="text-sm font-bold text-ink">
            {lang === "en" ? "Concept Mastery Check" : "Uji Penalaran Ilmiah"}
          </h4>
        </div>
        <span className="text-xs font-semibold text-muted">
          {currentIdx + 1} / {CHECKPOINTS.length}
        </span>
      </div>

      <p className="text-xs sm:text-sm font-bold text-ink mb-4 leading-relaxed">
        {lang === "en" ? q.questionEn : q.questionId}
      </p>

      {/* Options */}
      <div className="space-y-2.5 mb-4">
        {(lang === "en" ? q.optionsEn : q.optionsId).map((opt, i) => {
          const isSelected = selectedOpt === i;
          const isTargetCorrect = i === q.correctAnswer;
          const showState = checked;

          let containerStyle =
            "border border-border hover:border-accent/50 bg-surface hover:bg-bg-alt/50 text-ink shadow-2xs";
          let badgeStyle =
            "border border-border bg-bg-alt text-muted shrink-0 flex items-center justify-center text-xs font-bold";

          if (showState) {
            if (isTargetCorrect) {
              containerStyle =
                "border-2 border-green bg-green-light/40 dark:bg-green-light/20 shadow-xs";
              badgeStyle =
                "bg-green text-white border-green font-bold shrink-0 flex items-center justify-center text-xs shadow-xs";
            } else if (isSelected && !isTargetCorrect) {
              containerStyle =
                "border-2 border-red bg-red-light/40 dark:bg-red-light/20 shadow-xs";
              badgeStyle =
                "bg-red text-white border-red font-bold shrink-0 flex items-center justify-center text-xs shadow-xs";
            } else {
              containerStyle =
                "border border-border/80 bg-surface/70 text-ink/70 hover:bg-surface/70";
              badgeStyle =
                "border border-border bg-bg-alt/60 text-muted/80 shrink-0 flex items-center justify-center text-xs font-medium";
            }
          } else if (isSelected) {
            containerStyle =
              "border-2 border-accent bg-accent/10 text-ink shadow-xs";
            badgeStyle =
              "bg-accent text-white border-accent font-bold shrink-0 flex items-center justify-center text-xs shadow-xs";
          }

          return (
            <button
              key={i}
              onClick={() => !checked && setSelectedOpt(i)}
              disabled={checked}
              className={`w-full text-left p-3.5 rounded-2xl text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${containerStyle}`}
            >
              <span className={`w-6 h-6 rounded-full mt-0.5 ${badgeStyle}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span
                className={`leading-relaxed flex-1 text-ink ${
                  showState && isTargetCorrect
                    ? "font-bold text-ink"
                    : isSelected
                    ? "font-semibold text-ink"
                    : "font-normal text-ink"
                }`}
              >
                {opt}
              </span>
              {showState && isTargetCorrect && (
                <span className="shrink-0 text-green font-bold text-xs inline-flex items-center gap-1 bg-green-light/80 dark:bg-green-light/40 px-2 py-0.5 rounded-md self-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Correct" : "Benar"}</span>
                </span>
              )}
              {showState && isSelected && !isTargetCorrect && (
                <span className="shrink-0 text-red font-bold text-xs inline-flex items-center gap-1 bg-red-light/80 dark:bg-red-light/40 px-2 py-0.5 rounded-md self-center">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Incorrect" : "Salah"}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {checked && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed mb-4 border-2 transition-all ${
            isCorrect
              ? "bg-green-light/35 dark:bg-green-light/15 border-green/40 shadow-xs"
              : "bg-red-light/35 dark:bg-red-light/15 border-red/40 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red shrink-0" />
            )}
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                isCorrect ? "bg-green text-white" : "bg-red text-white"
              }`}
            >
              {isCorrect
                ? lang === "en"
                  ? "✓ Correct Reasoning"
                  : "✓ Penalaran Tepat"
                : lang === "en"
                ? "✗ Needs Review"
                : "✗ Belum Tepat"}
            </span>
          </div>
          <p className="text-ink font-medium leading-relaxed">
            {lang === "en" ? q.explanationEn : q.explanationId}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selectedOpt === null}
            className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-dark transition-colors disabled:opacity-40"
          >
            {lang === "en" ? "Check Answer" : "Periksa Jawaban"}
          </button>
        ) : !isLast ? (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-dark transition-colors inline-flex items-center gap-1.5"
          >
            <span>{lang === "en" ? "Next Question" : "Pertanyaan Selanjutnya"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-xl border border-border hover:bg-bg-alt text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "Review Again" : "Ulangi Latihan"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
