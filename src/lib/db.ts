import { createClient, SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

let supabase: SupabaseClient;
let supabasePublic: SupabaseClient;

export function getDb(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

export function getPublicDb(): SupabaseClient {
  if (!supabasePublic) {
    supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabasePublic;
}

// ── Users ──

export async function findUserByEmail(email: string) {
  const { data } = await getDb().from("users").select("*").eq("email", email).single();
  return data || null;
}

export async function createUser(email: string, password: string, name: string) {
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 12);
  const { error } = await getDb().from("users").insert({ id, email, password: hash, name, role: "user", email_verified: false });
  if (error) throw error;
  return { id, email, name, role: "user" as const };
}

export async function verifyPassword(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  let valid = false;
  const stored = user.password;

  if (stored && (stored.startsWith("$2a$") || stored.startsWith("$2b$"))) {
    valid = await bcrypt.compare(password, stored);
  } else {
    const sha = crypto.createHash("sha256").update(password).digest("hex");
    valid = sha === stored;
    if (valid) {
      try {
        const newHash = await bcrypt.hash(password, 12);
        await getDb().from("users").update({ password: newHash }).eq("id", user.id);
      } catch {
        // login tetap jalan meskipun upgrade hash gagal
      }
    }
  }

  if (!valid) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role, email_verified: user.email_verified };
}

export async function resetPassword(email: string, newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 12);
  const { error } = await getDb().from("users").update({ password: hash }).eq("email", email);
  if (error) throw error;
}

// ── Verification Codes ──

export async function createVerificationCode(email: string, purpose: string = "verify_email"): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await getDb().from("verification_codes").delete().eq("email", email).eq("purpose", purpose).eq("used", false);

  const { error } = await getDb().from("verification_codes").insert({ email, code, purpose, expires_at: expiresAt });
  if (error) throw error;
  return code;
}

export async function verifyCode(email: string, code: string, purpose: string = "verify_email"): Promise<boolean> {
  const { data } = await getDb()
    .from("verification_codes")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .eq("purpose", purpose)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return false;

  await getDb().from("verification_codes").update({ used: true }).eq("id", data.id);

  if (purpose === "verify_email") {
    await getDb().from("users").update({ email_verified: true }).eq("email", email);
  }

  return true;
}

// ── Progress ──

export async function getProgress(userId: string) {
  const { data: rows } = await getDb().from("progress").select("*").eq("user_id", userId);
  const result: Record<string, any> = {};
  for (const row of rows || []) {
    const subsRaw = typeof row.subs === "string" ? JSON.parse(row.subs) : row.subs || {};
    const subs: Record<string, { done: boolean; score: number; attempts: number; questions: number }> = {};
    let babTotal = 0;
    let babCorrect = 0;
    for (const [sk, s] of Object.entries(subsRaw)) {
      const sub = (s ?? {}) as Record<string, any>;
      const score = Math.max(0, Math.min(100, Number(sub.score) || 0));
      const questions = Math.max(1, Number(sub.questions) || 5);
      const attempts = Math.max(0, Number(sub.attempts) || 0);
      const done = !!sub.done;
      // Only count subs that were actually attempted
      if (attempts > 0 || done) {
        subs[sk] = { done, score, attempts, questions };
        babTotal += questions;
        babCorrect += Math.round((score / 100) * questions);
      }
    }
    const reflection_done = !!row.reflection_done;
    const reflection_score = Math.max(0, Math.min(100, Number(row.reflection_score) || 0));
    const reflection_questions = Math.max(1, Number(row.reflection_questions) || 5);
    if (reflection_done) {
      babTotal += reflection_questions;
      babCorrect += Math.round((reflection_score / 100) * reflection_questions);
    }
    const quizCount = Object.keys(subs).length + (reflection_done ? 1 : 0);
    if (quizCount === 0 && babTotal === 0) continue;
    result[row.bab_id] = {
      quizzes: quizCount,
      correct: babCorrect,
      total: babTotal,
      subs,
      reflection_done,
      reflection_score,
      reflection_questions,
      completion_pct: Math.max(0, Math.min(100, row.completion_pct || 0)),
    };
  }
  return result;
}

export async function saveProgress(userId: string, babId: string, data: { quizzes: number; correct: number; total: number; subs: Record<string, { done: boolean; score?: number; attempts?: number; questions?: number }>; reflection_done?: boolean; reflection_score?: number; reflection_questions?: number; completion_pct?: number }) {
  const total = Math.max(0, data.total || 0);
  const correct = Math.max(0, Math.min(total, data.correct || 0));
  const { error } = await getDb().from("progress").upsert(
    {
      user_id: userId,
      bab_id: babId,
      quizzes: data.quizzes || 0,
      correct,
      total,
      subs: data.subs,
      reflection_done: data.reflection_done || false,
      reflection_score: data.reflection_score || 0,
      reflection_questions: data.reflection_questions || 0,
      completion_pct: Math.max(0, Math.min(100, data.completion_pct || 0)),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,bab_id" }
  );
  if (error) throw error;
}
