"use client";

import { useState, useEffect } from "react";
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  Lightbulb,
  Trophy,
  BookOpen,
  RotateCcw,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore } from "@/lib/progress-store";
import {
  QuizV2Question,
  getQuestionType,
  getQuestionTypeLabel,
  getDisplayOptions,
} from "./types";

interface QuestionCheckResult {
  is_correct: boolean;
  correct_answer: number;
  explanation_id: string;
  explanation_en: string;
}

export function SubBabQuiz({
  babId,
  subKey,
  allSubKeys,
  onContinue,
  nextSubTitle,
  isGuestOnHook,
  onRequireAuth,
}: {
  babId: string;
  subKey: string;
  allSubKeys: string[];
  onContinue?: () => void;
  nextSubTitle?: string | null;
  isGuestOnHook?: boolean;
  onRequireAuth?: (title?: string) => void;
}) {
  const { lang, t } = useLangStore();
  const progress = useProgressStore();
  const [questions, setQuestions] = useState<QuizV2Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [verifiedAnswers, setVerifiedAnswers] = useState<Record<number, QuestionCheckResult>>({});
  const [sessionAnswers, setSessionAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverScore, setServerScore] = useState<number | null>(null);

  // Fetch sanitized quiz-v2 for this sub-bab (correct_answer is NOT included in response)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setShowResult(false);
    setCurrentQ(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);
    setVerifiedAnswers({});
    setSessionAnswers({});
    setServerScore(null);

    fetch(`/api/quiz?bab_id=${encodeURIComponent(babId)}&sub_bab_key=${encodeURIComponent(subKey)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setQuestions(data.quiz || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestions([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [babId, subKey]);

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-6 mb-6 animate-pulse">
        <div className="h-4 w-32 bg-border-light rounded mb-4" />
        <div className="h-3 w-48 bg-border-light rounded" />
      </div>
    );
  }

  if (questions.length === 0) return null;

  const q = questions[currentQ];
  const question = lang === "en" ? q.question_en || q.question_id : q.question_id;
  const qType = getQuestionType(q);
  const options = getDisplayOptions(q, lang);

  // Check result verified by server for the current question
  const checkResult = verifiedAnswers[q.id];
  const isCorrect = checkResult?.is_correct ?? false;
  const correctAnswer = checkResult?.correct_answer;
  const explanation = checkResult
    ? (lang === "en" ? checkResult.explanation_en || checkResult.explanation_id : checkResult.explanation_id || checkResult.explanation_en)
    : "";

  // Verify answer securely via POST /api/quiz (reveals explanation only after user submits choice)
  const handleCheck = async () => {
    if (selected === null || checking) return;
    setChecking(true);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_one",
          question_id: q.id,
          selected,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerifiedAnswers((prev) => ({
          ...prev,
          [q.id]: {
            is_correct: data.is_correct,
            correct_answer: data.correct_answer,
            explanation_id: data.explanation_id,
            explanation_en: data.explanation_en,
          },
        }));
        if (data.is_correct) {
          setCorrectCount((c) => c + 1);
        }
      }
    } catch (e) {
      console.error("[SubBabQuiz check error]", e);
    } finally {
      setChecking(false);
      setChecked(true);
      setSessionAnswers((prev) => ({ ...prev, [q.id]: selected }));
    }
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setChecked(false);
    } else {
      // Final submission: verified on server
      setSubmitting(true);
      const allAnswers = { ...sessionAnswers };
      if (selected !== null) allAnswers[q.id] = selected;

      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submit_quiz",
            bab_id: babId,
            sub_bab_key: subKey,
            answers: allAnswers,
            all_sub_keys: allSubKeys,
          }),
        });
        const data = await res.json();
        if (res.ok && typeof data.score === "number") {
          setServerScore(data.score);
          setCorrectCount(data.correct);
          // Sync to progress store
          progress.recordSubQuiz(babId, subKey, data.score, questions.length, allSubKeys);
        } else {
          // Fallback if network issue
          const fallbackScore = Math.round((correctCount / questions.length) * 100);
          setServerScore(fallbackScore);
          progress.recordSubQuiz(babId, subKey, fallbackScore, questions.length, allSubKeys);
        }
      } catch {
        const fallbackScore = Math.round((correctCount / questions.length) * 100);
        setServerScore(fallbackScore);
        progress.recordSubQuiz(babId, subKey, fallbackScore, questions.length, allSubKeys);
      } finally {
        setSubmitting(false);
        setShowResult(true);
      }
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setChecked(false);
    setShowResult(false);
    setCorrectCount(0);
    setVerifiedAnswers({});
    setSessionAnswers({});
    setServerScore(null);
  };

  if (showResult) {
    const finalScore = serverScore ?? Math.round((correctCount / questions.length) * 100);
    const passed = finalScore >= 80;

    return (
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-6 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {passed ? (
            <Trophy className="w-6 h-6 text-green" />
          ) : (
            <BookOpen className="w-6 h-6 text-accent" />
          )}
          <h3 className="text-lg font-bold">Hasil Quiz Sub-Bab</h3>
        </div>
        <p className={`text-4xl font-extrabold mb-2 ${passed ? "text-green" : "text-accent"}`}>
          {finalScore}%
        </p>
        <p className="text-sm text-muted mb-1">
          {correctCount}/{questions.length} {lang === "en" ? "correct answers" : "jawaban benar"}
        </p>
        {passed ? (
          <p className="text-sm text-green font-semibold mb-4">
            ✅ {t("quiz.complete")}
          </p>
        ) : (
          <p className="text-sm text-red font-semibold mb-4">
            ❌ {t("quiz.wrong")} {t("bab.locked_hint")}
          </p>
        )}
        {passed && isGuestOnHook ? (
          <div className="space-y-3">
            <div className="p-3.5 bg-accent/10 border border-accent/25 rounded-2xl text-xs text-ink text-left flex items-start gap-2.5">
              <span className="text-accent text-base leading-none mt-0.5">✨</span>
              <span className="leading-relaxed">
                <strong>Hebat, kamu lulus kuis pengantar!</strong> Buat akun gratis sekarang untuk menyimpan skor ini ke rapor belajarmu dan membuka materi Struktur Sel Bakteri.
              </span>
            </div>
            <button
              onClick={() => onRequireAuth?.(nextSubTitle || (lang === "en" ? "Next Sub-chapter" : "Sub Bab Berikutnya"))}
              className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-all shadow-md active:scale-95"
            >
              <span>{nextSubTitle ? `${lang === "en" ? "Continue" : "Lanjut"}: ${nextSubTitle}` : (lang === "en" ? "Continue to next sub-chapter" : "Lanjut ke Sub Bab Berikutnya")}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : passed && onContinue ? (
          <button
            onClick={onContinue}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            {nextSubTitle
              ? `${lang === "en" ? "Continue" : "Lanjut"}: ${nextSubTitle}`
              : lang === "en"
              ? "Continue to next sub-chapter"
              : "Lanjut ke Sub Bab Berikutnya"}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          !passed && (
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              {t("quiz.again")}
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-border/50 overflow-hidden mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-accent" />
            {t("quiz.title")}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {getQuestionTypeLabel(qType, lang)}
            </span>
          </h3>
          <span className="text-xs text-muted">
            {currentQ + 1}/{questions.length}
          </span>
        </div>

        {/* Question */}
        <p className="text-sm font-medium mb-4">{question}</p>
        {q.question_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={q.question_image_url}
            alt={t("image")}
            className="mb-4 rounded-xl max-h-48 object-contain block mx-auto"
            loading="lazy"
          />
        )}

        {/* Options */}
        <div className="space-y-2 mb-4">
          {options.map((opt: string, i: number) => {
            const isSelected = selected === i;
            const isCorrectOption = checked && correctAnswer !== undefined && i === correctAnswer;
            const isWrongOption = checked && isSelected && !isCorrect;

            return (
              <button
                key={i}
                onClick={() => !checked && setSelected(i)}
                disabled={checked}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all ${
                  checked
                    ? isCorrectOption
                      ? "border-green bg-green-light text-green"
                      : isWrongOption
                      ? "border-red bg-red-light text-red"
                      : "border-border text-muted"
                    : isSelected
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border hover:border-accent-light text-ink"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation after check */}
        {checked && (
          <div className={`p-4 rounded-xl mb-4 ${isCorrect ? "bg-green-light" : "bg-red-light"}`}>
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <CheckCircle className="w-4 h-4 text-green" />
              ) : (
                <XCircle className="w-4 h-4 text-red" />
              )}
              <span className={`text-sm font-semibold ${isCorrect ? "text-green" : "text-red"}`}>
                {isCorrect ? t("quiz.correct") : t("quiz.wrong_text")}
              </span>
            </div>
            {explanation && (
              <div className="flex items-start gap-2 mt-2">
                <Lightbulb className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted">{explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected === null || checking}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {checking && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("quiz.check_answer")}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={submitting}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {currentQ < questions.length - 1 ? t("quiz.next") : t("quiz.view_result")}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
