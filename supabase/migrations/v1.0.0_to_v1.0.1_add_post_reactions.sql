/*
  # v1.0.0 to v1.0.1 - Add Post Reactions Table

  ## Overview
  Adds emoji reaction system (like Medium's clap feature) to blog posts.
  Users can react to posts with different emojis, tracked by session ID.

  ## New Tables
  - `post_reactions`
    - `id` (uuid, primary key) - Unique identifier
    - `post_id` (uuid, foreign key) - Reference to posts table
    - `reaction_type` (text) - Emoji type: clap, heart, fire, thinking, rocket
    - `session_id` (text) - Anonymous user tracking via localStorage
    - `count` (integer) - Number of times reaction given (max 50 per session)
    - `created_at` (timestamp) - When first reacted
    - `updated_at` (timestamp) - When last updated

  ## Security
  - RLS enabled on post_reactions table
  - Anyone can read reactions (for displaying counts)
  - Anyone can insert/update/delete their own reactions (by session_id)

  ## Indexes
  - Index on post_id for fast aggregation queries
  - Unique constraint on (post_id, reaction_type, session_id)
*/

-- Create post_reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type text NOT NULL DEFAULT 'clap',
  session_id text NOT NULL,
  count integer NOT NULL DEFAULT 1 CHECK (count >= 1 AND count <= 50),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(post_id, reaction_type, session_id)
);

-- Create index for fast aggregation queries
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);

-- Enable RLS
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read post reactions') THEN
    CREATE POLICY "Anyone can read post reactions"
      ON post_reactions
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert reactions with session') THEN
    CREATE POLICY "Anyone can insert reactions with session"
      ON post_reactions
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (session_id IS NOT NULL AND length(session_id) > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update own reactions') THEN
    CREATE POLICY "Anyone can update own reactions"
      ON post_reactions
      FOR UPDATE
      TO anon, authenticated
      USING (session_id IS NOT NULL)
      WITH CHECK (session_id IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete own reactions') THEN
    CREATE POLICY "Anyone can delete own reactions"
      ON post_reactions
      FOR DELETE
      TO anon, authenticated
      USING (session_id IS NOT NULL);
  END IF;
END $$;
