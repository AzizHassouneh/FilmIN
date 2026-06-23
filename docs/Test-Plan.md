# FilmIN — Test Plan & Scenario Checklist

*A friendly, non-technical guide for hands-on testing. Work through it top to bottom,
tick the boxes, and jot what felt good or broken in the **Notes** lines.*

---

## 0. Read me first (2 minutes)

**What FilmIN is:** a free home for film & TV professionals — part IMDb (a catalog of
titles and who worked on them), part LinkedIn (your own page, a feed, following). The whole
thing is free, forever.

**How to open it:** the app currently runs **only on Aziz's computer** at
`http://localhost:3000` (the development version). It is **not on the internet yet**, so:
- Aziz can test it directly in his browser.
- A partner testing remotely will need either a **screen-share** with Aziz, or we wait
  until we **deploy it online** (on the roadmap). You can still **read this whole doc** and
  review the scenarios / give design feedback without the app in front of you.

**Test accounts** (already created — password is the same for both):

| Email | Password | Notes |
|---|---|---|
| `alice@filmin.test` | `password123` | A general test user |
| `bob@filmin.test` | `password123` | A second user, handy for "two people" tests |

You can also just **Join free** and make your own account anytime.

**The catalog right now:** ~800 real movies & TV shows from 2025–2026 (the most popular
ones), plus ~24,000 people and ~31,000 credits, all imported legally from TMDB.

---

## How to read the status labels

| Label | Meaning | What to do |
|---|---|---|
| ✅ **Ready** | Built and working now | **Test it now** and give feedback |
| ⚠️ **Gap** | Should work but something's missing/rough | Test it, expect a rough edge — note it |
| 🔜 **Later** | Planned, not built yet | **Don't test** — just so you know it's coming |

For each scenario:
- **Who:** the type of person doing it (the persona)
- **Goal / Steps / Expect:** what they want, how to do it, what should happen
- **☐ Result:** tick if it worked
- **Notes:** write how it felt, anything confusing, ideas

---

## Quick summary — what to test NOW vs LATER

### ✅ Test now (the built MVP)
1. Sign up, sign in, **sign out**
2. **Discover** page — browse people by role, plus trending, new releases & people to follow
3. Search for a movie or TV show → open its page → see cast & crew
4. Search for a person → open their page → see their filmography
5. Claim your own page ("This is me")
6. Edit your page (name, roles, location, bio, reel/website/Instagram links)
7. **Upload a headshot for free** (the headline feature)
8. Toggle "Open to work" and see the amber badge
9. Follow / unfollow someone
10. Write a post from your **Home** feed; see it appear
11. See posts from your network (people you follow + people you've worked with) on Home; like / unlike
12. See **extended-network** posts (friends-of-friends) and **"People you may know"** suggestions
13. The **cold-start** onboarding banner when your network is still small

### 🔜 Test later (not built yet)
- "Worked-with" collaborator list on a profile page (the graph already powers the feed & suggestions,
  but a profile page doesn't yet show a dedicated "people they've worked with" section)
- Adding your own student/indie titles & credits
- Requesting a correction to a wrong credit
- People search **filters** (by role, location, skill)
- Shortlists, and contacting / messaging people
- Mutual connections, endorsements, comments on posts
- Watchlists, ratings, reviews (the fan layer)
- Critic pages & published reviews
- Notifications, verification badges, reporting/moderation
- Ads

---

## The personas (cast of characters)

So everyone uses the same names while testing:

**Creators (the pros):** Maya (aspiring actor) · Sam (cinematographer/DP) · Lia
(choreographer) · Dev (screenwriter) · Noor (director) · Alex (producer) · Theo (film
student) · Priya (costume designer).

**Industry enablers:** Carmen (casting director) · Jordan (agent/manager) · Studio
(production company) · Festival (festival programmer).

**Audience:** Joe (general fan) · Quinn (cinephile) · Rae (film critic).

**Future:** Brandr (advertiser).

The table at the very end maps each persona to the scenarios that matter most to them.

---

# Section A — Account & Access

### A1 ✅ Join free (sign up)
- **Who:** anyone (e.g. Maya the aspiring actor)
- **Goal:** create an account.
- **Steps:** Click **Join free** (top right) → enter name, email, password → submit.
- **Expect:** you're signed in and land on the home page — which is now your **personalized network
  feed** — and the top bar shows **Home**, **Discover**, **Me**, and **Sign out**.
- ☐ Result
- **Notes:** ______________________________________________

### A2 ✅ Sign in (existing account)
- **Who:** a returning user (use `alice@filmin.test` / `password123`)
- **Goal:** log back in.
- **Steps:** Click **Sign in** → enter email + password → submit.
- **Expect:** signed in, back on the home page.
- ☐ Result
- **Notes:** ______________________________________________

### A3 ⚠️ Wrong password / bad email
- **Who:** anyone fumbling their login
- **Goal:** see a clear, friendly error.
- **Steps:** On **Sign in**, type a wrong password → submit. Try an email that isn't registered.
- **Expect:** a readable error message, not a crash or a blank page.
- ☐ Result
- **Notes (does the message make sense to a non-technical person?):** ____________________

### A4 ✅ Sign out
- **Who:** anyone done with a session (important on a shared computer)
- **Goal:** log out.
- **Steps:** Click **Sign out** in the top bar.
- **Expect:** you're signed out and the top bar returns to **Sign in** / **Join free**.
- ☐ Result
- **Notes:** ______________________________________________

### A5 🔜 Forgot password / password reset
- **Who:** anyone locked out
- **Status:** Not built yet. Listed so you know it's coming.

---

# Section B — Catalog & Discovery (the fan experience)

### B1 ✅ Home page & trending (Joe, the fan)
- **Who:** Joe, general fan
- **Goal:** see something to explore on arrival.
- **Steps:** Go to the home page **while signed out**.
- **Expect:** a welcome/hero area and a **"Trending now"** row of recent movie/TV posters.
  *(Once you're signed in, Home becomes your personalized network feed instead — see Section D.)*
- ☐ Result
- **Notes (does it feel inviting? posters loading?):** ______________________________________

### B1b ✅ Discover — browse landing (Joe / Quinn / Carmen)
- **Who:** anyone exploring without a specific search in mind
- **Goal:** have somewhere to browse, not just a blank search box.
- **Steps:** Click **Discover** in the top bar (don't type a search).
- **Expect:** a browse page with **role chips** (Actors, Directors, Writers, Producers,
  Cinematographers, Editors, Composers, Choreographers), plus **Trending titles**, **New releases**,
  and **People to follow**. Clicking a role chip lists people in that role.
- ☐ Result
- **Notes (is it a useful starting point? right rows?):** ___________________________________

### B2 ✅ Search for a title (Joe — "who was in that?")
- **Who:** Joe
- **Goal:** find a specific film/show.
- **Steps:** Click **Search** → type a 2025–2026 title (e.g. *Captain America: Brave New World*,
  *Thunderbolts*, *Elio*, *Fantastic 4: First Steps*) → look at results.
- **Expect:** matching titles appear under a **Titles** heading.
- ☐ Result
- **Notes:** ______________________________________________

### B3 ✅ Open a title page & see cast/crew (Joe → Quinn)
- **Who:** Joe / Quinn
- **Goal:** see who worked on a title and jump to a person.
- **Steps:** Click a title from search → on the title page, read the poster, year, summary →
  scroll to **Cast** and **Crew** → click a person's name.
- **Expect:** title details show; cast & crew are listed and **clickable**, taking you to that
  person's page.
- ☐ Result
- **Notes:** ______________________________________________

### B4 ✅ Search for a person (Carmen scouting, or any fan)
- **Who:** Carmen (casting) or a fan
- **Goal:** find a specific person by name.
- **Steps:** **Search** → type a person's name → look under the **People** heading.
- **Expect:** matching people appear, each showing their top role; clicking opens their page.
- ☐ Result
- **Notes:** ______________________________________________

### B5 ✅ Empty / no-results search
- **Who:** anyone
- **Goal:** graceful "nothing found".
- **Steps:** Search something nonsense like `zzzzzqqq`.
- **Expect:** a clear "no results" message, not an error.
- ☐ Result
- **Notes:** ______________________________________________

### B6 ✅ TMDB attribution (legal requirement)
- **Who:** anyone (compliance check)
- **Goal:** confirm we credit our data source.
- **Steps:** Look at the page footer.
- **Expect:** a line crediting **TMDB** ("uses the TMDB API but is not endorsed by TMDB").
- ☐ Result
- **Notes:** ______________________________________________

### B7 🔜 Filter/sort the catalog (by year, genre, popularity)
- **Status:** Not built. Search is name-based only for now.

---

# Section C — Professional Identity (the wedge — the IMDbPro killer)

### C1 ✅ Claim your page (Maya / Sam / any pro) — *Scenario S1*
- **Who:** Maya, aspiring actor (or use any unclaimed person)
- **Goal:** take ownership of your own page.
- **Steps:** Search a person who isn't claimed → on their page you'll see an **"Unclaimed"**
  badge and **"Claim this page — free"** → (sign in if needed) → click it.
- **Expect:** the page becomes yours; you now see an **Edit your page** link.
- ☐ Result
- **Notes (was the "this is me" moment obvious & satisfying?):** ___________________________

### C2 ✅ Edit your page (Maya / Dev / Noor)
- **Who:** any claimed pro
- **Goal:** fill in your professional details.
- **Steps:** On your page click **Edit** → set **Display name**, **Roles** (comma-separated,
  e.g. "Actor, Choreographer"), **Location**, **Bio**, and link fields (**Reel URL**,
  **Website**, **Instagram**) → save.
- **Expect:** changes save and show on your public page.
- ☐ Result
- **Notes:** ______________________________________________

### C3 ✅ Upload a headshot — FREE (Maya) — *the headline feature*
- **Who:** Maya (this is the thing IMDbPro charges for)
- **Goal:** add a profile photo at no cost.
- **Steps:** On the edit page, use **Upload a headshot** → pick a JPEG/PNG/WebP under 5 MB.
- **Expect:** the photo uploads and shows as your headshot — no payment, no paywall, ever.
- ☐ Result
- **Notes (speed? does it render crisply? any size/format errors?):** ______________________

### C4 ⚠️ Headshot — wrong file type / too big
- **Who:** Maya, picking a bad file
- **Goal:** a clear, friendly limit message.
- **Steps:** Try uploading a PDF, or an image larger than 5 MB.
- **Expect:** a readable error explaining allowed types & size.
- ☐ Result
- **Notes:** ______________________________________________

### C5 ✅ "Open to work" status (Sam, signaling availability)
- **Who:** Sam the DP between jobs
- **Goal:** tell the world you're available.
- **Steps:** On the edit page, tick **Open to work** → save → view your page.
- **Expect:** an amber **"Open to work"** badge appears on your page.
- ☐ Result
- **Notes:** ______________________________________________

### C6 ✅ Your filmography shows on your page (Sam, Noor)
- **Who:** any claimed pro with credits
- **Goal:** see your credits listed.
- **Steps:** On a person's page, scroll to **Filmography**.
- **Expect:** their titles are listed (newest first), each linking to the title page.
- ☐ Result
- **Notes:** ______________________________________________

### C7 ✅ "Me" shortcut
- **Who:** any signed-in user
- **Goal:** jump to your own page fast.
- **Steps:** Click **Me** in the top bar.
- **Expect:** if you've claimed a page, it opens it; if not, it nudges you to search & claim one.
- ☐ Result
- **Notes:** ______________________________________________

### C8 🔜 Skills/tags, reel video gallery, multiple photos
- **Status:** Not built. Today there's a single headshot + link fields (reel is a link, not an
  embedded player).

### C9 🔜 Build a profile from zero — add your own student/indie titles (Theo) — *Scenario S3*
- **Who:** Theo, film student with no IMDb credits
- **Status:** Not built. You can claim/edit an existing imported page, but you can't yet
  **create brand-new titles or add your own credits** from scratch.

### C10 🔜 Request a credit correction (Priya) — *Scenario S6*
- **Who:** Priya, costume designer with a wrong/missing credit
- **Status:** Not built.

---

# Section D — Networking & Feed (the social spine)

### D1 ✅ Follow someone (Quinn → talent; or any user)
- **Who:** Quinn the cinephile (or Joe)
- **Goal:** follow a person you like.
- **Steps:** Open someone else's **claimed** page → click **Follow**.
- **Expect:** the button switches to **Following/Unfollow**, and the follower count goes up.
- **Note:** you can't follow your own page, and Follow only appears on *claimed* pages.
- ☐ Result
- **Notes:** ______________________________________________

### D2 ✅ Unfollow
- **Who:** same as above
- **Steps:** On a page you follow, click **Following/Unfollow**.
- **Expect:** you stop following; count goes down.
- ☐ Result
- **Notes:** ______________________________________________

### D3 ✅ Write a post (Sam announces a wrap) — *part of Scenario S4*
- **Who:** Sam (or any claimed pro)
- **Goal:** share an update.
- **Steps:** Go to **Home** → use the composer at the top ("Share an update…") → type something → **Post**.
- **Expect:** your post appears in the Home feed.
- ☐ Result
- **Notes:** ______________________________________________

### D4 ✅ See your network's posts on Home (Noor follows Sam) — *Scenario S4*
- **Who:** Noor, following Sam
- **Goal:** your Home feed shows people you follow **and** people you've worked with.
- **Steps:** As one user, follow a second user. As that second user, post something. Back as the
  first user, open **Home**. *(Use the two test accounts and the **Sign out** button — A4 — to switch,
  or two browser windows.)*
- **Expect:** the followed person's post shows up in your Home feed. Newer and closer posts rank higher.
- ☐ Result
- **Notes:** ______________________________________________

### D5 ✅ Like / unlike a post
- **Who:** anyone reading the feed
- **Steps:** Click the heart on a post; click again to undo.
- **Expect:** the heart fills/empties and the count changes.
- ☐ Result
- **Notes:** ______________________________________________

### D5b ✅ Extended-network posts (friends-of-friends)
- **Who:** anyone with a few connections
- **Goal:** the feed reaches one hop beyond your direct network.
- **Steps:** On **Home**, look for posts tagged **"In your extended network."**
- **Expect:** occasional posts from people your connections follow (degree 2), labelled as extended
  network and ranked a bit lower than direct-network posts.
- ☐ Result
- **Notes:** ______________________________________________

### D5c ✅ "People you may know" suggestions
- **Who:** anyone building out their network
- **Goal:** discover collaborators to follow.
- **Steps:** On **Home**, check the right-hand **"People you may know"** rail.
- **Expect:** suggested people (based on who you've worked with), each showing a top role and how
  many credits you share, with a **Follow** button on claimed pages.
- ☐ Result
- **Notes:** ______________________________________________

### D5d ✅ Cold-start onboarding (brand-new user)
- **Who:** someone who just signed up with no network yet
- **Goal:** Home shouldn't feel empty on day one.
- **Steps:** Sign up fresh (or use an account that follows no one) and open **Home**.
- **Expect:** a friendly onboarding banner ("Let's build your network") with CTAs to claim your page
  and find collaborators, instead of a blank feed.
- ☐ Result
- **Notes:** ______________________________________________

### D6 🔜 Comment on a post
- **Status:** Not built (likes only, no comments yet).

### D7 🔜 Posts attached to a specific title/credit
- **Status:** Not built. Posts are plain text for now (can't tag "this is about *Film X*").

### D8 ⚠️ "Worked-with" collaborator graph
- **Who:** Alex assembling a crew (S7), or Quinn exploring (S9)
- **Status:** The worked-with graph (shared credits) is **live** and now powers your Home feed and
  the "People you may know" suggestions (D4, D5c). What's still missing is a **dedicated section on a
  person's page** that lists "people they've worked with" — that view is not built yet.

### D9 🔜 Mutual connections & endorsements
- **Status:** Not built. Following is one-way only today.

---

# Section E — Hiring & Discovery (mostly future)

### E1 🔜 Search people by role / location / skill (Carmen) — *Scenario S2*
- **Who:** Carmen casting "Choreographer, LA, musical theatre"
- **Status:** Not built. Search matches names only — no role/location/skill **filters** yet.

### E2 🔜 Shortlists / saved talent (Carmen, Alex)
- **Status:** Not built.

### E3 🔜 Contact / message a person (Carmen → Lia) — *Scenario S2*
- **Status:** Not built. (When built, it will be **free** — never paywalled.)

### E4 🔜 Manage a roster of clients (Jordan the agent)
- **Status:** Not built.

### E5 🔜 Company / production-company pages (Studio)
- **Status:** Not built.

### E6 🔜 Festival discovery & partnership surfaces (Festival)
- **Status:** Not built.

---

# Section F — Fan engagement (mostly future)

### F1 ✅ Follow your favorite talent (Joe, Quinn)
- Covered by **D1** — this works today.

### F2 🔜 Watchlist (save titles to watch)
- **Status:** Not built.

### F3 🔜 Ratings & reviews (Quinn)
- **Status:** Not built.

---

# Section G — Critic & Editorial (future)

### G1 🔜 Critic page & published reviews (Rae) — *Scenario S8*
- **Status:** Not built.

---

# Section H — Trust, Safety, Notifications, Ads (future)

### H1 🔜 Notifications (new follower, like, etc.)
- **Status:** Not built.

### H2 🔜 Verification badges (verified pro / claimed)
- **Status:** Not built. (There is an "Unclaimed" badge today, but no verified-identity check.)

### H3 🔜 Reporting / moderation
- **Status:** Not built.

### H4 🔜 Ads (Brandr the advertiser)
- **Status:** Not built — and by design, ads will **never** paywall a pro's own page.

---

# Persona → scenarios map (so each tester knows their lane)

| Persona | Test these now (✅) | Coming later (🔜) |
|---|---|---|
| **Maya** — aspiring actor | A1, C1, C2, **C3 (free headshot)**, C5 | C8, C9 |
| **Sam** — cinematographer/DP | C1, C5, C6, D3, D4, D5 | D8, D9, C8 |
| **Lia** — choreographer | C1, C2, C5 | E1, E3 (be discovered/contacted) |
| **Dev** — screenwriter | C1, C2, C6 | C9, D9 |
| **Noor** — director | A2, D1, D4, D5 | D8, E1 |
| **Alex** — producer | B4, D1 | D8, E1, E2 |
| **Theo** — film student | A1, C1, C2 | **C9 (add own titles)**, D9 |
| **Priya** — costume designer | C1, C2, C6 | **C10 (fix credit)** |
| **Carmen** — casting director | B4 | **E1, E2, E3** |
| **Jordan** — agent | B4 | E4 |
| **Studio** — production co. | B2, B4 | E5 |
| **Festival** — programmer | B2, B4 | E6 |
| **Joe** — general fan | B1, B2, B3, D1 | F2 |
| **Quinn** — cinephile | B3, D1, D5 | D8, F2, F3 |
| **Rae** — film critic | B2, B3 | G1 |
| **Brandr** — advertiser | — | H4 |

---

# Overall feedback (fill in after testing)

- **First impression (does it feel like a real product?):** ____________________________
- **The headshot upload (the headline feature) — how did it feel?:** __________________
- **Most confusing moment:** ____________________________________________________
- **Most missed feature (what did you reach for that wasn't there?):** _________________
- **Anything broken / errors / blank pages?:** ___________________________________
- **Would a working film professional use this? Why / why not?:** ___________________

---

*Catalog data from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is
not endorsed or certified by TMDB. FilmIN never scrapes IMDb.*
