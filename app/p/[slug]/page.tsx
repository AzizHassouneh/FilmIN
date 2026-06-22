import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRound, MapPin } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { ClaimButton } from "@/components/claim-button";

type Links = { website?: string; reel?: string; instagram?: string };

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [session, profile] = await Promise.all([
    auth(),
    prisma.professionalProfile.findUnique({
      where: { slug },
      include: {
        credits: { include: { title: true }, orderBy: [{ title: { year: "desc" } }] },
      },
    }),
  ]);

  if (!profile) notFound();

  const isOwner = Boolean(session?.user?.id && profile.ownerUserId === session.user.id);
  const claimed = Boolean(profile.ownerUserId);
  const canClaim = Boolean(session?.user?.id) && !claimed;
  const links = (profile.links ?? {}) as Links;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative size-32 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          {profile.headshotUrl ? (
            <Image src={profile.headshotUrl} alt={profile.displayName} fill sizes="128px" className="object-cover" priority />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <UserRound className="size-12" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{profile.displayName}</h1>
            {profile.openToWork ? (
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                Open to work
              </span>
            ) : null}
            {!claimed ? (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                Unclaimed
              </span>
            ) : null}
          </div>

          {profile.roles.length > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">{profile.roles.join(" · ")}</p>
          ) : null}
          {profile.location ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" /> {profile.location}
            </p>
          ) : null}
          {profile.bio ? <p className="mt-4 max-w-prose text-sm leading-relaxed">{profile.bio}</p> : null}

          {(links.website || links.reel || links.instagram) ? (
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {links.reel ? <a href={links.reel} className="text-primary hover:underline" target="_blank" rel="noreferrer">Reel</a> : null}
              {links.website ? <a href={links.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">Website</a> : null}
              {links.instagram ? <span className="text-muted-foreground">{links.instagram}</span> : null}
            </div>
          ) : null}

          <div className="mt-5">
            {isOwner ? (
              <Link href={`/p/${slug}/edit`} className={buttonVariants({ variant: "outline" })}>
                Edit your page
              </Link>
            ) : canClaim ? (
              <ClaimButton slug={slug} />
            ) : !claimed ? (
              <Link href={`/login?next=/p/${slug}`} className={buttonVariants()}>
                Is this you? Claim this page — free
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Filmography</h2>
        {profile.credits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No credits yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {profile.credits.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/title/${c.title.id}`}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-muted/50"
                >
                  <span className="min-w-0">
                    <span className="font-medium">{c.title.name}</span>
                    {c.character ? (
                      <span className="text-muted-foreground"> — {c.character}</span>
                    ) : c.job ? (
                      <span className="text-muted-foreground"> — {c.job}</span>
                    ) : null}
                  </span>
                  {c.title.year ? (
                    <span className="shrink-0 text-sm text-muted-foreground">{c.title.year}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
