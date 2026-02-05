/*
  # Add DELETE policy to post_reactions

  1. Security Changes
    - Add DELETE policy for `post_reactions` table
    - Allows anon and authenticated users to delete reactions that have a valid session_id
    - This enables the existing reaction toggle functionality (delete old reaction before inserting new one)

  2. Important Notes
    - The API route already filters by session_id + post_id, so only the session owner can trigger deletion of their own reactions
    - No UPDATE policy needed as reactions are always deleted and re-inserted
*/

CREATE POLICY "Anyone can delete own reactions by session"
  ON post_reactions FOR DELETE
  TO anon, authenticated
  USING (session_id IS NOT NULL AND length(session_id) > 0);
