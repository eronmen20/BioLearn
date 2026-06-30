import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

let supabase: SupabaseClient;

function getDb(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// ── Users ──

export async function findUserByEmail(email: string) {
  const { data } = await getDb().from("users").select("*").eq("email", email).single();
  return data || null;
}

export async function createUser(email: string, password: string, name: string) {
  const id = crypto.randomUUID();
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const { error } = await getDb().from("users").insert({ id, email, password: hash, name, role: "user", email_verified: false });
  if (error) throw error;
  return { id, email, name, role: "user" as const };
}

export async function verifyPassword(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.password !== hash) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role, email_verified: user.email_verified };
}

// ── Email Verification ──

export async function createVerificationCode(email: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // Delete old codes for this email
  await getDb().from("verification_codes").delete().eq("email", email).eq("used", false);

  const { error } = await getDb().from("verification_codes").insert({ email, code, expires_at: expiresAt });
  if (error) throw error;
  return code;
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const { data } = await getDb()
    .from("verification_codes")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return false;

  // Mark code as used
  await getDb().from("verification_codes").update({ used: true }).eq("id", data.id);

  // Mark user email as verified
  await getDb().from("users").update({ email_verified: true }).eq("email", email);

  return true;
}

// ── Progress ──

export async function getProgress(userId: string) {
  const { data: rows } = await getDb().from("progress").select("*").eq("user_id", userId);
  const result: Record<string, any> = {};
  for (const row of rows || []) {
    result[row.bab_id] = {
      quizzes: row.quizzes,
      correct: row.correct,
      total: row.total,
      subs: typeof row.subs === "string" ? JSON.parse(row.subs) : row.subs || {},
    };
  }
  return result;
}

export async function saveProgress(userId: string, babId: string, data: { quizzes: number; correct: number; total: number; subs: Record<string, { done: boolean }> }) {
  const { error } = await getDb().from("progress").upsert(
    { user_id: userId, bab_id: babId, quizzes: data.quizzes, correct: data.correct, total: data.total, subs: data.subs, updated_at: new Date().toISOString() },
    { onConflict: "user_id,bab_id" }
  );
  if (error) throw error;
}
