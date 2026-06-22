import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PostComposer } from "@/components/post-composer";
import { LikeButton } from "@/components/like-button";

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return date.toLocaleDateString();
}

export default async function FeedPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Signed in → posts from the people you follow + your own. Signed out →
  // a recent global feed (good for discovery & SEO).
  let authorIds: string[] | null = null;
  if (userId) {
    const follows = await prisma.follow.findMany({
      where: { followerUserId: userId },
      select: { following: { select: { ownerUserId: true } } },
    });
    const ids = follows
      .map((f) => f.following.ownerUserId)
      .filter((id): id is string => Boolean(id));
    authorIds = [...new Set([userId, ...ids])];
  }

  const posts = await prisma.post.findMany({
    where: authorIds ? { authorId: { in: authorIds } } : {},
    include: {
      author: { include: { profile: true } },
      title: true,
      likes: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Feed</h1>

      {userId ? (
        <div className="mb-6">
          <PostComposer />
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          <Link href="/signup" className="text-primary hover:underline">
            Join free
          </Link>{" "}
          to post and follow the people you work with.
        </p>
      )}

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {authorIds
            ? "Your feed is quiet. Follow people from their pages to see their updates here."
            : "No posts yet."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => {
            const p = post.author.profile;
            const liked = userId ? post.likes.some((l) => l.userId === userId) : false;
            return (
              <li key={post.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                    {p?.headshotUrl ? (
                      <Image src={p.headshotUrl} alt="" fill sizes="36px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <UserRound className="size-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {p ? (
                      <Link href={`/p/${p.slug}`} className="text-sm font-medium hover:underline">
                        {p.displayName}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium">{post.author.name ?? "Someone"}</span>
                    )}
                    <span className="ml-2 text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>

                {post.title ? (
                  <Link
                    href={`/title/${post.title.id}`}
                    className="mt-3 inline-block rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/60"
                  >
                    {post.title.name}
                    {post.title.year ? ` (${post.title.year})` : ""}
                  </Link>
                ) : null}

                <div className="mt-3">
                  <LikeButton postId={post.id} liked={liked} count={post.likes.length} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
