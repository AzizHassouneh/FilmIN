import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { FollowButton } from "@/components/follow-button";
import type { SuggestedPerson } from "@/lib/network";

/** "People you may know" — degree 2–3 connections, ranked by shared ties. */
export function SuggestionRail({ people }: { people: SuggestedPerson[] }) {
  if (people.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">People you may know</p>
      <ul className="flex flex-col gap-3">
        {people.map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <Link href={`/p/${p.slug}`} className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
              {p.headshotUrl ? (
                <Image src={p.headshotUrl} alt={p.displayName} fill sizes="36px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <UserRound className="size-4" />
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/p/${p.slug}`} className="block truncate text-sm font-medium hover:underline">
                {p.displayName}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {p.roles[0] ? `${p.roles[0]} · ` : ""}
                {p.sharedCount} shared
              </p>
            </div>
            {p.claimed ? <FollowButton profileId={p.id} following={false} /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
