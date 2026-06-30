-- Supabase schema for BioLearn
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bab_id TEXT NOT NULL,
  quizzes INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  subs JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, bab_id)
);
