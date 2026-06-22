import { prisma } from "@/lib/db";
import { PosterCard } from "@/components/poster-card";
import { PersonChip } from "@/components/person-chip";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [titles, people] = query
    ? await Promise.all([
        prisma.title.findMany({
          where: { name: { contains: query, mode: "insensitive" } },
          orderBy: [{ year: "desc" }],
          take: 24,
        }),
        prisma.professionalProfile.findMany({
          where: { displayName: { contains: query, mode: "insensitive" } },
          orderBy: [{ displayName: "asc" }],
          take: 24,
        }),
      ])
    : [[], []];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">
        {query ? `Results for “${query}”` : "Search"}
      </h1>

      {!query ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Search for a film, series, or a film professional.
        </p>
      ) : titles.length === 0 && people.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing in the catalog matches that yet.
        </p>
      ) : null}

      {titles.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Titles</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {titles.map((t) => (
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

      {people.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">People</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => (
              <PersonChip
                key={p.id}
                slug={p.slug}
                displayName={p.displayName}
                headshotUrl={p.headshotUrl}
                subtitle={p.roles[0]}
                claimed={Boolean(p.ownerUserId)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
