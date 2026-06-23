import Image from "next/image";
import Link from "next/link";
import { Briefcase, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildHomeFeed } from "@/lib/feed";
import { getSuggestions } from "@/lib/network";
import { buttonVariants } from "@/components/ui/button";
import { PosterCard } from "@/components/poster-card";
import { PostComposer } from "@/components/post-composer";
import { FeedList } from "@/components/feed-list";
import { SuggestionRail } from "@/components/suggestion-rail";

async function getTrendingTitles(take = 10) {
  try {
    return await prisma.title.findMany({ orderBy: [{ createdAt: "desc" }], take });
  } catch {
    // Catalog not seeded yet (no DB / empty) — degrade gracefully.
    return [];
  }
}

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;
  if (userId) return <NetworkHome userId={userId} />;
  return <MarketingHome />;
}

// ── Logged-in: the personalized network feed ─────────────────────────────────

async function NetworkHome({ userId }: { userId: string }) {
  const [feed, trending] = await Promise.all([buildHomeFeed(userId), getTrendingTitles(6)]);
  const [suggestions, self, followerCount] = await Promise.all([
    getSuggestions(feed.net, 5),
    feed.net.selfProfileId
      ? prisma.professionalProfile.findUnique({
          where: { id: feed.net.selfProfileId },
          select: { slug: true, displayName: true, headshotUrl: true, roles: true, openToWork: true },
        })
      : Promise.resolve(null),
    feed.net.selfProfileId
      ? prisma.follow.count({ where: { followingProfileId: feed.net.selfProfileId } })
      : Promise.resolve(0),
  ]);

  return (
    <div className="mx-auto max-w-6xl gap-6 px-4 py-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_240px]">
      {/* Profile rail */}
      <aside className="hidden lg:block">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <div className="relative mx-auto size-14 overflow-hidden rounded-full bg-muted">
            {self?.headshotUrl ? (
              <Image src={self.headshotUrl} alt="" fill sizes="56px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserRound className="size-6" />
              </span>
            )}
          </div>
          {self ? (
            <>
              <Link href={`/p/${self.slug}`} className="mt-2 block text-sm font-medium hover:underline">
                {self.displayName}
              </Link>
              {self.roles[0] ? (
                <p className="text-xs text-muted-foreground">{self.roles[0]}</p>
              ) : null}
              {self.openToWork ? (
                <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[0.7rem] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <Briefcase className="size-3" />
                  Open to work
                </span>
              ) : null}
              <div className="mt-3 flex justify-around text-xs">
                <div>
                  <div className="font-medium">{followerCount}</div>
                  <div className="text-muted-foreground">followers</div>
                </div>
                <div>
                  <div className="font-medium">{feed.net.degree1ProfileIds.length}</div>
                  <div className="text-muted-foreground">network</div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-sm font-medium">Welcome to FilmIN</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Claim your page to build your network.
              </p>
              <Link href="/search" className={`mt-3 ${buttonVariants({ size: "sm", variant: "outline" })}`}>
                Find your page
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Center feed */}
      <main className="min-w-0">
        <PostComposer />

        {feed.isCold ? <ColdStartBanner hasProfile={Boolean(self)} /> : null}

        <div className="mt-4">
          {feed.items.length > 0 ? (
            <FeedList items={feed.items} />
          ) : (
            <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Your feed is quiet for now. Follow people from their pages — or claim your own page —
              and updates from your network will show up here.
            </p>
          )}
        </div>
      </main>

      {/* Suggestion rail */}
      <aside className="mt-6 flex flex-col gap-4 lg:mt-0">
        <SuggestionRail people={suggestions} />
        {trending.length > 0 ? (
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Trending</p>
            <div className="grid grid-cols-3 gap-2">
              {trending.slice(0, 6).map((t) => (
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
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function ColdStartBanner({ hasProfile }: { hasProfile: boolean }) {
  return (
    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm font-medium">Let’s build your network</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasProfile
          ? "Follow the people you’ve worked with and discover collaborators — your feed fills up as your network grows."
          : "Claim your professional page to unlock your worked-with network, then follow collaborators to personalize this feed."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/search" className={buttonVariants({ size: "sm" })}>
          {hasProfile ? "Find collaborators" : "Find your page"}
        </Link>
        <Link href="/search" className={buttonVariants({ size: "sm", variant: "outline" })}>
          Explore the catalog
        </Link>
      </div>
    </div>
  );
}

// ── Logged-out: the marketing landing ────────────────────────────────────────

async function MarketingHome() {
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
