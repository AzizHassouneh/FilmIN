import Link from "next/link";
import { prisma } from "@/lib/db";
import { PosterCard } from "@/components/poster-card";
import { PersonChip } from "@/components/person-chip";

// Roles we surface as quick browse filters (matched against profile.roles).
const BROWSE_ROLES = [
  "Actor",
  "Director",
  "Writer",
  "Producer",
  "Cinematographer",
  "Editor",
  "Composer",
  "Choreographer",
];

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const { q, role } = await searchParams;
  const query = q?.trim() ?? "";
  const roleFilter = role?.trim() ?? "";

  // Search or role-filter mode → results. Otherwise → the browse landing.
  if (query || roleFilter) {
    return <Results query={query} roleFilter={roleFilter} />;
  }
  return <BrowseLanding />;
}

async function Results({ query, roleFilter }: { query: string; roleFilter: string }) {
  const [titles, people] = await Promise.all([
    query
      ? prisma.title.findMany({
          where: { name: { contains: query, mode: "insensitive" } },
          orderBy: [{ year: "desc" }],
          take: 24,
        })
      : Promise.resolve([]),
    prisma.professionalProfile.findMany({
      where: {
        ...(query ? { displayName: { contains: query, mode: "insensitive" } } : {}),
        ...(roleFilter ? { roles: { has: roleFilter } } : {}),
      },
      orderBy: [{ displayName: "asc" }],
      take: 24,
    }),
  ]);

  const heading = query ? `Results for “${query}”` : `${roleFilter}s`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>

      {titles.length === 0 && people.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nothing in the catalog matches that yet.</p>
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

async function BrowseLanding() {
  const [trending, newReleases, peopleToFollow] = await Promise.all([
    prisma.title.findMany({ orderBy: [{ createdAt: "desc" }], take: 10 }),
    prisma.title.findMany({
      where: { year: { not: null } },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: 10,
    }),
    prisma.professionalProfile.findMany({
      where: { ownerUserId: { not: null } },
      orderBy: [{ updatedAt: "desc" }],
      take: 6,
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse the catalog and find the people who make film. Use the search bar above to look up
        any title, person, or role.
      </p>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Browse people by role</h2>
        <div className="flex flex-wrap gap-2">
          {BROWSE_ROLES.map((r) => (
            <Link
              key={r}
              href={`/search?role=${encodeURIComponent(r)}`}
              className="rounded-md border border-border px-3 py-1 text-sm transition-colors hover:border-primary/60"
            >
              {r}s
            </Link>
          ))}
        </div>
      </section>

      {trending.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Trending titles</h2>
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

      {newReleases.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">New releases</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {newReleases.map((t) => (
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

      {peopleToFollow.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">People to follow</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {peopleToFollow.map((p) => (
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
