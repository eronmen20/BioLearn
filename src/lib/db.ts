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

export async function findUserByEmail(email: string) {
  const { data } = await getDb().from("users").select("*").eq("email", email).single();
  return data || null;
}

export async function createUser(email: string, password: string, name: string) {
  const id = crypto.randomUUID();
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const { error } = await getDb().from("users").insert({ id, email, password: hash, name, role: "user" });
  if (error) throw error;
  return { id, email, name, role: "user" };
}

export async function verifyPassword(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.password !== hash) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

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
