# Manabooks

Personal book tracking app — log what you read, filter by status, discover new books via Google Books.

## Stack

| Layer        | Choice                                           |
| ------------ | ------------------------------------------------ |
| Framework    | Next.js 16 (App Router, React Server Components) |
| Language     | TypeScript strict                                |
| Backend      | Supabase (Postgres + Auth + Storage)             |
| External API | Google Books API                                 |
| Styling      | Tailwind v4 (CSS-first `@theme`) + shadcn/ui     |
| Hosting      | Vercel (hobby plan)                              |

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker (for Supabase local dev with CLI)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Fill in the values in .env.local (see "Env vars" section below)

# 3. Start Supabase locally (optional — only needed for migrations)
supabase start

# 4. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Env vars

| Variable                               | Description                                                            |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key — safe to expose                       |
| `SUPABASE_SECRET_KEY`                  | Supabase secret key — **server-only, never prefix with NEXT*PUBLIC***  |
| `GOOGLE_BOOKS_API_KEY`                 | Google Books API key — **server-only, never prefix with NEXT*PUBLIC*** |
| `NEXT_PUBLIC_SITE_URL`                 | App origin, e.g. `http://localhost:3000` or your Vercel URL            |

Copy `.env.example` to `.env.local` and fill in real values. Never commit `.env.local`.

## Supabase CLI (local development)

```bash
# One-time setup (Podman/Docker required):
supabase login
supabase link --project-ref <your-project-ref>
supabase start

# After adding a migration, regenerate TypeScript types:
pnpm supabase:types
```

The `lib/database.types.ts` file is a stub — regenerate it once you have tables.

## Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (Web application).
3. Add authorized JavaScript origin: `http://localhost:3000` (and your Vercel URL for production).
4. Add authorized redirect URI: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`.
5. Copy the Client ID and Client Secret to Supabase Dashboard → Authentication → Providers → Google.

## Scripts

| Script              | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `pnpm dev`          | Start the dev server (Next.js with Turbopack)                 |
| `pnpm build`        | Build for production                                          |
| `pnpm start`        | Start the production server                                   |
| `pnpm typecheck`    | Run `tsc --noEmit` — zero errors required                     |
| `pnpm lint`         | Run ESLint with Next.js + TypeScript rules                    |
| `pnpm format`       | Format all files with Prettier                                |
| `pnpm format:check` | Check formatting (used in CI)                                 |
| `pnpm test`         | Run Vitest unit/component tests                               |
| `pnpm test:e2e`     | Run Playwright end-to-end tests (requires `pnpm dev` running) |

## Manual setup steps

These are one-time steps that cannot be automated:

1. **Google Cloud Console** — Create an OAuth 2.0 client ID (Web application). Add `https://<your-vercel-domain>/auth/callback` as an authorized redirect URI.
2. **Supabase dashboard** — Enable Google as an auth provider under Authentication → Providers. Paste the Client ID and Secret from step 1.
3. **Vercel project** — Create a new project linked to this repo. Add all env vars from `.env.example` in the Vercel dashboard under Settings → Environment Variables.
4. **Branch protection** — In GitHub → Settings → Branches, add a rule for `main` requiring the CI check to pass before merging.

## Deploy notes

- Hosting: Vercel hobby plan (free tier). Each push to `main` triggers an automatic deployment.
- Environment variables required on Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `GOOGLE_BOOKS_API_KEY`, `NEXT_PUBLIC_SITE_URL`.
- `SUPABASE_SECRET_KEY` and `GOOGLE_BOOKS_API_KEY` must **never** be prefixed with `NEXT_PUBLIC_`.
