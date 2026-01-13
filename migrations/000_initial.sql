-- Initial database schema for Haiku Battle League MVP
-- Uses PostgreSQL 14+ (UUID, gen_random_uuid, plpgsql)

-- Enable extensions for UUID generation and cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------
-- Users
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically update `updated_at` on row changes.
CREATE OR REPLACE FUNCTION users_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION users_update_updated_at();

-- ------------------------------------------------------------------------
-- Haikus
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS haikus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    -- Flag indicates whether the haiku is publicly visible for battles.
    -- This allows future moderation flags. Defaults to true.
    is_public BOOLEAN NOT NULL DEFAULT true,
    -- Optional line count for quick validation and front‑end UI.
    line_count INTEGER CHECK (line_count >= 1 AND line_count <= 3) DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- Battles
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    haiku_a_id UUID REFERENCES haikus(id) ON DELETE RESTRICT,
    haiku_b_id UUID REFERENCES haikus(id) ON DELETE RESTRICT,
    winner_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- Aggregated daily and weekly points
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_points (
    user_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

CREATE TABLE IF NOT EXISTS weekly_points (
    user_id UUID REFERENCES users(id),
    week_start DATE NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, week_start)
);

-- Daily winners (top user for each day)
CREATE TABLE IF NOT EXISTS daily_winners (
    date DATE PRIMARY KEY,
    winner_user_id UUID REFERENCES users(id),
    points INTEGER NOT NULL
);

-- Weekly winners (top user per week)
CREATE TABLE IF NOT EXISTS weekly_winners (
    week_start DATE PRIMARY KEY,
    winner_user_id UUID REFERENCES users(id),
    points INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_haikus_user_id ON haikus(user_id);
-- Trigram index for full‑text search on haiku content (great for searching by keyword).</n+-- The GIN index provides efficient LIKE/ILIKE queries.
CREATE INDEX IF NOT EXISTS idx_haikus_content_trgm ON haikus USING GIN (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_battles_created_at ON battles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_points ON users(points DESC);
CREATE INDEX IF NOT EXISTS idx_battles_winner_id ON battles(winner_id);
CREATE INDEX IF NOT EXISTS idx_battles_haiku_a_id ON battles(haiku_a_id);
CREATE INDEX IF NOT EXISTS idx_battles_haiku_b_id ON battles(haiku_b_id);
-- Additional indexes for efficient aggregation and leaderboards
CREATE INDEX IF NOT EXISTS idx_daily_points_user_date ON daily_points(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_points_user_week ON weekly_points(user_id, week_start DESC);
