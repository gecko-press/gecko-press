/*
  # GeckoraPress Initial Database Schema

  ## Overview
  Complete database schema for GeckoraPress - A modern blog platform with GeckoAuthority integration.
  This is the consolidated migration file for auto-deploy systems.

  IMPORTANT: This file contains ALL database objects needed for a fresh installation.
  Run this file once to set up your database completely.

  ## Tables Created

  ### Content Management
  - `categories` - Blog post categories with icons and descriptions
  - `posts` - Blog posts with full GeckoAuthority integration support
    - Includes: content_markdown for storing original markdown from GeckoAuthority
  - `comments` - Threaded comments system with moderation
  - `pages` - Custom pages (About, Privacy Policy, Terms, etc.)
  - `post_views` - View tracking for analytics
  - `post_reactions` - Emoji reaction system (clap, heart, fire, rocket, thinking)

  ### Configuration
  - `theme_settings` - Visual theme configuration (singleton pattern)
  - `site_settings` - Site-wide settings including:
    - AdSense configuration
    - Contact info
    - Webhook settings (webhook_id, webhook_url, webhook_secret)
    - Logo URL (logo_url)
    - Author bio (author_bio)
  - `menu_items` - Dynamic navigation menu management

  ### User Interaction
  - `newsletter_subscribers` - Email newsletter subscriptions
  - `contact_submissions` - Contact form submissions

  ## Storage Buckets
  - `post-images` - For cover images and content images (10MB limit)
  - `post-audio` - For audio files/podcasts (50MB limit)

  ## Functions
  - `setup_webhook_url(project_url)` - GeckoDeploy integration function

  ## Security
  - All tables have RLS enabled
  - Public read access for published content
  - Authenticated write access for management
  - Anonymous insert for user-generated content (comments, contact forms, newsletter)
  - Storage buckets: public read, service_role write

  ## Indexes
  - Optimized for common query patterns
  - Full-text search support with GIN indexes
  - Foreign key indexes for join performance
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'folder',
  show_on_homepage boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- =====================================================
-- POSTS TABLE (with all GeckoAuthority fields)
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  cover_image text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author_name text DEFAULT 'GeckoAuthority',
  author_avatar text,
  reading_time integer DEFAULT 5,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  meta_description text DEFAULT '',
  content_images jsonb DEFAULT '[]'::jsonb,
  audio_url text,
  youtube_video_id text,
  json_ld_schemas jsonb DEFAULT '[]'::jsonb,
  tags text[] DEFAULT '{}',
  source text DEFAULT 'manual',
  featured_image text,
  content_markdown text
);

CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_source ON posts(source);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- =====================================================
-- THEME SETTINGS TABLE (with hero settings)
-- =====================================================
CREATE TABLE IF NOT EXISTS theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL DEFAULT 'global',
  hero_variant text DEFAULT 'centered',
  card_variant text DEFAULT 'classic',
  font_set text DEFAULT 'modern',
  color_palette text DEFAULT 'forest',
  radius text DEFAULT 'md',
  newsletter_title text DEFAULT 'Stay Updated',
  newsletter_description text DEFAULT 'Join our newsletter for the latest updates delivered straight to your inbox.',
  updated_at timestamptz DEFAULT now(),
  hero_settings jsonb DEFAULT '{
    "centered": {
      "badge": "Powered by GeckoAuthority",
      "title": "Modern Blog",
      "subtitle": "Ultra Fast & SEO Focused",
      "description": "Showcase your content created with GeckoAuthority. Meet the world''s fastest autonomous blog platform.",
      "searchPlaceholder": "Search articles...",
      "features": [
        {
          "icon": "Zap",
          "title": "Lightning Fast",
          "description": "Maximum performance with Next.js 13"
        },
        {
          "icon": "Globe",
          "title": "SEO Optimized",
          "description": "Rank higher in search engines"
        },
        {
          "icon": "Shield",
          "title": "Open Source",
          "description": "Completely free under MIT license"
        }
      ]
    },
    "split": {
      "badge": "Top Technology Blog",
      "title": "Discover the",
      "subtitle": "Future of Tech",
      "description": "In-depth reviews, guides, and insights on the latest technology trends. Stay ahead with expert analysis and recommendations.",
      "searchPlaceholder": "What are you looking for?",
      "imageUrl": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "metrics": [
        {
          "icon": "BookOpen",
          "value": "500+",
          "label": "Articles"
        },
        {
          "icon": "Users",
          "value": "50K+",
          "label": "Readers"
        },
        {
          "icon": "TrendingUp",
          "value": "10+",
          "label": "Categories"
        }
      ]
    },
    "minimal": {
      "title": "Tech insights,",
      "subtitle": "simplified.",
      "description": "Expert reviews and buying guides to help you make smarter tech decisions.",
      "searchPlaceholder": "Search articles..."
    }
  }'::jsonb
);

-- =====================================================
-- SITE SETTINGS TABLE (with all AdSense and config fields)
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text DEFAULT '',
  site_url text DEFAULT '',
  adsense_header text DEFAULT '',
  adsense_article text DEFAULT '',
  adsense_sidebar text DEFAULT '',
  adsense_before_content text DEFAULT '',
  adsense_after_content text DEFAULT '',
  adsense_footer text DEFAULT '',
  adsense_category_sidebar text DEFAULT '',
  adsense_home_after_hero text DEFAULT '',
  adsense_home_between_categories text DEFAULT '',
  adsense_home_before_newsletter text DEFAULT '',
  webhook_id text DEFAULT '',
  webhook_url text DEFAULT '',
  webhook_secret text DEFAULT '',
  logo_url text DEFAULT '',
  author_bio text,
  privacy_policy text DEFAULT '',
  terms_of_service text DEFAULT '',
  contact_email text DEFAULT '',
  contact_address text DEFAULT '',
  social_links jsonb DEFAULT '{}',
  blog_name text DEFAULT '',
  geckopress_version text DEFAULT '1.0.0',
  geckopress_db_version text DEFAULT '1.0.0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Helper functions for site_settings
CREATE OR REPLACE FUNCTION generate_webhook_secret()
RETURNS text AS $$
BEGIN
  RETURN 'whsec_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_webhook_url_id()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- PAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text DEFAULT '',
  meta_description text DEFAULT '',
  is_published boolean DEFAULT false,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_published ON pages(is_published);

CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- MENU ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text DEFAULT '',
  page_id uuid REFERENCES pages(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  location text NOT NULL CHECK (location IN ('header', 'footer', 'both')),
  position integer DEFAULT 0,
  open_in_new_tab boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_location ON menu_items(location);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_position ON menu_items(position);

CREATE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- POST VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);

-- =====================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- =====================================================
-- CONTACT SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);

-- =====================================================
-- POST REACTIONS TABLE (v1.0.1)
-- Emoji reaction system like Medium's clap feature
-- =====================================================
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

CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are publicly readable"
  ON posts FOR SELECT
  TO anon, authenticated
  USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage posts"
  ON posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Theme Settings
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Theme settings are publicly readable"
  ON theme_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update theme settings"
  ON theme_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site Settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings"
  ON site_settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can view own settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Pages
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages"
  ON pages
  FOR SELECT
  USING (is_published = true OR published = true);

CREATE POLICY "Authenticated users can manage pages"
  ON pages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Menu Items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
  ON menu_items
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage menu items"
  ON menu_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Post Views
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record views"
  ON post_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read view counts"
  ON post_views FOR SELECT
  TO anon, authenticated
  USING (true);

-- Newsletter Subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read newsletter subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update newsletter subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete newsletter subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);

-- Contact Submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contact submissions"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contact submissions"
  ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved comments"
  ON comments
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can insert comments"
  ON comments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (true);

-- Post Reactions
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read post reactions"
  ON post_reactions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert reactions with session"
  ON post_reactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (session_id IS NOT NULL AND length(session_id) > 0);

CREATE POLICY "Anyone can update own reactions"
  ON post_reactions
  FOR UPDATE
  TO anon, authenticated
  USING (session_id IS NOT NULL)
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Anyone can delete own reactions"
  ON post_reactions
  FOR DELETE
  TO anon, authenticated
  USING (session_id IS NOT NULL);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default theme settings
INSERT INTO theme_settings (key) VALUES ('global')
ON CONFLICT (key) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Smartphones', 'smartphones', 'Discover the latest smartphone reviews, comparisons, and buying guides.', 'smartphone'),
  ('Robot Vacuums', 'robot-vacuums', 'Find the perfect robot vacuum for your home with our expert reviews.', 'bot'),
  ('Wireless Headphones', 'wireless-headphones', 'Explore top wireless headphones for music, gaming, and sports.', 'headphones'),
  ('Gaming Consoles', 'gaming-consoles', 'Stay updated on gaming consoles, accessories, and game reviews.', 'gamepad-2')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STORAGE BUCKETS FOR POST MEDIA
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('post-images', 'post-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('post-audio', 'post-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for post-images
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for post images') THEN
    CREATE POLICY "Public read access for post images"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'post-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can upload post images') THEN
    CREATE POLICY "Service role can upload post images"
      ON storage.objects FOR INSERT
      TO service_role
      WITH CHECK (bucket_id = 'post-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can update post images') THEN
    CREATE POLICY "Service role can update post images"
      ON storage.objects FOR UPDATE
      TO service_role
      USING (bucket_id = 'post-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can delete post images') THEN
    CREATE POLICY "Service role can delete post images"
      ON storage.objects FOR DELETE
      TO service_role
      USING (bucket_id = 'post-images');
  END IF;
END $$;

-- Storage Policies for post-audio
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for post audio') THEN
    CREATE POLICY "Public read access for post audio"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'post-audio');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can upload post audio') THEN
    CREATE POLICY "Service role can upload post audio"
      ON storage.objects FOR INSERT
      TO service_role
      WITH CHECK (bucket_id = 'post-audio');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can update post audio') THEN
    CREATE POLICY "Service role can update post audio"
      ON storage.objects FOR UPDATE
      TO service_role
      USING (bucket_id = 'post-audio');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can delete post audio') THEN
    CREATE POLICY "Service role can delete post audio"
      ON storage.objects FOR DELETE
      TO service_role
      USING (bucket_id = 'post-audio');
  END IF;
END $$;

-- =====================================================
-- WEBHOOK SETUP FUNCTION FOR GECKODEPLOY
-- =====================================================

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
      'GeckoAuthority',
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

GRANT EXECUTE ON FUNCTION setup_webhook_url(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION setup_webhook_url(TEXT) TO anon;

COMMENT ON FUNCTION setup_webhook_url(TEXT) IS
'Sets up webhook URL for GeckoDeploy integration. Returns complete webhook config including categories endpoint URL.';

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
