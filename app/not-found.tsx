import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The title or profile may have moved, or never existed.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className={buttonVariants()}>
          Go home
        </Link>
        <Link href="/search" className={buttonVariants({ variant: "outline" })}>
          Search the catalog
        </Link>
      </div>
    </div>
  );
}
