"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  RotateCcw,
  Eye,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useLangStore } from "@/lib/lang-store";
import { useProgressStore } from "@/lib/progress-store";
import { useIsMounted } from "@/lib/use-is-mounted";
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

export function ReflectionQuiz({
  babId,
  allSubKeys,
}: {
  babId: string;
  allSubKeys: string[];
}) {
  const { lang, t } = useLangStore();
  const progress = useProgressStore();
  const mounted = useIsMounted();

  const [questions, setQuestions] = useState<QuizV2Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [verifiedAnswers, setVerifiedAnswers] = useState<Record<number, QuestionCheckResult>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverScore, setServerScore] = useState<number | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<QuizV2Question[]>([]);

  const isUnlocked = mounted ? progress.isReflectionUnlocked(babId, allSubKeys) : false;
  const prog = mounted ? progress.getProgress(babId) : null;
  const reflectionDone = prog?.reflection_done ?? false;
  const storedScore = prog?.reflection_score ?? 0;
  const persistedAnswers: Record<string, number> = prog?.reflection_answers ?? {};

  const restartQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setChecked(false);
    setShowResult(false);
    setCorrectCount(0);
    setReviewMode(false);
    setAnswers({});
    setVerifiedAnswers({});
    setServerScore(null);
  };

  // Fetch sanitized reflection quiz questions when unlocked
  useEffect(() => {
    if (!isUnlocked || fetched) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/quiz?bab_id=${babId}&sub_bab_key=is_reflection`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setQuestions(data.quiz || []);
          setLoading(false);
          setFetched(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestions([]);
          setLoading(false);
          setFetched(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [babId, isUnlocked, fetched]);

  // Load review questions when review mode is opened
  const loadReviewData = async () => {
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_review", bab_id: babId }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.review_questions)) {
        setReviewQuestions(data.review_questions);
      }
    } catch (e) {
      console.error("[ReflectionQuiz loadReviewData error]", e);
    }
    setReviewMode(true);
  };

  if (!mounted || !isUnlocked) return null;

  if (loading || !fetched) {
    return (
      <div className="bg-surface rounded-2xl shadow-card border border-border/50 p-6 mb-6 animate-pulse">
        <div className="h-4 w-40 bg-border-light rounded mb-4" />
        <div className="h-3 w-48 bg-border-light rounded" />
      </div>
    );
  }

  if (questions.length === 0) return null;

  const hasSessionAnswers = Object.keys(answers).length > 0;
  const hasPersistedAnswers = Object.keys(persistedAnswers).length > 0;
  const sessionPassed = Math.round((correctCount / questions.length) * 100) >= 80;
  const reviewAnswers: Record<string, number> =
    hasSessionAnswers && (sessionPassed || !hasPersistedAnswers) ? answers : persistedAnswers;

  /* ───────── Mode Review (read-only) ───────── */
  if (reviewMode) {
    const listToRender = reviewQuestions.length > 0 ? reviewQuestions : questions;
    return (
      <div
        id="reflection-quiz"
        className="bg-gradient-to-br from-accent/[0.03] to-surface rounded-2xl shadow-card border border-accent/20 overflow-hidden mb-6"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="text-lg">🔍</span>
              {lang === "en" ? "Reflection Quiz Review" : "Review Quiz Refleksi"}
            </h3>
            <span className="text-xs text-muted">{lang === "en" ? "Best score: " : "Skor terbaik: "}{storedScore}%</span>
          </div>

          <div className="space-y-4">
            {listToRender.map((q, qi) => {
              const question = lang === "en" ? q.question_en || q.question_id : q.question_id;
              const qType = getQuestionType(q);
              const options = getDisplayOptions(q, lang);
              const explanation = lang === "en" ? q.explanation_en || q.explanation_id : q.explanation_id;
              const userAnswer = reviewAnswers[String(qi)] ?? reviewAnswers[String(q.id)];

              return (
                <div key={q.id} className="bg-surface rounded-xl border border-border/50 p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-muted">
                      {lang === "en" ? "Question " : "Soal "}{qi + 1}/{listToRender.length}
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {getQuestionTypeLabel(qType, lang)}
                    </span>
                  </div>

                  <p className="text-sm font-medium mb-3">{question}</p>

                  {q.question_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={q.question_image_url}
                      alt={t("image")}
                      className="mb-3 rounded-xl max-h-48 object-contain block mx-auto"
                      loading="lazy"
                    />
                  )}

                  <div className="space-y-2">
                    {options.map((opt: string, i: number) => {
                      const isCorrectOpt = q.correct_answer !== undefined && i === q.correct_answer;
                      const isUserWrong =
                        userAnswer !== undefined && i === userAnswer && !isCorrectOpt;

                      return (
                        <div
                          key={i}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 flex items-start gap-2 ${
                            isCorrectOpt
                              ? "border-green bg-green-light text-green"
                              : isUserWrong
                              ? "border-red bg-red-light text-red"
                              : "border-border text-muted"
                          }`}
                        >
                          {isCorrectOpt ? (
                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          ) : isUserWrong ? (
                            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          ) : (
                            <span className="w-4 flex-shrink-0" />
                          )}
                          <span>
                            {opt}
                            {isUserWrong && (
                              <span className="ml-2 text-[11px] font-semibold">{lang === "en" ? "Your answer" : "Jawabanmu"}</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {explanation && (
                    <div className="flex items-start gap-2 mt-3">
                      <Lightbulb className="w-4 h-4 text-yellow flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted">{explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setReviewMode(false)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === "en" ? "Back" : "Kembali"}
          </button>
        </div>
      </div>
    );
  }

  // If reflection already completed, show congrats
  if (reflectionDone && !showResult) {
    return (
      <div id="reflection-quiz" className="bg-gradient-to-br from-green-light to-surface rounded-2xl shadow-card border border-green/20 p-6 mb-6 text-center">
        <Trophy className="w-10 h-10 text-green mx-auto mb-3" />
        <h3 className="text-lg font-extrabold text-green mb-1">{lang === "en" ? "Congratulations! Chapter completed! 🎉" : "Selamat! Bab ini selesai! 🎉"}</h3>
        <p className="text-sm text-muted">{lang === "en" ? "You have completed all sub-chapters and the reflection quiz." : "Kamu telah menyelesaikan semua sub-bab dan quiz refleksi."}</p>
        {prog?.reflection_score !== undefined && (
          <p className="text-xs text-muted mt-2">{lang === "en" ? "Reflection score: " : "Skor refleksi: "}{prog.reflection_score}%</p>
        )}
        {storedScore >= 80 ? (
          <button
            onClick={loadReviewData}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            <Eye className="w-4 h-4" />
            {lang === "en" ? "Review Questions" : "Review Soal"}
          </button>
        ) : (
          <button
            onClick={restartQuiz}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {lang === "en" ? "Retake Reflection Quiz" : "Ulangi Quiz Refleksi"}
          </button>
        )}
      </div>
    );
  }

  const q = questions[currentQ];
  const question = lang === "en" ? q.question_en || q.question_id : q.question_id;
  const qType = getQuestionType(q);
  const options = getDisplayOptions(q, lang);

  const checkResult = verifiedAnswers[q.id];
  const isCorrect = checkResult?.is_correct ?? false;
  const correctAnswer = checkResult?.correct_answer;
  const explanation = checkResult
    ? (lang === "en" ? checkResult.explanation_en || checkResult.explanation_id : checkResult.explanation_id || checkResult.explanation_en)
    : "";

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
      console.error("[ReflectionQuiz check error]", e);
    } finally {
      setChecking(false);
      setChecked(true);
      setAnswers((prev) => ({ ...prev, [currentQ]: selected, [String(q.id)]: selected }));
    }
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setChecked(false);
    } else {
      setSubmitting(true);
      const finalAnswers: Record<string, number> = { ...answers };
      if (selected !== null) {
        finalAnswers[String(currentQ)] = selected;
        finalAnswers[String(q.id)] = selected;
      }

      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submit_quiz",
            bab_id: babId,
            sub_bab_key: "is_reflection",
            answers: finalAnswers,
            all_sub_keys: allSubKeys,
          }),
        });
        const data = await res.json();
        if (res.ok && typeof data.score === "number") {
          setServerScore(data.score);
          setCorrectCount(data.correct);
          progress.recordReflection(babId, data.score, questions.length, finalAnswers, allSubKeys);
        } else {
          const fallbackScore = Math.round((correctCount / questions.length) * 100);
          setServerScore(fallbackScore);
          progress.recordReflection(babId, fallbackScore, questions.length, finalAnswers, allSubKeys);
        }
      } catch {
        const fallbackScore = Math.round((correctCount / questions.length) * 100);
        setServerScore(fallbackScore);
        progress.recordReflection(babId, fallbackScore, questions.length, finalAnswers, allSubKeys);
      } finally {
        setSubmitting(false);
        setShowResult(true);
      }
    }
  };

  if (showResult) {
    const score = serverScore ?? Math.round((correctCount / questions.length) * 100);
    const passed = score >= 80;

    return (
      <div id="reflection-quiz" className="bg-gradient-to-br from-accent/[0.05] to-surface rounded-2xl shadow-card border border-accent/20 p-6 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className={`w-6 h-6 ${passed ? "text-green" : "text-accent"}`} />
          <h3 className="text-lg font-bold">{lang === "en" ? "Reflection Quiz Results" : "Hasil Quiz Refleksi"}</h3>
        </div>
        <p className={`text-4xl font-extrabold mb-2 ${passed ? "text-green" : "text-accent"}`}>
          {score}%
        </p>
        <p className="text-sm text-muted mb-1">
          {correctCount}/{questions.length} jawaban benar
        </p>
        {passed ? (
          <div className="mt-3">
            <p className="text-green font-bold text-lg mb-1">{lang === "en" ? "🎉 Congratulations! Chapter completed!" : "🎉 Selamat! Bab ini selesai!"}</p>
            <p className="text-sm text-muted">{lang === "en" ? "You have completed all materials and quizzes." : "Kamu telah menyelesaikan semua materi dan quiz."}</p>
            <button
              onClick={loadReviewData}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              <Eye className="w-4 h-4" />
              {lang === "en" ? "Review Questions" : "Review Soal"}
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-red font-semibold text-sm mb-3">
              {lang === "en" ? "❌ Minimum score 80%. Try again!" : "❌ Skor minimal 80%. Coba lagi ya!"}
            </p>
            <button
              onClick={restartQuiz}
              className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              {t("quiz.again")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="reflection-quiz" className="bg-gradient-to-br from-accent/[0.03] to-surface rounded-2xl shadow-card border border-accent/20 overflow-hidden mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span className="text-lg">🪞</span>
            {lang === "en" ? "Reflection Quiz" : "Quiz Refleksi"}
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
