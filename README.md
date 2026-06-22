# FilmIN

**FilmIN** = IMDb's open film/TV catalog fused with a LinkedIn-style professional network, purpose-built
for the film industry — for actors, cinematographers, choreographers, writers, directors, producers, and
every below-the-line role.

> **Free forever. Funded by ads, not paywalls.** FilmIN deliberately surpasses everything IMDbPro
> paywalls ($150/yr) at **$0** to users. There is no subscription or paywall — ever — on a
> professional's own page.

## What's built (MVP)

- **Catalog & discovery** — title pages (poster, year, synopsis, cast & crew), search, home "trending" row.
- **Professional identity** — sign up / log in, **claim** an imported page, edit your profile, and
  **upload a headshot for free** (the headline IMDbPro-killer, scenario S1).
- **Social** — follow people, an activity feed, posts, and likes (scenario S4).

All catalog data is imported from the **TMDB API** into our own database — we own the graph; this is not a
live proxy. IMDb is never scraped.

## Stack

Next.js 16 (App Router, RSC, Turbopack) · React 19 · PostgreSQL + Prisma 7 (driver adapter) ·
Auth.js (NextAuth v5) · Tailwind + shadcn/ui · Zod · **TMDB API** for catalog · Vitest + Playwright.
Deploy target: Vercel + Neon.

## Setup

1. **Install** dependencies:
   ```bash
   npm install
   ```
2. **Configure** the environment — copy the template and fill in real values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — a Postgres connection string ([Neon](https://neon.tech) recommended).
   - `TMDB_API_KEY` — free key from <https://www.themoviedb.org/settings/api>.
   - `AUTH_SECRET` — generate with `npx auth secret`.
3. **Migrate** the database:
   ```bash
   npm run db:migrate
   ```
4. **Seed** the catalog from TMDB (curated titles + this week's trending):
   ```bash
   npm run db:seed
   ```
5. **Run** the dev server:
   ```bash
   npm run dev
   ```
   Open <http://localhost:3000>.

## Try the MVP journey

1. Search a seeded film (e.g. *Inception*) → open its **title page** → see cast/crew linked to pages.
2. **Sign up**, find your (or any) imported page, click **"This is me — claim this page"**.
3. **Edit** your page and **upload a headshot** — it persists and renders. *(scenario S1)*
4. With a second account, **follow** the first; the first **posts** an update → it appears in the
   follower's **feed**, where it can be **liked**. *(scenario S4)*

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests (TMDB mapping & slug utils) |
| `npm run test:e2e` | Playwright smoke (search → title → claim → post) |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Import catalog from TMDB |
| `npm run db:studio` | Prisma Studio |

### Running tests

- **Unit** (`npm run test`) needs no database or keys — it covers the pure mapping/slug helpers.
- **E2E** (`npm run test:e2e`) needs a running app backed by a **seeded** database and a `TMDB_API_KEY`.
  Playwright boots the dev server automatically; set `PLAYWRIGHT_BASE_URL` to target an already-running
  instance instead. Install browsers once with `npx playwright install`.

## Docs

- [`docs/FilmIN-Product-Spec.pdf`](docs/FilmIN-Product-Spec.pdf) — Product Requirements & Scenarios Spec.
- [`docs/Technical-Spec.md`](docs/Technical-Spec.md) — stack, data model, TMDB integration, build phases.
- [`docs/Design-Concept.md`](docs/Design-Concept.md) — visual direction & information architecture.

## Legal

Catalog data comes from the **TMDB API**. This product uses the TMDB API but is not endorsed or certified
by TMDB. No IMDb data is used or scraped.
