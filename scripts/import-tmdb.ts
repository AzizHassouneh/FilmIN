// Seed the catalog from TMDB. Run: `npx tsx scripts/import-tmdb.ts`
// Imports the current trending movies + TV (and their cast/crew) into our DB.
// Idempotent — re-running refreshes titles and adds any new people/credits.
//
// Requires TMDB_API_KEY and DATABASE_URL in the environment (see .env.example).
import "dotenv/config";
import { importTitle } from "@/lib/catalog";
import { getTrending } from "@/lib/tmdb";
import { prisma } from "@/lib/db";

async function main() {
  const trending = await getTrending("week");
  const items = trending.results.filter(
    (r) => r.media_type === "movie" || r.media_type === "tv",
  );

  console.log(`Importing ${items.length} trending titles from TMDB…`);
  let ok = 0;
  for (const item of items) {
    const label = item.title ?? item.name ?? `#${item.id}`;
    try {
      await importTitle(item.id, item.media_type as "movie" | "tv");
      ok += 1;
      console.log(`  ✓ ${label}`);
    } catch (err) {
      console.error(`  ✗ ${label}:`, err instanceof Error ? err.message : err);
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
