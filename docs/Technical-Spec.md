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
| Framework | **Next.js 15** (App Router, TypeScript, React Server Components) | Server-first; SEO for fan traffic (SUBSET ONE). |
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
- Follow / unfollow; **activity feed**; create **post**; **like**.

### P5 — Seed, polish, verify
- Seed a curated set of TMDB titles; empty/loading/error states; Vitest + Playwright; README.

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
1. Home shows trending titles.
2. Search a film → title page with cast/crew linked to profiles.
3. Sign up → **claim** a page → edit → **upload a headshot** that persists/renders *(Scenario S1)*.
4. Second user follows first → first posts → appears in follower **feed** + **like** *(Scenario S4)*.
5. Playwright smoke covers search → title → claim → upload → follow → feed.
6. Vitest covers TMDB-mapping + credit-derivation utilities.
7. TMDB attribution visible; **no IMDb scraping anywhere**.
