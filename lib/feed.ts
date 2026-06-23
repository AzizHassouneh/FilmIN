// The personalized Home feed (docs/Design-Concept.md). One ranked stream that
// mixes posts from your network with "in your network" activity cards.
//
// Ranking is a deliberately transparent formula — no black-box ML for v1:
//   score = recency × proximity × type
// so behavior is easy to reason about and tune.
import { prisma } from "@/lib/db";
import {
  buildNetwork,
  getDegree2UserIds,
  getNetworkActivity,
  type ActivityItem,
  type NetworkGraph,
} from "@/lib/network";

export type PostItem = {
  kind: "post";
  id: string;
  body: string;
  createdAt: Date;
  /** 1 = degree-1 (follows/worked-with), 2 = friend-of-friend. */
  proximity: 1 | 2;
  author: {
    name: string | null;
    profile: { slug: string; displayName: string; headshotUrl: string | null } | null;
  };
  title: { id: string; name: string; year: number | null } | null;
  likeCount: number;
  likedByMe: boolean;
};

export type FeedItem = PostItem | ActivityItem;

// A degree-1 network smaller than this triggers the cold-start experience.
const COLD_THRESHOLD = 5;
// Half-life for recency decay, in days.
const RECENCY_HALF_LIFE_DAYS = 3;

function recencyScore(date: Date): number {
  const ageDays = Math.max(0, (Date.now() - date.getTime()) / 86_400_000);
  return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
}

function score(item: FeedItem): number {
  if (item.kind === "post") {
    const proximityWeight = item.proximity === 1 ? 1 : 0.5;
    const typeWeight = 1; // posts (incl. "open to work") rank above passive activity
    return recencyScore(item.createdAt) * proximityWeight * typeWeight;
  }
  // activity — always degree-1, but passive
  return recencyScore(item.createdAt) * 1 * 0.7;
}

export type HomeFeed = {
  net: NetworkGraph;
  items: FeedItem[];
  /** True when the direct network is too thin for a meaningful feed. */
  isCold: boolean;
};

export async function buildHomeFeed(userId: string, limit = 40): Promise<HomeFeed> {
  const net = await buildNetwork(userId);
  const degree2UserIds = await getDegree2UserIds(net);

  const postAuthorIds = [...new Set([...net.degree1UserIds, ...degree2UserIds])];
  const degree1 = new Set(net.degree1UserIds);

  const posts = await prisma.post.findMany({
    where: { authorId: { in: postAuthorIds } },
    include: {
      author: {
        include: { profile: { select: { slug: true, displayName: true, headshotUrl: true } } },
      },
      title: { select: { id: true, name: true, year: true } },
      likes: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  const postItems: PostItem[] = posts.map((p) => ({
    kind: "post",
    id: p.id,
    body: p.body,
    createdAt: p.createdAt,
    proximity: degree1.has(p.authorId) ? 1 : 2,
    author: { name: p.author.name, profile: p.author.profile },
    title: p.title,
    likeCount: p.likes.length,
    likedByMe: p.likes.some((l) => l.userId === userId),
  }));

  const activity = await getNetworkActivity(net, 8);

  const items: FeedItem[] = [...postItems, ...activity]
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);

  const isCold = net.degree1ProfileIds.length < COLD_THRESHOLD;

  return { net, items, isCold };
}
