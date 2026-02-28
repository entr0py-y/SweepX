-- ─────────────────────────────────────────────────────────────────────────────
-- SweepX Photo Verification System — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation (already enabled in most Supabase projects)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Quest Sessions ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quest_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT        NOT NULL,
  quest_id         TEXT        NOT NULL,

  -- Quest location (the target spot)
  quest_lat        DOUBLE PRECISION NOT NULL,
  quest_lng        DOUBLE PRECISION NOT NULL,

  -- User location at session start
  user_lat         DOUBLE PRECISION,
  user_lng         DOUBLE PRECISION,
  distance_meters  DOUBLE PRECISION,

  -- Timestamps
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,

  -- Status: active → completed | rejected
  status           TEXT        NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active', 'completed', 'rejected')),
  rejection_reason TEXT,

  -- Detection counts (filled in as photos are processed)
  trash_count_before  INTEGER  DEFAULT 0,
  trash_count_after   INTEGER  DEFAULT 0,
  before_image_url    TEXT,
  after_image_url     TEXT,

  -- XP awarded on completion
  xp_awarded       INTEGER     DEFAULT 0,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON quest_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status      ON quest_sessions (status);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at  ON quest_sessions (started_at);

-- ─── Quest Images ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quest_images (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           UUID         NOT NULL REFERENCES quest_sessions(id) ON DELETE CASCADE,
  user_id              TEXT         NOT NULL,
  quest_id             TEXT         NOT NULL,

  type                 TEXT         NOT NULL CHECK (type IN ('before', 'after')),

  -- Cloudinary URL
  image_url            TEXT         NOT NULL,

  -- SHA-256 of the raw image bytes — UNIQUE enforces duplicate rejection
  image_hash           TEXT         NOT NULL UNIQUE,

  -- GPS at capture time
  gps_lat              DOUBLE PRECISION,
  gps_lng              DOUBLE PRECISION,
  gps_accuracy         DOUBLE PRECISION,  -- metres

  -- Roboflow detection results
  trash_count          INTEGER      NOT NULL DEFAULT 0,
  detection_confidence DOUBLE PRECISION NOT NULL DEFAULT 0,

  captured_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_session_id  ON quest_images (session_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id     ON quest_images (user_id);
CREATE INDEX IF NOT EXISTS idx_images_image_hash  ON quest_images (image_hash);

-- ─── Leaderboard ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leaderboard (
  id                  UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT  NOT NULL UNIQUE,
  username            TEXT  NOT NULL,
  xp                  INTEGER NOT NULL DEFAULT 0,
  missions_completed  INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON leaderboard (xp DESC);

-- ─── Trust Score View ─────────────────────────────────────────────────────────

-- Computed on-the-fly from quest_sessions ratio
CREATE OR REPLACE VIEW user_trust_scores AS
SELECT
  user_id,
  COUNT(*)                                                            AS total_sessions,
  COUNT(*) FILTER (WHERE status = 'completed')                        AS completed,
  COUNT(*) FILTER (WHERE status = 'rejected')                         AS rejected,
  CASE
    WHEN COUNT(*) = 0 THEN 100
    ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100)
  END                                                                 AS trust_score
FROM quest_sessions
GROUP BY user_id;

-- ─── Helper: Daily quest count ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION daily_quest_count(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0)
  FROM quest_sessions
  WHERE user_id      = p_user_id
    AND status       = 'completed'
    AND started_at::DATE = CURRENT_DATE;
$$;

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- NOTE: For production, replace the permissive anon policies with proper
--       auth.uid() = user_id checks after setting up Supabase Auth.

ALTER TABLE quest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard    ENABLE ROW LEVEL SECURITY;

-- Allow anon reads on leaderboard (public)
CREATE POLICY "leaderboard_public_read" ON leaderboard
  FOR SELECT USING (true);

-- Allow anon full access to quest records (DEVELOPMENT only — tighten in production)
CREATE POLICY "quest_sessions_anon_all" ON quest_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "quest_images_anon_all" ON quest_images
  FOR ALL USING (true) WITH CHECK (true);

-- Production policy example (uncomment and remove anon policies above):
-- CREATE POLICY "quest_sessions_user_own" ON quest_sessions
--   FOR ALL USING (auth.uid()::TEXT = user_id)
--   WITH CHECK (auth.uid()::TEXT = user_id);
--
-- CREATE POLICY "quest_images_user_own" ON quest_images
--   FOR ALL USING (auth.uid()::TEXT = user_id)
--   WITH CHECK (auth.uid()::TEXT = user_id);
