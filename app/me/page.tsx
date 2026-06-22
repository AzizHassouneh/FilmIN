import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";

// "Me" resolves to the page you own. If you haven't claimed one yet, point you
// at search to find and claim it (scenario S1).
export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/me");

  const profile = await prisma.professionalProfile.findUnique({
    where: { ownerUserId: session.user.id },
    select: { slug: true },
  });
  if (profile) redirect(`/p/${profile.slug}`);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight">You haven&apos;t claimed a page yet</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Search for your name in the catalog and claim your page — it&apos;s free. Then upload
        your headshot, fix your credits, and signal that you&apos;re open to work.
      </p>
      <div className="mt-6">
        <Link href="/search" className={buttonVariants({ size: "lg" })}>
          Find your page
        </Link>
      </div>
    </div>
  );
}
