# FilmIN — Technical Implementation Spec

> Companion to **FilmIN — Product Requirements & Scenarios Spec** (`FilmIN-Product-Spec.pdf`).
> This document covers the *how*: stack, data model, integrations, build phases, and verification.
>
> **Product principle that constrains engineering:** the platform is **free**. There is **no
> payment, subscription, or paywall code** anywhere in the build. Future revenue is ad surfaces
> only, and those are **not** part of the MVP.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, TypeScript, React Server Components) | Server-first; SEO for fan traffic (SUBSET ONE). `params`/`searchParams` are async. |
| Database | **PostgreSQL** + **Prisma ORM** | Default host **Neon** (serverless) since Docker is not installed locally. Local alt: `brew install postgresql@16`. |
| Auth | **Auth.js (NextAuth v5)** | Email/credentials to start; OAuth later. |
| UI | **Tailwind CSS** + **shadcn/ui** + **lucide** icons | Clean, accessible, mobile-friendly. |
| Validation | **Zod** | Shared schemas for forms + server actions. |
| Catalog data | **TMDB API** | Legal source. **No IMDb data or scraping.** TMDB attribution shown per their terms. |
| Search | Postgres **`pg_trgm`** / **`tsvector`** | Title + people search. |
| Image storage | Abstraction: dev = local `/public/uploads`; prod = **Cloudinary** | Powers free headshot/photo upload. |
| Testing | **Vitest** (unit) + **Playwright** (e2e smoke) | |
| Deploy | **Vercel** + **Neon** + **Cloudinary** | |

Project directory: **`~/filmin/`**.

---

## 2. Data Model (Prisma sketch)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  profile   ProfessionalProfile? // a user may own one profile (via claim)
  follows   Follow[]  @relation("follower")
  likes     PostLike[]
}

model ProfessionalProfile {
  id            String   @id @default(cuid())
  displayName   String
  headshotUrl   String?
  bio           String?
  roles         String[] // e.g. ["Actor", "Choreographer"]
  location      String?
  links         Json?    // { website, vimeo, instagram, ... }
  tmdbPersonId  Int?     @unique         // present for imported stubs
  ownerUserId   String?  @unique         // null = UNCLAIMED stub
  owner         User?    @relation(fields: [ownerUserId], references: [id])
  credits       Credit[]
  posts         Post[]
  followers     Follow[] @relation("following")
  searchVector  Unsupported("tsvector")?
}

model Title {
  id           String   @id @default(cuid())
  tmdbId       Int      @unique
  mediaType    String   // "movie" | "tv"
  name         String
  year         Int?
  overview     String?
  posterUrl    String?
  credits      Credit[]
  searchVector Unsupported("tsvector")?
}

model Credit {
  id         String  @id @default(cuid())
  profileId  String
  titleId    String
  kind       String  // "CAST" | "CREW"
  character  String? // for CAST
  department String? // for CREW
  job        String? // for CREW
  order      Int?
  profile    ProfessionalProfile @relation(fields: [profileId], references: [id])
  title      Title               @relation(fields: [titleId], references: [id])
  @@unique([profileId, titleId, kind, job, character])
}

model Follow {
  id               String @id @default(cuid())
  followerUserId   String
  followingProfileId String
  createdAt        DateTime @default(now())
  follower         User                @relation("follower",  fields: [followerUserId],   references: [id])
  following        ProfessionalProfile @relation("following", fields: [followingProfileId], references: [id])
  @@unique([followerUserId, followingProfileId])
}

model Post {
  id        String   @id @default(cuid())
  authorId  String   // ProfessionalProfile
  body      String
  titleId   String?  // optional context (e.g. a wrap announcement)
  creditId  String?
  createdAt DateTime @default(now())
  author    ProfessionalProfile @relation(fields: [authorId], references: [id])
  likes     PostLike[]
}

model PostLike {
  id     String @id @default(cuid())
  userId String
  postId String
  user   User @relation(fields: [userId], references: [id])
  post   Post @relation(fields: [postId], references: [id])
  @@unique([userId, postId])
}
```

**Key semantics**
- A **Profile** is an **unclaimed stub** (`ownerUserId == null`) when imported from TMDB.
- **Claim** = set `ownerUserId` on a profile, binding it to the signed-in user.
- **Worked-with** is *derived*, not stored: two profiles are "worked-with" if they share a `Title`
  via `Credit`. (Materialize later if needed for performance.)

---

## 3. TMDB Integration

- Typed TMDB client (movie/tv details, credits, person, search, trending).
- **Import script** maps TMDB → our DB: `Title`, `ProfessionalProfile` **stubs**, and `Credit` rows.
  We import into our **own** database (we own the graph; we are **not** a live proxy).
- Show **TMDB attribution** ("This product uses the TMDB API but is not endorsed or certified by TMDB.").
- **Never** read or scrape IMDb.

---

## 4. Build Phases (each ends in a runnable state)

### P1 — Scaffold & infra
- `create-next-app` into `~/filmin/`; TypeScript, App Router, Tailwind.
- Prisma + Postgres (Neon default; local `postgresql@16` alt); shadcn/ui, Zod, Auth.js.
- `.env` + `.env.example`; initial schema + first migration; base layout + nav.

### P2 — Catalog (Pillar A)
- TMDB client + import script; **title page** (poster, year, synopsis, cast/crew linked to profiles);
  **title search**; home **trending** rows; TMDB attribution in footer.

### P3 — Profiles & the wedge (Pillar B)
- **Person page**; signup/login (Auth.js); **claim** flow ("This is me"); profile edit
  (bio, roles, location, links); **free headshot/photo upload** via the storage abstraction.

### P4 — Social (Pillar C)
- Follow / unfollow; create **post**; **like**.
- **Personalized network feed on Home** (`/`): for signed-in users the home page *is* the feed
  (there is no separate `/feed` route — `/feed` 301-redirects to `/`). It interleaves posts and
  worked-with activity from the viewer's network, with a profile rail, post composer,
  "people you may know" suggestions, and a trending rail. Signed-out `/` stays the marketing landing.
- **Discover** (`/search`): a real browse surface — role chips, trending, new releases, and
  people to follow — that also serves name search (`?q=`) and role filtering (`?role=`).

### P5 — Seed, polish, verify
- Seed a curated set of TMDB titles; empty/loading/error states; Vitest + Playwright; README.

---

## 4a. Social Graph & Feed Ranking

The "worked-with" graph (shared-credit edges) is the social spine; the Home feed is built on top of it.

**Degree model** (`lib/network.ts`)
- **Degree 1** — the viewer's direct network: everyone they **Follow** ∪ everyone they've
  **worked with** (co-credited on a shared `Title`).
- **Degree 2** — friends-of-friends: profiles that the viewer's degree-1 connections follow,
  excluding degree 1.
- **Degree 3** — soft "people you may know" **suggestions only** (co-credits with the degree-1
  network, ranked by shared-credit count); never injected into the post stream.
- Caps keep graph derivation bounded: `WORKED_WITH_CAP = 500`, `DEGREE2_FOLLOW_CAP = 1000`,
  `SUGGESTION_SCAN_CAP = 2000`.

**Feed ranking** (`lib/feed.ts`) — a deliberately simple, transparent formula:
```
score = recency × proximity × type
```
- **Recency** — exponential decay with a **3-day half-life**: `recencyScore = 0.5 ^ (ageDays / 3)`.
- **Proximity** — degree-1 = `1.0`, degree-2 = `0.5`.
- **Type** — posts = `1.0`, worked-with activity = `0.7`.
- **Posts** come from degree-1 and degree-2 authors; **activity** items (e.g. "N people in your
  network are credited on *Title*") come from degree-1 only. Since `Credit` has no timestamp,
  activity recency uses the parent `Title.createdAt` as a proxy.
- **Cold start** — when the viewer's degree-1 network is small (`< 5` profiles), the feed surfaces
  an onboarding banner with claim/follow CTAs instead of feeling empty.

---

## 5. Prerequisites From User
- Free **TMDB API key** → `TMDB_API_KEY`.
- Postgres connection string (**Neon** recommended) → `DATABASE_URL`.
- Later: **Cloudinary** creds (prod images), **Vercel** project (deploy).

---

## 6. Verification

**Docs**
- Product spec PDF renders cleanly (A1–A13, persona cards, relationship diagram, differentiators table). ✔
- This Technical-Spec.md present in repo. ✔

**MVP (after build phases)** — runnable locally, demonstrating:
1. Signed-out Home shows the marketing landing + trending; **Discover** (`/search`) browses by role,
   trending, new releases, and people to follow.
2. Search a film → title page with cast/crew linked to profiles.
3. Sign up → **claim** a page → edit → **upload a headshot** that persists/renders *(Scenario S1)*.
4. Second user follows first → first posts → appears on the follower's **Home feed** + **like**
   *(Scenario S4)*; degree-2 posts show an "extended network" badge; "people you may know" suggests
   degree-3 collaborators.
5. Playwright smoke covers search → title → claim → upload → follow → Home feed.
6. Vitest covers TMDB-mapping + credit-derivation utilities.
7. TMDB attribution visible; **no IMDb scraping anywhere**.
