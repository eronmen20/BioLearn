import { getDb } from "./db";

export interface LogEntry {
  user_email: string;
  user_role?: string;
  action: string;
  target_type: string;
  target_id?: string;
  detail?: Record<string, unknown>;
  ip_address?: string;
}

export async function logActivity(entry: LogEntry): Promise<boolean> {
  try {
    const supabase = getDb();
    const { error } = await supabase.from("activity_logs").insert({
      user_email: entry.user_email,
      user_role: entry.user_role || "admin",
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id || null,
      detail: entry.detail || {},
      ip_address: entry.ip_address || null,
    });
    if (error) {
      console.error("[ActivityLog] Supabase error:", error.message, error.code, error.details);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[ActivityLog] Failed to write log:", e);
    return false;
  }
}
