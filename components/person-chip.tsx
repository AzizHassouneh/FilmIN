import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";

type PersonChipProps = {
  slug: string;
  displayName: string;
  headshotUrl?: string | null;
  subtitle?: string | null;
  /** Unclaimed stubs render muted with a quiet "Unclaimed" hint. */
  claimed?: boolean;
};

/** A person reference used on title pages and people lists. */
export function PersonChip({
  slug,
  displayName,
  headshotUrl,
  subtitle,
  claimed,
}: PersonChipProps) {
  return (
    <Link
      href={`/p/${slug}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 transition-colors hover:border-primary/60"
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
        {headshotUrl ? (
          <Image src={headshotUrl} alt={displayName} fill sizes="44px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <UserRound className="size-5" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className={`truncate text-sm font-medium ${claimed ? "" : "text-muted-foreground"}`}>
          {displayName}
        </p>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        {!claimed ? (
          <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground/70">
            Unclaimed
          </p>
        ) : null}
      </div>
    </Link>
  );
}
