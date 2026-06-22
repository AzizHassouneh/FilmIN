"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type SocialState = { error?: string } | undefined;

/** Follow / unfollow a profile (one-way, scenario S4/S9). Returns nothing — the
 *  caller revalidates. Redirects to login if signed out. */
export async function toggleFollow(profileId: string, currentlyFollowing: boolean): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Don't let a user follow the page they own.
  const profile = await prisma.professionalProfile.findUnique({
    where: { id: profileId },
    select: { ownerUserId: true, slug: true },
  });
  if (!profile) return;
  if (profile.ownerUserId === userId) return;

  if (currentlyFollowing) {
    await prisma.follow.deleteMany({
      where: { followerUserId: userId, followingProfileId: profileId },
    });
  } else {
    await prisma.follow.create({
      data: { followerUserId: userId, followingProfileId: profileId },
    });
  }
  revalidatePath(`/p/${profile.slug}`);
}

const postSchema = z.object({
  body: z.string().trim().min(1, "Write something first.").max(2000),
  titleId: z.string().optional(),
});

export async function createPost(_prev: SocialState, formData: FormData): Promise<SocialState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/feed");

  const parsed = postSchema.safeParse({
    body: formData.get("body"),
    titleId: formData.get("titleId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Could not post." };
  }

  await prisma.post.create({
    data: {
      authorId: session.user.id,
      body: parsed.data.body,
      titleId: parsed.data.titleId || null,
    },
  });
  revalidatePath("/feed");
  return undefined;
}

/** Like / unlike a post (scenario S4). */
export async function toggleLike(postId: string, currentlyLiked: boolean): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/feed");
  const userId = session.user.id;

  if (currentlyLiked) {
    await prisma.postLike.deleteMany({ where: { userId, postId } });
  } else {
    await prisma.postLike.create({ data: { userId, postId } });
  }
  revalidatePath("/feed");
}
