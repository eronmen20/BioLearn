import { NextRequest, NextResponse } from "next/server";
import { getDb, getPublicDb, findUserByEmail, saveProgress, getProgress } from "@/lib/db";
import { extractUserToken } from "@/lib/user-token";
import { verifyUserToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Column list for public question retrieval:
// SECURITY: correct_answer, explanation_id, and explanation_en are EXCLUDED
// from public GET so students cannot inspect client network traffic to cheat.
const SAFE_QUESTION_COLUMNS =
  "id, bab_id, sub_bab_key, is_reflection, question_id, question_en, question_image_url, question_type, options_id, options_en, sort_order";

// GET - Public endpoint for fetching sanitized quiz questions per sub-bab
// Query params:
//   bab_id       — filter by bab (required)
//   sub_bab_key  — "is_reflection" for reflection quiz of a bab, or specific sub-bab key
// Returns: { quiz: SanitizedQuizV2Question[] }
export async function GET(req: NextRequest) {
  try {
    const supabase = getPublicDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");
    const subBabKey = searchParams.get("sub_bab_key");

    if (!babId) {
      return NextResponse.json({ error: "bab_id wajib diisi" }, { status: 400 });
    }

    let query = supabase
      .from("sub_bab_quiz")
      .select(SAFE_QUESTION_COLUMNS)
      .eq("bab_id", babId)
      .order("sort_order", { ascending: true });

    if (subBabKey === "is_reflection") {
      query = query.eq("is_reflection", true);
    } else if (subBabKey) {
      query = query.eq("sub_bab_key", subBabKey);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ quiz: data || [] });
  } catch (e) {
    console.error("[API Quiz Public GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Secure server-side verification and grading
// Actions:
//   1. "verify_one": Verifies a single question answer and returns explanation ONLY after submission.
//   2. "submit_quiz": Verifies an entire quiz submission server-side, calculates authentic score,
//                    and automatically updates user's progress if authenticated.
//   3. "get_review": Retrieves full review data (with correct answers and explanations) for review mode.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body ?? {};
    const db = getDb();

    // ─────────────────────────────────────────────────────────────
    // 1. Verify single question answer
    // ─────────────────────────────────────────────────────────────
    if (action === "verify_one") {
      const { question_id, selected } = body;
      if (typeof question_id !== "number" || typeof selected !== "number") {
        return NextResponse.json({ error: "question_id dan selected (number) wajib diisi" }, { status: 400 });
      }

      const { data: q, error } = await db
        .from("sub_bab_quiz")
        .select("id, correct_answer, explanation_id, explanation_en")
        .eq("id", question_id)
        .single();

      if (error || !q) {
        return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
      }

      const is_correct = q.correct_answer === selected;
      return NextResponse.json({
        question_id: q.id,
        is_correct,
        correct_answer: q.correct_answer,
        explanation_id: q.explanation_id || "",
        explanation_en: q.explanation_en || "",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Submit entire quiz (sub-bab or reflection)
    // ─────────────────────────────────────────────────────────────
    if (action === "submit_quiz") {
      const { bab_id, sub_bab_key, answers, all_sub_keys } = body;
      if (!bab_id || typeof answers !== "object" || answers === null) {
        return NextResponse.json({ error: "Data submission tidak lengkap" }, { status: 400 });
      }

      const isReflection = sub_bab_key === "is_reflection";
      let query = db
        .from("sub_bab_quiz")
        .select("id, correct_answer, explanation_id, explanation_en")
        .eq("bab_id", bab_id)
        .order("sort_order", { ascending: true });

      if (isReflection) {
        query = query.eq("is_reflection", true);
      } else if (sub_bab_key) {
        query = query.eq("sub_bab_key", sub_bab_key);
      }

      const { data: questions, error } = await query;
      if (error || !questions || questions.length === 0) {
        return NextResponse.json({ error: "Tidak ada soal untuk sub-bab ini" }, { status: 404 });
      }

      const total = questions.length;
      let correctCount = 0;
      const results = questions.map((q) => {
        const userAnswer = answers[String(q.id)] ?? answers[Number(q.id)];
        const is_correct = userAnswer !== undefined && userAnswer === q.correct_answer;
        if (is_correct) correctCount++;
        return {
          question_id: q.id,
          user_answer: userAnswer ?? null,
          is_correct,
          correct_answer: q.correct_answer,
          explanation_id: q.explanation_id || "",
          explanation_en: q.explanation_en || "",
        };
      });

      const score = Math.round((correctCount / total) * 100);
      const passed = score >= 80;

      // Check if caller is authenticated user
      let userUpdated = false;
      const token = extractUserToken(req);
      const payload = token ? verifyUserToken(token) : null;
      if (payload && payload.email) {
        try {
          const user = await findUserByEmail(payload.email);
          if (user) {
            const currentProgress = (await getProgress(user.id)) || {};
            const p = currentProgress[bab_id] || {
              quizzes: 0,
              correct: 0,
              total: 0,
              subs: {},
              reflection_done: false,
              reflection_score: 0,
              reflection_questions: 0,
              reflection_answers: {},
              completion_pct: 0,
            };

            const allKeys: string[] = Array.isArray(all_sub_keys) && all_sub_keys.length > 0 ? all_sub_keys : Object.keys(p.subs || {});

            if (isReflection) {
              const newReflectionScore = Math.max(score, p.reflection_score || 0);
              const newReflectionDone = passed || p.reflection_done;
              const reflectionAnswersToSave = passed ? answers : (p.reflection_answers ?? {});

              const totalSubs = allKeys.length > 0 ? allKeys.length : Object.keys(p.subs || {}).length;
              const doneSubs = allKeys.length > 0
                ? allKeys.filter((k) => p.subs?.[k]?.done).length
                : Object.values(p.subs || {}).filter((s: any) => s?.done).length;
              const doneItems = doneSubs + (newReflectionDone ? 1 : 0);
              const completionPct = totalSubs + 1 > 0 ? Math.round((doneItems / (totalSubs + 1)) * 100) : 0;

              await saveProgress(user.id, bab_id, {
                quizzes: Object.keys(p.subs || {}).length + 1,
                correct: (p.correct || 0) + (passed ? correctCount : 0),
                total: (p.total || 0) + total,
                subs: p.subs || {},
                reflection_done: newReflectionDone,
                reflection_score: newReflectionScore,
                reflection_questions: total,
                reflection_answers: reflectionAnswersToSave,
                completion_pct: completionPct,
              });
              userUpdated = true;
            } else if (sub_bab_key) {
              const currentSub = p.subs?.[sub_bab_key] || { done: false, score: 0, attempts: 0, questions: total };
              const newSubs = {
                ...(p.subs || {}),
                [sub_bab_key]: {
                  done: passed || currentSub.done,
                  score: Math.max(score, currentSub.score || 0),
                  attempts: (currentSub.attempts || 0) + 1,
                  questions: total,
                },
              };

              const totalSubs = allKeys.length > 0 ? allKeys.length : Object.keys(newSubs).length;
              const doneSubs = allKeys.length > 0
                ? allKeys.filter((k) => newSubs[k]?.done).length
                : Object.values(newSubs).filter((s: any) => s?.done).length;
              const doneItems = doneSubs + (p.reflection_done ? 1 : 0);
              const completionPct = totalSubs + 1 > 0 ? Math.round((doneItems / (totalSubs + 1)) * 100) : 0;

              await saveProgress(user.id, bab_id, {
                quizzes: Object.keys(newSubs).length + (p.reflection_done ? 1 : 0),
                correct: (p.correct || 0) + (passed ? correctCount : 0),
                total: (p.total || 0) + total,
                subs: newSubs,
                reflection_done: p.reflection_done || false,
                reflection_score: p.reflection_score || 0,
                reflection_questions: p.reflection_questions || 0,
                reflection_answers: p.reflection_answers || {},
                completion_pct: completionPct,
              });
              userUpdated = true;
            }
          }
        } catch (saveErr) {
          console.error("[API Quiz submit_quiz saveProgress error]", saveErr);
        }
      }

      return NextResponse.json({
        success: true,
        score,
        correct: correctCount,
        total,
        passed,
        user_updated: userUpdated,
        results,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Get Review Data (for passed reflection quiz)
    // ─────────────────────────────────────────────────────────────
    if (action === "get_review") {
      const { bab_id } = body;
      if (!bab_id) {
        return NextResponse.json({ error: "bab_id wajib diisi" }, { status: 400 });
      }

      const { data: questions, error } = await db
        .from("sub_bab_quiz")
        .select("id, question_id, question_en, question_image_url, question_type, options_id, options_en, correct_answer, explanation_id, explanation_en, sort_order")
        .eq("bab_id", bab_id)
        .eq("is_reflection", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return NextResponse.json({ review_questions: questions || [] });
    }

    return NextResponse.json({ error: "Action tidak dikenal" }, { status: 400 });
  } catch (e) {
    console.error("[API Quiz POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
