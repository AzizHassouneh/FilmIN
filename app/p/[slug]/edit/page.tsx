import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ProfileEditForm } from "@/components/profile-edit-form";

type Links = { website?: string; reel?: string; instagram?: string };

export default async function EditProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/p/${slug}/edit`);

  const profile = await prisma.professionalProfile.findUnique({ where: { slug } });
  if (!profile) notFound();
  if (profile.ownerUserId !== session.user.id) {
    // Not the owner — send them to the public page.
    redirect(`/p/${slug}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit your page</h1>
        <Link href={`/p/${slug}`} className="text-sm text-primary hover:underline">
          View page
        </Link>
      </div>
      <ProfileEditForm
        slug={slug}
        displayName={profile.displayName}
        bio={profile.bio}
        location={profile.location}
        roles={profile.roles}
        links={(profile.links ?? {}) as Links}
        openToWork={profile.openToWork}
        headshotUrl={profile.headshotUrl}
      />
    </div>
  );
}
