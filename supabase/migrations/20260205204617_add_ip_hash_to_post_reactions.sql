/*
  # Add IP hash column to post_reactions

  1. Modified Tables
    - `post_reactions`
      - Added `ip_hash` (text) - SHA-256 hash of the user's IP address for server-side rate limiting

  2. Indexes
    - Added index on `ip_hash` for efficient rate-limiting queries

  3. Notes
    - IP addresses are never stored in plain text, only as truncated SHA-256 hashes
    - This column is used by the Next.js API route for rate limiting reactions per IP
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_reactions' AND column_name = 'ip_hash'
  ) THEN
    ALTER TABLE post_reactions ADD COLUMN ip_hash text DEFAULT '';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_post_reactions_ip_hash ON post_reactions(ip_hash);
CREATE INDEX IF NOT EXISTS idx_post_reactions_created_at ON post_reactions(created_at);
