/*
  # v1.0.6 to v1.0.7 - Add Test Column to Posts

  ## Overview
  Adds a test column to posts table for version upgrade testing.

  ## Modified Tables
  - `posts`
    - `test_column_5` (text, nullable) - Test column for migration verification

  ## Notes
  - This is a test migration to verify the version upgrade system
  - Column can be safely removed after testing
*/

-- Add test_column_5 to posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'test_column_5'
  ) THEN
    ALTER TABLE posts ADD COLUMN test_column_5 text;
  END IF;
END $$;
