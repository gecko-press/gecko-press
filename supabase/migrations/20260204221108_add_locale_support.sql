/*
  # Add Locale Support for Multi-language Architecture

  ## Overview
  This migration adds locale/language support to GeckoPress, separating UI i18n 
  (handled by Paraglide at compile-time) from content i18n (handled by database).

  ## Architecture Decision
  - UI i18n: Paraglide (compile-time, type-safe, RSC friendly)
  - Content i18n: Database language_code columns

  ## Changes

  ### 1. site_settings - Site-level locale configuration
  - `default_locale` (text) - Default language for the site (e.g., 'en', 'tr')
  - `supported_locales` (text[]) - Array of supported language codes

  ### 2. posts - Content language tracking
  - `language_code` (text) - Language of the post content

  ### 3. pages - Content language tracking
  - `language_code` (text) - Language of the page content

  ### 4. categories - Content language tracking
  - `language_code` (text) - Language of the category

  ## Important Notes
  1. Default locale is 'en' for backwards compatibility
  2. Existing content will be marked as 'en' by default
  3. Indexes added for efficient language-based queries
  4. This enables future multi-site, multi-language support
*/

-- Add locale columns to site_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'default_locale'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN default_locale text DEFAULT 'en' NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'supported_locales'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN supported_locales text[] DEFAULT '{en}' NOT NULL;
  END IF;
END $$;

-- Add language_code to posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE posts ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_language_code ON posts(language_code);

-- Add language_code to pages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE pages ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pages_language_code ON pages(language_code);

-- Add language_code to categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'language_code'
  ) THEN
    ALTER TABLE categories ADD COLUMN language_code text DEFAULT 'en' NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categories_language_code ON categories(language_code);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
