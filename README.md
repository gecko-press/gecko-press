<div align="center">
  <a href="https://geckopress.org">
    <img src="https://geckodeploy.com/geckopress-logo.svg" alt="GeckoPress" height="58"/>
  </a>
  <br/>
</div>

<div align="center">
  A modern, customizable blog and content management platform built with Next.js and Supabase.
</div>

<br/>

## Powered by GeckoAuthority & GeckoDeploy

<table>
  <tr>
    <td align="center" width="50%">
    <br/>
      <a href="https://geckoauthority.com">
        <img src="https://geckoauthority.com/images/logo.svg" alt="GeckoAuthority" height="58"/>
      </a>
      <br/><br/>
      Generate SEO-optimized articles powered by <b>Knowledge Space Mapping</b>. AI-driven validation ensures factual accuracy and topical relevance.
      <br/><br/>
    </td>
    <td align="center" width="50%">
    <br/>
      <a href="https://geckodeploy.com">
        <img src="https://geckodeploy.com/geckodeploy-logo-light.svg" alt="GeckoDeploy" height="48"/>
      </a>
      <br/><br/>
      Launch your GeckoBlog in under 5 minutes. No coding or integration knowledge required. Fully automated deployment with one click.
      <br/><br/>
    </td>
  </tr>
</table>

> **Get Started Free** - Create your professional blog with AI-powered content generation. GeckoAuthority seamlessly integrates with GeckoBlog to deliver high-quality, SEO-ready articles directly to your site.

---

## Features

- **Blog Management** - Create, edit, and publish blog posts with rich content
- **Category System** - Organize posts into categories with dedicated pages
- **Admin Dashboard** - Full-featured admin panel for content management
- **Theme Customization** - Multiple hero styles, card layouts, and color schemes
- **Newsletter Integration** - Built-in newsletter subscription system
- **Comments System** - Reader engagement through post comments
- **Contact Form** - Contact page with submission management
- **AdSense Support** - Configurable ad placements throughout the site
- **SEO Optimized** - RSS feed, sitemap, and meta tags included
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **GeckoAuthority Integration** - Automatic webhook setup for content distribution
- **Auto-Deploy Ready** - Built for GeckoDeploy automated deployments

## Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/belisoftware/gecko-press.git
   cd gecko-press
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials in the `.env` file.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

**Fresh Installation:**
Run the initial schema file to create all required tables:
```sql
scripts/database/initial_schema.sql
```

**Updating an Existing Installation:**
If you're upgrading from a previous version, apply the migration files in `supabase/migrations/` in order to update your database schema.

### Creating Admin User

After setting up the database, create your admin user via Supabase Dashboard SQL Editor:

**Step 1:** Run this SQL to create the auth user (change email and password as needed):

```sql
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, recovery_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',  -- Change this
  crypt('YourSecurePassword123!', gen_salt('bf')),  -- Change this
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin","name":"Admin User"}',
  now(), now(), '', '', '', ''
) RETURNING id;
```

**Step 2:** Copy the returned `id` value, then run:

```sql
INSERT INTO public.site_settings (user_id, author_name, site_url, contact_email)
VALUES (
  'PASTE_THE_ID_HERE',  -- Paste the UUID from Step 1
  'Your Site Name',
  'https://yoursite.com',
  'admin@example.com'
);
```

Now you can log in at `/login` with your credentials.

### Edge Functions

The project includes two Supabase Edge Functions in `supabase/functions/`:

| Function | Description |
|----------|-------------|
| `gecko-webhook` | Receives content from GeckoAuthority and creates/updates posts automatically |
| `gecko-categories` | Returns available categories for GeckoAuthority content targeting |

#### Deploying Edge Functions

**Option 1: Using Supabase CLI (Recommended)**

If you deploy via Supabase CLI, the `supabase/config.toml` file automatically configures `verify_jwt = false` for both functions:

```bash
supabase functions deploy gecko-webhook
supabase functions deploy gecko-categories
```

**Option 2: Manual Deploy via Supabase Dashboard**

If you deploy manually through the Supabase Dashboard:

1. Go to **Edge Functions** in your Supabase project
2. Create each function and paste the code from `supabase/functions/[function-name]/index.ts`
3. **Important**: Disable JWT verification for both functions:
   - In function settings, turn OFF "Enforce JWT Verification"
   - This allows GeckoAuthority to send webhooks without authentication

> **Why disable JWT?** These functions receive external webhooks from GeckoAuthority. JWT verification would block these incoming requests since they don't include a Supabase auth token.

## Project Structure

```
├── app/                 # Next.js App Router pages
│   ├── admin/           # Admin dashboard pages
│   ├── blog/            # Blog post pages
│   ├── categories/      # Category pages
│   └── ...
├── components/          # React components
│   ├── admin/           # Admin-specific components
│   ├── blog/            # Blog-related components
│   ├── theme/           # Theme components (heroes, cards)
│   └── ui/              # shadcn/ui components
├── lib/                 # Utilities and configurations
│   ├── supabase/        # Supabase client and queries
│   └── theme/           # Theme configuration
└── supabase/            # Supabase migrations and functions
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
