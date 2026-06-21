# FilmIN — UX / Design Concept

> Companion to **FilmIN — Product Requirements & Scenarios Spec** (`FilmIN-Product-Spec.pdf`) and
> **Technical Implementation Spec** (`Technical-Spec.md`).
> This document covers the *feel*: the design thesis, the signature screens, the information
> architecture, and the visual language that blends IMDb and LinkedIn into one experience.
>
> It introduces **no new product surfaces** beyond the approved plan. Claimed-vs-stub states are
> driven by the existing `ProfessionalProfile.ownerUserId` (null = unclaimed stub); "worked with" is
> the derived shared-title link already specced. There is **no payment / paywall / subscription** UI.

---

## 1. The core tension

IMDb is a **reference** — you look something up and leave. LinkedIn is a **network** — you maintain a
presence and return. FilmIN must be **both at once**, because our three segments pull in opposite
directions:

- **SUBSET ONE — fans (~90%)** want IMDb's fast, credible lookup.
- **SUBSET TWO — the wedge (~9%)** and **SUBSET THREE — pros (<1%)** want LinkedIn's owned identity
  and return-habit.

The central design problem: **one surface must serve a fan doing a 10-second lookup *and* a DP
curating a career** — without feeling like two bolted-together apps.

## 2. What each parent does best (and where it fails)

| | Wins on | Fails on |
|---|---|---|
| **IMDb** | Canonical title page; deep credits graph (everyone is a node); poster-forward visuals | Clutter; dated UX; no owned identity (your page isn't *yours*); no reason to return; paywalled pro tools |
| **LinkedIn** | The profile *is* the product (owned, curated); the feed drives a daily habit; social-proof mechanics ("open to work", endorsements); discovery/hiring loop | Generic, not film-literate (a credit isn't a "job"); noisy feed; visually flat — wrong for a visual industry |

## 3. The five fusion ideas

1. **The profile as a "living filmography," not a résumé.** Not LinkedIn's reverse-chron job list,
   not IMDb's static credits table — a poster-driven career page with the reel and an "open to work"
   status up top. This is the single most concept-defining screen.
2. **The title page as a collaboration hub.** IMDb's title page, but every name is a live profile node,
   and it surfaces "people you follow worked on this." A reference page that doubles as a networking
   entry point.
3. **The "worked-with" graph as the social spine.** LinkedIn connections are arbitrary and
   self-asserted. Ours are *derived from real shared credits* — automatically true and film-literate.
   Collaboration history becomes the trust signal.
4. **A film-native feed.** Not text hot-takes — posts anchored to titles, credits, and roles
   ("Wrapped as DP on *Northbound*", "Open to work, Q3 narrative features"), festival selections,
   casting calls. The return-habit hook, with industry signal-to-noise.
5. **Free casting / crew discovery.** LinkedIn Recruiter for film, searchable against real credits +
   availability — the thing IMDbPro gates, given away.

## 4. Design language

- **Cinematic and dark-first.** Film people live in color-grading suites; a dark, image-forward
  canvas is native to them. (Light mode supported; dark is the default mood.)
- **Poster- and image-forward.** Film is a visual medium — headshots, posters, stills, and reels do
  the talking, with editorial whitespace. The deliberate opposite of IMDb's clutter.
- **Navy + amber palette.** Amber reads as warm projector light and is the signal color for "open to
  work / available." This is the anti-LinkedIn (corporate blue) and anti-IMDb (yellow/ad-noise) choice.
- **Two weights, sentence case, generous spacing.** Calm and credible, not busy.

## 5. Signature screens

### 5.1 Profile — the "living filmography" (the hero screen)
- **Hero:** headshot + reel button on the left; name (with a claimed/verified check), role line,
  location, and an amber **"Open to work"** pill on the right; `Follow` (amber) + `Message` actions.
- **Identity strip:** Followers · Credits · Worked-with as metric cards.
- **Filmography:** a **poster wall**, filterable (All · Film · TV · Lead · year), each poster linking
  to the canonical title page and labeled with the person's role/character. This is the fusion made
  visible: IMDb's credits data, presented as LinkedIn-grade owned identity.
- **Right rail:** "Worked with" (avatars + shared-title counts, derived) and external links (reel,
  site, socials).
- **Activity:** a film-native post card anchored to a title.

A mockup of this screen was produced in-session and should be the visual reference for build.

### 5.2 Title page — the collaboration hub
Poster + synopsis at top, then the full cast/crew as a grid of profile chips — **claimed** ones rich
and linkable, **unclaimed** TMDB stubs greyed with a "Claim this page" affordance. A banner surfaces
"N people you follow worked on this," turning a reference page into a networking entry point.

### 5.3 Home / feed
A single column of film-native post cards from people you follow, interleaved with trending title rows
for fans. The surface adapts to whether the viewer has claimed a profile (pro mode) or not (fan mode).

### 5.4 Discover — free casting / crew search
A filter rail (role · location · skills · "open to work") run against real credits; results as
headshot cards with "worked-with in common" badges. The IMDbPro-killer for casting directors and
producers (personas Carmen, Alex).

### 5.5 Claim flow
A fan searches, lands on an **unclaimed stub**, hits **"This is me"** → the page visibly transforms
from grey stub to an owned, amber-accented profile. The emotional core of Scenario S1 (the free
headshot).

## 6. Information architecture

- **Top bar:** wordmark · unified search (titles + people + roles) · Home · Discover · Notifications ·
  Me/avatar.
- **Two implicit modes, one app:**
  - **Fan mode** — search → title page → follow talent. Optimized for speed + SEO (SUBSET ONE growth).
  - **Pro mode** — your profile, the feed, discovery. Optimized for return-habit + hiring
    (SUBSETS TWO/THREE).
- The chrome adapts based on whether the signed-in user owns a profile, rather than splitting into
  separate products.

## 7. How this maps to the existing data model

| UX concept | Backed by |
|---|---|
| Claimed vs. unclaimed (grey stub) states | `ProfessionalProfile.ownerUserId` (null = stub) |
| Poster wall / filmography | `Credit` rows joined to `Title` |
| "Worked with" rail | derived shared-`Title` link (not stored) |
| Open-to-work pill | roadmap field on profile (◻ in plan §A6.D) |
| Film-native post + title chip | `Post.titleId` / `Post.creditId` context |
| Follow / feed | `Follow`, `Post`, `PostLike` |

No schema changes are required for the MVP rendering of these screens.
