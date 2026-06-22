import Image from "next/image";
import { notFound } from "next/navigation";
import { Film, Tv } from "lucide-react";
import { prisma } from "@/lib/db";
import { PersonChip } from "@/components/person-chip";

export default async function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = await prisma.title.findUnique({
    where: { id },
    include: {
      credits: {
        include: { profile: true },
        orderBy: [{ order: "asc" }],
      },
    },
  });

  if (!title) notFound();

  const cast = title.credits.filter((c) => c.kind === "CAST");
  const crew = title.credits.filter((c) => c.kind === "CREW");
  const Icon = title.mediaType === "TV" ? Tv : Film;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:w-52">
          {title.posterUrl ? (
            <Image
              src={title.posterUrl}
              alt={title.name}
              fill
              sizes="208px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Icon className="size-10" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="size-4" />
            <span>{title.mediaType === "TV" ? "TV Series" : "Film"}</span>
            {title.year ? <span>· {title.year}</span> : null}
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{title.name}</h1>
          {title.overview ? (
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {title.overview}
            </p>
          ) : null}
        </div>
      </div>

      {cast.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Cast</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cast.map((c) => (
              <PersonChip
                key={c.id}
                slug={c.profile.slug}
                displayName={c.profile.displayName}
                headshotUrl={c.profile.headshotUrl}
                subtitle={c.character || undefined}
                claimed={Boolean(c.profile.ownerUserId)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {crew.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Crew</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {crew.map((c) => (
              <PersonChip
                key={c.id}
                slug={c.profile.slug}
                displayName={c.profile.displayName}
                headshotUrl={c.profile.headshotUrl}
                subtitle={c.job || c.department || undefined}
                claimed={Boolean(c.profile.ownerUserId)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
