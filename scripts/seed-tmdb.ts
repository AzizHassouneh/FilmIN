/**
 * TMDB backfill seed. Imports the most popular movies + TV titles for the given
 * year(s) into our own DB via the catalog importer (Title + cast/crew stubs +
 * Credits). Requires a real TMDB_API_KEY in .env. Idempotent and re-runnable.
 *
 * Usage:
 *   npm run db:seed:tmdb                       # defaults: --year 2025,2026 --pages 10
 *   npm run db:seed:tmdb -- --year 2025,2026 --pages 20
 *
 * Each page is 20 titles per (mediaType × year). --pages 10 ≈ up to 800 titles.
 * Catalog data is from TMDB (legal source, attributed in-app) — IMDb is never scraped.
 */
import "dotenv/config";
import { importTitle } from "@/lib/catalog";
import { discoverMovies, discoverTv, type TmdbMediaType } from "@/lib/tmdb";
import { prisma } from "@/lib/db";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const years = (arg("year") ?? "2025,2026")
    .split(",")
    .map((y) => Number.parseInt(y.trim(), 10))
    .filter((y) => Number.isFinite(y));
  const pages = Math.max(1, Number.parseInt(arg("pages") ?? "10", 10) || 10);

  console.log(`Seeding TMDB titles for years ${years.join(", ")} — ${pages} page(s) per media/year.`);

  // 1) Discover phase: collect unique (id, mediaType) across years and pages.
  const wanted = new Map<string, { id: number; mediaType: TmdbMediaType }>();
  for (const year of years) {
    for (const mediaType of ["movie", "tv"] as const) {
      for (let page = 1; page <= pages; page++) {
        const res =
          mediaType === "movie"
            ? await discoverMovies(year, page)
            : await discoverTv(year, page);
        for (const r of res.results) {
          wanted.set(`${mediaType}:${r.id}`, { id: r.id, mediaType });
        }
        if (page >= (res.total_pages ?? page)) break; // no more pages for this year
        await sleep(120); // be polite to TMDB
      }
    }
  }

  const all = [...wanted.values()];
  console.log(`Discovered ${all.length} unique titles. Importing…`);

  // 2) Import phase: pull full details + cast/crew for each title.
  let ok = 0;
  let failed = 0;
  for (let i = 0; i < all.length; i++) {
    const { id, mediaType } = all[i];
    try {
      await importTitle(id, mediaType);
      ok++;
    } catch (err) {
      failed++;
      console.warn(`  ! ${mediaType}/${id} failed: ${(err as Error).message}`);
    }
    if ((i + 1) % 25 === 0 || i + 1 === all.length) {
      console.log(`  …${i + 1}/${all.length} (ok ${ok}, failed ${failed})`);
    }
    await sleep(120);
  }

  console.log(`Done. Imported ${ok} titles, ${failed} failed.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
