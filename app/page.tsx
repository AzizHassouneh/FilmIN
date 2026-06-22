import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
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
          <Link href="/discover" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Explore the catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
