/*
  # Fix public_site_settings view and default values

  1. Changes
    - Recreate `public_site_settings` view WITHOUT `user_id` column (sensitive)
    - Restrict anon grants on view to SELECT only (was INSERT/UPDATE/DELETE too)
    - Update `posts.author_name` column default from 'GeckoAuthority' to 'GeckoPress'
    - Update `setup_webhook_url` function default author_name to 'GeckoPress'

  2. Security
    - Anon users can only SELECT from the public view (no write operations)
    - Sensitive fields (webhook_id, webhook_url, webhook_secret) remain excluded from view
    - user_id no longer exposed in public view

  3. Important Notes
    - Frontend code must query `public_site_settings` (view) instead of `site_settings` (table)
    - Admin/authenticated code continues to use `site_settings` table directly
    - Realtime subscriptions on `site_settings` table remain for authenticated users only
*/

-- Drop existing view and recreate without user_id
DROP VIEW IF EXISTS public_site_settings;

CREATE VIEW public_site_settings AS
SELECT
  id,
  author_name,
  author_bio,
  blog_name,
  logo_url,
  site_url,
  contact_email,
  contact_address,
  social_links,
  privacy_policy,
  terms_of_service,
  adsense_header,
  adsense_article,
  adsense_sidebar,
  adsense_before_content,
  adsense_after_content,
  adsense_footer,
  adsense_category_sidebar,
  adsense_home_after_hero,
  adsense_home_between_categories,
  adsense_home_before_newsletter,
  geckopress_db_version,
  default_locale,
  supported_locales,
  created_at,
  updated_at
FROM site_settings;

-- Revoke all default grants from anon and authenticated on this view
REVOKE ALL ON public_site_settings FROM anon;
REVOKE ALL ON public_site_settings FROM authenticated;

-- Grant only SELECT to anon and authenticated
GRANT SELECT ON public_site_settings TO anon;
GRANT SELECT ON public_site_settings TO authenticated;

-- Fix posts.author_name default from 'GeckoAuthority' to 'GeckoPress'
ALTER TABLE posts ALTER COLUMN author_name SET DEFAULT 'GeckoPress';

-- Recreate setup_webhook_url function with 'GeckoPress' default author_name
CREATE OR REPLACE FUNCTION setup_webhook_url(project_url TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_config jsonb;
  settings_count integer;
  clean_project_url TEXT;
  current_webhook_id TEXT;
BEGIN
  IF project_url IS NULL OR project_url = '' THEN
    RAISE EXCEPTION 'project_url cannot be empty';
  END IF;

  clean_project_url := rtrim(project_url, '/');

  SELECT COUNT(*) INTO settings_count FROM site_settings;

  IF settings_count = 0 THEN
    current_webhook_id := encode(gen_random_bytes(16), 'hex');

    INSERT INTO site_settings (
      webhook_id,
      webhook_url,
      webhook_secret,
      author_name,
      site_url
    ) VALUES (
      current_webhook_id,
      clean_project_url || '/functions/v1/gecko-webhook/' || current_webhook_id,
      'whsec_' || encode(gen_random_bytes(32), 'hex'),
      'GeckoPress',
      ''
    );
  ELSE
    SELECT webhook_id INTO current_webhook_id FROM site_settings LIMIT 1;

    IF current_webhook_id IS NULL OR current_webhook_id = '' THEN
      current_webhook_id := encode(gen_random_bytes(16), 'hex');
    END IF;

    UPDATE site_settings
    SET
      webhook_id = current_webhook_id,
      webhook_url = clean_project_url || '/functions/v1/gecko-webhook/' || current_webhook_id,
      webhook_secret = COALESCE(NULLIF(webhook_secret, ''), 'whsec_' || encode(gen_random_bytes(32), 'hex')),
      updated_at = now()
    WHERE id = (SELECT id FROM site_settings LIMIT 1);
  END IF;

  SELECT jsonb_build_object(
    'webhook_url', webhook_url,
    'webhook_id', webhook_id,
    'webhook_secret', webhook_secret,
    'categories_url', clean_project_url || '/functions/v1/gecko-categories',
    'site_url', site_url,
    'author_name', author_name
  )
  INTO webhook_config
  FROM site_settings
  LIMIT 1;

  RETURN webhook_config;
END;
$$;

-- Ensure setup_webhook_url is only callable by authenticated and service_role
REVOKE EXECUTE ON FUNCTION setup_webhook_url(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION setup_webhook_url(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION setup_webhook_url(TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
