import Image from "next/image";
import Link from "next/link";
import { Film, Users, UserRound } from "lucide-react";
import { LikeButton } from "@/components/like-button";
import type { FeedItem } from "@/lib/feed";

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

/** Renders the ranked Home stream: post cards interleaved with activity cards. */
export function FeedList({ items }: { items: FeedItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) =>
        item.kind === "post" ? (
          <PostCard key={item.id} item={item} />
        ) : (
          <ActivityCard key={item.id} item={item} />
        ),
      )}
    </ul>
  );
}

function PostCard({ item }: { item: Extract<FeedItem, { kind: "post" }> }) {
  const p = item.author.profile;
  return (
    <li className="rounded-lg border border-border bg-card p-4">
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
            <span className="text-sm font-medium">{item.author.name ?? "Someone"}</span>
          )}
          <span className="ml-2 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
          {item.proximity === 2 ? (
            <span className="ml-2 text-[0.65rem] uppercase tracking-wide text-muted-foreground/70">
              In your extended network
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{item.body}</p>

      {item.title ? (
        <Link
          href={`/title/${item.title.id}`}
          className="mt-3 inline-block rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/60"
        >
          {item.title.name}
          {item.title.year ? ` (${item.title.year})` : ""}
        </Link>
      ) : null}

      <div className="mt-3">
        <LikeButton postId={item.id} liked={item.likedByMe} count={item.likeCount} />
      </div>
    </li>
  );
}

function ActivityCard({ item }: { item: Extract<FeedItem, { kind: "activity" }> }) {
  const names = item.sampleNames.slice(0, 2).join(", ");
  const extra = item.peopleCount - Math.min(2, item.sampleNames.length);
  const who =
    item.peopleCount === 1
      ? item.sampleNames[0]
      : `${names}${extra > 0 ? ` and ${extra} other${extra > 1 ? "s" : ""}` : ""}`;

  return (
    <li className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
        <Users className="size-3.5" />
        In your network
      </p>
      <p className="mt-1.5 text-sm">
        <span className="font-medium">{who}</span>{" "}
        {item.peopleCount === 1 ? "is" : "are"} credited on{" "}
        <Link href={`/title/${item.titleId}`} className="font-medium hover:underline">
          {item.titleName}
          {item.titleYear ? ` (${item.titleYear})` : ""}
        </Link>
      </p>
      <Link
        href={`/title/${item.titleId}`}
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
      >
        <Film className="size-3.5" />
        View title
      </Link>
    </li>
  );
}
