// The FilmIN social graph (docs/Design-Concept.md §7, "the social spine").
//
// Two raw relationships drive everything; no schema change is needed:
//   • Follow      — explicit, one-way (who you chose to follow).
//   • Worked-with — implicit; anyone sharing a Credit on the same Title as you.
//
// From those we derive proximity degrees used by the personalized Home feed:
//   • Degree 1 — your direct network: Follows ∪ worked-with.
//   • Degree 2 — friends-of-friends: who your degree-1 connections follow.
//   • Degree 3 — only ever surfaced as soft "people you may know" suggestions.
import { prisma } from "@/lib/db";

// How wide we let each hop fan out before we stop reading rows. The feed is a
// heuristic, not an exhaustive traversal — these caps keep it cheap.
const WORKED_WITH_CAP = 500;
const DEGREE2_FOLLOW_CAP = 1000;
const SUGGESTION_SCAN_CAP = 2000;

export type NetworkGraph = {
  userId: string;
  /** The viewer's own claimed profile, if any (needed for worked-with). */
  selfProfileId: string | null;
  /** Follows ∪ worked-with, as profile ids. */
  degree1ProfileIds: string[];
  /** Claimed-user authors at degree 1, including the viewer (for post feeds). */
  degree1UserIds: string[];
  /** Profiles the viewer explicitly follows (subset of degree 1). */
  followedProfileIds: string[];
};

/** Build the viewer's degree-1 network from Follows and shared credits. */
export async function buildNetwork(userId: string): Promise<NetworkGraph> {
  const self = await prisma.professionalProfile.findUnique({
    where: { ownerUserId: userId },
    select: { id: true },
  });
  const selfProfileId = self?.id ?? null;

  const follows = await prisma.follow.findMany({
    where: { followerUserId: userId },
    select: { followingProfileId: true },
  });
  const followedProfileIds = follows.map((f) => f.followingProfileId);

  // Worked-with: titles I'm credited on → everyone else credited on them.
  let workedWithProfileIds: string[] = [];
  if (selfProfileId) {
    const myCredits = await prisma.credit.findMany({
      where: { profileId: selfProfileId },
      select: { titleId: true },
    });
    const titleIds = myCredits.map((c) => c.titleId);
    if (titleIds.length > 0) {
      const coCredits = await prisma.credit.findMany({
        where: { titleId: { in: titleIds }, profileId: { not: selfProfileId } },
        select: { profileId: true },
        distinct: ["profileId"],
        take: WORKED_WITH_CAP,
      });
      workedWithProfileIds = coCredits.map((c) => c.profileId);
    }
  }

  const degree1ProfileIds = [...new Set([...followedProfileIds, ...workedWithProfileIds])];

  // Map degree-1 profiles back to the user accounts that authored posts.
  const owners = degree1ProfileIds.length
    ? await prisma.professionalProfile.findMany({
        where: { id: { in: degree1ProfileIds }, ownerUserId: { not: null } },
        select: { ownerUserId: true },
      })
    : [];
  const degree1UserIds = [
    ...new Set([userId, ...owners.map((o) => o.ownerUserId).filter((id): id is string => Boolean(id))]),
  ];

  return { userId, selfProfileId, degree1ProfileIds, degree1UserIds, followedProfileIds };
}

/** Degree-2 post authors: people your degree-1 connections follow. */
export async function getDegree2UserIds(net: NetworkGraph): Promise<string[]> {
  const seeds = net.degree1UserIds.filter((id) => id !== net.userId);
  if (seeds.length === 0) return [];

  const follows = await prisma.follow.findMany({
    where: { followerUserId: { in: seeds } },
    select: { following: { select: { ownerUserId: true } } },
    take: DEGREE2_FOLLOW_CAP,
  });
  const exclude = new Set(net.degree1UserIds);
  const ids = follows
    .map((f) => f.following.ownerUserId)
    .filter((id): id is string => Boolean(id) && !exclude.has(id as string));
  return [...new Set(ids)];
}

export type ActivityItem = {
  kind: "activity";
  id: string;
  titleId: string;
  titleName: string;
  titleYear: number | null;
  peopleCount: number;
  sampleNames: string[];
  /** Title import time — our recency proxy (Credit has no timestamp). */
  createdAt: Date;
};

/**
 * "In your network" cards: titles your degree-1 connections are credited on,
 * grouped per title ("3 people you follow are in the cast of Echoes").
 */
export async function getNetworkActivity(net: NetworkGraph, limit: number): Promise<ActivityItem[]> {
  if (net.degree1ProfileIds.length === 0) return [];

  const credits = await prisma.credit.findMany({
    where: { profileId: { in: net.degree1ProfileIds } },
    select: {
      title: { select: { id: true, name: true, year: true, createdAt: true } },
      profile: { select: { displayName: true } },
    },
    take: 400,
  });

  const byTitle = new Map<string, ActivityItem>();
  for (const c of credits) {
    const t = c.title;
    const existing = byTitle.get(t.id);
    if (existing) {
      existing.peopleCount += 1;
      if (existing.sampleNames.length < 3) existing.sampleNames.push(c.profile.displayName);
    } else {
      byTitle.set(t.id, {
        kind: "activity",
        id: `act-${t.id}`,
        titleId: t.id,
        titleName: t.name,
        titleYear: t.year,
        peopleCount: 1,
        sampleNames: [c.profile.displayName],
        createdAt: t.createdAt,
      });
    }
  }

  return [...byTitle.values()]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export type SuggestedPerson = {
  id: string;
  slug: string;
  displayName: string;
  headshotUrl: string | null;
  roles: string[];
  claimed: boolean;
  /** How many of your degree-1 connections this person has worked with. */
  sharedCount: number;
};

/**
 * "People you may know" (degree 2–3): people who share credits with your
 * degree-1 network, ranked by how many shared connections they have.
 */
export async function getSuggestions(net: NetworkGraph, limit: number): Promise<SuggestedPerson[]> {
  if (net.degree1ProfileIds.length === 0) return [];

  const known = new Set<string>(
    [net.selfProfileId, ...net.degree1ProfileIds].filter((id): id is string => Boolean(id)),
  );

  const titleRows = await prisma.credit.findMany({
    where: { profileId: { in: net.degree1ProfileIds } },
    select: { titleId: true },
    distinct: ["titleId"],
    take: 300,
  });
  const titleIds = titleRows.map((t) => t.titleId);
  if (titleIds.length === 0) return [];

  const coCredits = await prisma.credit.findMany({
    where: { titleId: { in: titleIds } },
    select: { profileId: true },
    take: SUGGESTION_SCAN_CAP,
  });

  const counts = new Map<string, number>();
  for (const c of coCredits) {
    if (known.has(c.profileId)) continue;
    counts.set(c.profileId, (counts.get(c.profileId) ?? 0) + 1);
  }

  const topIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
  if (topIds.length === 0) return [];

  const profiles = await prisma.professionalProfile.findMany({
    where: { id: { in: topIds } },
    select: { id: true, slug: true, displayName: true, headshotUrl: true, roles: true, ownerUserId: true },
  });

  return topIds
    .map((id) => {
      const p = profiles.find((x) => x.id === id);
      if (!p) return null;
      return {
        id: p.id,
        slug: p.slug,
        displayName: p.displayName,
        headshotUrl: p.headshotUrl,
        roles: p.roles,
        claimed: Boolean(p.ownerUserId),
        sharedCount: counts.get(id) ?? 0,
      } satisfies SuggestedPerson;
    })
    .filter((x): x is SuggestedPerson => x !== null);
}
