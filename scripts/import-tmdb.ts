// Seed the catalog from TMDB. Run: `npx tsx scripts/import-tmdb.ts`
// Imports a curated set of acclaimed titles plus the current trending
// movies + TV (and their cast/crew) into our DB, so the app has a rich,
// interconnected graph to demo (shared people → "worked-with").
// Idempotent — re-running refreshes titles and adds any new people/credits.
//
// Requires TMDB_API_KEY and DATABASE_URL in the environment (see .env.example).
import "dotenv/config";
import { importTitle } from "@/lib/catalog";
import { getTrending, type TmdbMediaType } from "@/lib/tmdb";
import { prisma } from "@/lib/db";

// Curated seed — recognizable, well-connected titles spanning film & TV.
// [tmdbId, mediaType, label] (label is for log output only).
const CURATED: Array<[number, TmdbMediaType, string]> = [
  [27205, "movie", "Inception"],
  [157336, "movie", "Interstellar"],
  [155, "movie", "The Dark Knight"],
  [496243, "movie", "Parasite"],
  [680, "movie", "Pulp Fiction"],
  [603, "movie", "The Matrix"],
  [13, "movie", "Forrest Gump"],
  [550, "movie", "Fight Club"],
  [1396, "tv", "Breaking Bad"],
  [1399, "tv", "Game of Thrones"],
  [66732, "tv", "Stranger Things"],
  [60059, "tv", "Better Call Saul"],
];

async function main() {
  // Curated titles first, then whatever is trending this week.
  const seen = new Set<string>();
  const items: Array<{ id: number; media_type: TmdbMediaType; label: string }> = [];

  for (const [id, media_type, label] of CURATED) {
    seen.add(`${media_type}:${id}`);
    items.push({ id, media_type, label });
  }

  const trending = await getTrending("week");
  for (const r of trending.results) {
    if (r.media_type !== "movie" && r.media_type !== "tv") continue;
    const key = `${r.media_type}:${r.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ id: r.id, media_type: r.media_type, label: r.title ?? r.name ?? `#${r.id}` });
  }

  console.log(`Importing ${items.length} titles from TMDB (curated + trending)…`);
  let ok = 0;
  for (const item of items) {
    try {
      await importTitle(item.id, item.media_type);
      ok += 1;
      console.log(`  ✓ ${item.label}`);
    } catch (err) {
      console.error(`  ✗ ${item.label}:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`Done. ${ok}/${items.length} titles imported.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
