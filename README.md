# FilmIN

**FilmIN** = IMDb's open film/TV catalog fused with a LinkedIn-style professional network, purpose-built
for the film industry — for actors, cinematographers, choreographers, writers, directors, producers, and
every below-the-line role.

> **Free forever. Funded by ads, not paywalls.** FilmIN deliberately surpasses everything IMDbPro
> paywalls ($150/yr) at **$0** to users. There is no subscription or paywall — ever — on a
> professional's own page.

## Status

📄 **Docs-first.** The product and technical specs are complete; the MVP build is pending review.

- [`docs/FilmIN-Product-Spec.pdf`](docs/FilmIN-Product-Spec.pdf) — Product Requirements & Scenarios Spec
  (vision, personas, the FilmIN graph, end-to-end scenarios, differentiators).
- [`docs/Technical-Spec.md`](docs/Technical-Spec.md) — stack, data model, TMDB integration, build phases.
- [`docs/generate_spec_pdf.py`](docs/generate_spec_pdf.py) — regenerates the product spec PDF (reportlab).

## Planned stack

Next.js 15 (App Router, TypeScript, RSC) · PostgreSQL + Prisma · Auth.js (NextAuth v5) ·
Tailwind + shadcn/ui · Zod · **TMDB API** for catalog data (no IMDb scraping) · Cloudinary (prod images) ·
Vitest + Playwright · deployed on Vercel + Neon.

## Legal

Catalog data comes from the **TMDB API**. This product uses the TMDB API but is not endorsed or certified
by TMDB. No IMDb data is used or scraped.
