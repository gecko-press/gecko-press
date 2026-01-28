# GeckoPress Database Setup

This folder contains GeckoPress's database schema and setup tools.

## Fresh Installation

For a new installation, run the `initial_schema.sql` file once. This file contains:

- All database tables
- All RLS policies
- Storage buckets (post-images, post-audio)
- Helper functions (setup_webhook_url)
- Default data (theme settings, categories)

**Steps:**
1. Copy the contents of `initial_schema.sql`
2. Go to Supabase Dashboard -> SQL Editor
3. Paste and run the SQL
4. Done! Your database is fully set up.

---

## GeckoDeploy Integration

When GeckoDeploy sets up a new installation:

### 1. Database Schema
Apply `initial_schema.sql` to Supabase. All tables, RLS policies, and default data will be created.

### 2. Deploy Edge Functions
Deploy the `gecko-webhook` edge function before step 3.

### 3. Setup Webhook URL
Call the setup function to configure webhooks:

```javascript
const { data, error } = await supabase.rpc('setup_webhook_url', {
  project_url: 'https://abcdefgh.supabase.co'
});

// Returns:
// {
//   webhook_url: "https://abcdefgh.supabase.co/functions/v1/gecko-webhook/{webhook_id}",
//   webhook_id: "a1b2c3d4...",
//   webhook_secret: "whsec_abc123...",
//   site_url: "",
//   author_name: "GeckoAuthority"
// }
```

Register with Gecko Authority:
```javascript
await fetch('https://geckoauthority.com/api/sites/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    webhook_url: data.webhook_url,
    webhook_secret: data.webhook_secret,
  })
});
```

### 4. Admin User Creation

**Automatic (Recommended):**
```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... \
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=securepassword123 \
node scripts/database/create-admin.js
```

**Manual (Supabase Dashboard):**
1. Supabase Dashboard -> Authentication -> Users
2. Click "Add User"
3. Enter email and password
4. Enable "Auto Confirm User"
5. Click Create User

---

## Database Tables

**Content Management:**
- `categories` - Blog categories
- `posts` - Blog posts (with GeckoAuthority integration)
- `comments` - Comment system (threaded, moderated)
- `pages` - Custom pages
- `post_views` - View analytics

**Configuration:**
- `theme_settings` - Theme settings (singleton)
- `site_settings` - Site settings (AdSense, contact, webhook)
- `menu_items` - Dynamic menu management

**User Interaction:**
- `newsletter_subscribers` - Email subscriptions
- `contact_submissions` - Contact form submissions

---

## Files

### initial_schema.sql
Complete database schema. Contains all tables, RLS policies, storage buckets, and default data.

### create-admin.js
Node.js script for creating the first admin user.

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... \
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=securepassword123 \
node scripts/database/create-admin.js
```

Features:
- Creates user with email/password
- Auto-confirms email
- Creates site settings record
- Can generate random password if ADMIN_PASSWORD not provided
