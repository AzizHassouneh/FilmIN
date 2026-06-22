import Link from "next/link";
import { Compass, Home, Newspaper, Search } from "lucide-react";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";

// Top bar from the IA in docs/Design-Concept.md §6: wordmark · unified search ·
// Home · Discover · Notifications · Me. The chrome adapts to whether the signed-in
// user owns a profile (fan vs pro mode) — wired up as profiles land in P3.
export async function SiteNav() {
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const ghost = buttonVariants({ variant: "ghost", size: "sm" });

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-1.5 font-semibold tracking-tight">
          <span className="text-primary">Film</span>
          <span>IN</span>
        </Link>

        <div className="relative hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <form action="/search">
            <input
              name="q"
              placeholder="Search titles, people, roles"
              aria-label="Search titles, people, and roles"
              className="h-9 w-full rounded-md border bg-secondary/50 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </form>
        </div>

        <nav className="ml-auto flex items-center gap-1">
          <Link href="/" className={ghost}>
            <Home className="size-4" />
            <span className="hidden md:inline">Home</span>
          </Link>
          <Link href="/search" className={ghost}>
            <Compass className="size-4" />
            <span className="hidden md:inline">Discover</span>
          </Link>
          {signedIn ? (
            <>
              <Link href="/feed" className={ghost}>
                <Newspaper className="size-4" />
                <span className="hidden md:inline">Feed</span>
              </Link>
              <Link href="/me" className={ghost}>
                Me
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={ghost}>
                Sign in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Join free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
