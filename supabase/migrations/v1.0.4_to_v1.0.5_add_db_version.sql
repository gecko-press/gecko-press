/*
  # Add GeckoPress DB Version Column

  1. Modified Tables
    - `site_settings`
      - `geckopress_db_version` (text) - Tracks database schema version separately from app version

  2. Purpose
    - Allows independent tracking of database schema versions
    - Enables migration checks and upgrade notifications
    - Separates app version (geckopress_version) from schema version (geckopress_db_version)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'geckopress_db_version'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN geckopress_db_version text DEFAULT '1.0.5';
  END IF;
END $$;
