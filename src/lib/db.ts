import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "biolearn.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      bab_id TEXT NOT NULL,
      quizzes INTEGER DEFAULT 0,
      correct INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      subs TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, bab_id)
    );
  `);

  // Seed demo user if not exists
  const demo = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@biolearn.id");
  if (!demo) {
    const hash = crypto.createHash("sha256").update("demo123").digest("hex");
    db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)")
      .run(crypto.randomUUID(), "demo@biolearn.id", hash, "Demo User", "user");
  }

  const admin = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@biolearn.id");
  if (!admin) {
    const hash = crypto.createHash("sha256").update("admin123").digest("hex");
    db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)")
      .run(crypto.randomUUID(), "admin@biolearn.id", hash, "Admin", "admin");
  }
}

export function findUserByEmail(email: string) {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
}

export function createUser(email: string, password: string, name: string) {
  const id = crypto.randomUUID();
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  getDb().prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)")
    .run(id, email, hash, name, "user");
  return { id, email, name, role: "user" };
}

export function verifyPassword(email: string, password: string) {
  const user = findUserByEmail(email);
  if (!user) return null;
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.password !== hash) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function getProgress(userId: string) {
  const rows = getDb().prepare("SELECT * FROM progress WHERE user_id = ?").all(userId) as any[];
  const result: Record<string, any> = {};
  for (const row of rows) {
    result[row.bab_id] = {
      quizzes: row.quizzes,
      correct: row.correct,
      total: row.total,
      subs: JSON.parse(row.subs || "{}"),
    };
  }
  return result;
}

export function saveProgress(userId: string, babId: string, data: { quizzes: number; correct: number; total: number; subs: Record<string, { done: boolean }> }) {
  getDb().prepare(`
    INSERT INTO progress (user_id, bab_id, quizzes, correct, total, subs, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, bab_id) DO UPDATE SET
      quizzes = excluded.quizzes,
      correct = excluded.correct,
      total = excluded.total,
      subs = excluded.subs,
      updated_at = datetime('now')
  `).run(userId, babId, data.quizzes, data.correct, data.total, JSON.stringify(data.subs));
}
