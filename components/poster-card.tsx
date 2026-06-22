import Image from "next/image";
import Link from "next/link";
import { Film, Tv } from "lucide-react";

type PosterCardProps = {
  href: string;
  name: string;
  year?: number | null;
  posterUrl?: string | null;
  mediaType?: "MOVIE" | "TV";
};

/** A poster tile used across the home/search/title grids. */
export function PosterCard({ href, name, year, posterUrl, mediaType }: PosterCardProps) {
  const Icon = mediaType === "TV" ? Tv : Film;
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/60"
    >
      <div className="relative aspect-[2/3] bg-muted">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Icon className="size-8" />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-sm font-medium" title={name}>
          {name}
        </p>
        {year ? <p className="text-xs text-muted-foreground">{year}</p> : null}
      </div>
    </Link>
  );
}
