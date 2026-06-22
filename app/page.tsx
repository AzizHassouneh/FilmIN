import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { PosterCard } from "@/components/poster-card";

async function getTrendingTitles() {
  try {
    return await prisma.title.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    });
  } catch {
    // Catalog not seeded yet (no DB / empty) — degrade to just the hero.
    return [];
  }
}

export default async function Home() {
  const trending = await getTrendingTitles();
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center gap-6 py-24 text-center">
        <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Free forever · funded by ads, never by paywalls
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          The professional home for everyone who makes film
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          One trustworthy catalog of titles and credits, fused with a real professional
          network — owned profiles, a film-native feed, and free discovery. Everything
          IMDbPro charges for, given away.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            Claim your page — free
          </Link>
          <Link href="/search" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Explore the catalog
          </Link>
        </div>
      </section>

      {trending.length > 0 ? (
        <section className="pb-20">
          <h2 className="mb-4 text-lg font-semibold">Trending now</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {trending.map((t) => (
              <PosterCard
                key={t.id}
                href={`/title/${t.id}`}
                name={t.name}
                year={t.year}
                posterUrl={t.posterUrl}
                mediaType={t.mediaType}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
