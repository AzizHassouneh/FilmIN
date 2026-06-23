"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { saveUpload, UploadError } from "@/lib/storage";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

async function requireOwnedProfile(slug: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please log in first." as const };
  const profile = await prisma.professionalProfile.findUnique({ where: { slug } });
  if (!profile) return { error: "Profile not found." as const };
  if (profile.ownerUserId !== session.user.id) {
    return { error: "You don't own this page." as const };
  }
  return { profile };
}

/** Claim an unclaimed stub as your own (scenario S1, the IMDbPro-killer). */
export async function claimProfile(slug: string): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/p/${slug}`);
  const userId = session.user.id;

  const profile = await prisma.professionalProfile.findUnique({ where: { slug } });
  if (!profile) return { error: "Profile not found." };
  if (profile.ownerUserId) {
    return { error: "This page has already been claimed." };
  }

  const already = await prisma.professionalProfile.findUnique({
    where: { ownerUserId: userId },
  });
  if (already) {
    return { error: "You already own a page. You can only claim one." };
  }

  await prisma.professionalProfile.update({
    where: { id: profile.id },
    data: { ownerUserId: userId },
  });
  revalidatePath(`/p/${slug}`);
  redirect(`/p/${slug}`);
}

const updateSchema = z.object({
  displayName: z.string().min(1, "Name is required.").max(120),
  bio: z.string().max(2000).optional(),
  location: z.string().max(120).optional(),
  roles: z.string().max(300).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  reel: z.string().url().or(z.literal("")).optional(),
  instagram: z.string().max(200).optional(),
  openToWork: z.coerce.boolean().optional(),
});

export async function updateProfile(slug: string, _prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const owned = await requireOwnedProfile(slug);
  if ("error" in owned) return { error: owned.error };

  const parsed = updateSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio") ?? undefined,
    location: formData.get("location") ?? undefined,
    roles: formData.get("roles") ?? undefined,
    website: formData.get("website") ?? undefined,
    reel: formData.get("reel") ?? undefined,
    instagram: formData.get("instagram") ?? undefined,
    openToWork: formData.get("openToWork") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your entries." };
  }
  const d = parsed.data;

  const links: Record<string, string> = {};
  if (d.website) links.website = d.website;
  if (d.reel) links.reel = d.reel;
  if (d.instagram) links.instagram = d.instagram;

  const roles = (d.roles ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  await prisma.professionalProfile.update({
    where: { id: owned.profile.id },
    data: {
      displayName: d.displayName,
      bio: d.bio || null,
      location: d.location || null,
      roles,
      links: Object.keys(links).length ? links : undefined,
      openToWork: Boolean(d.openToWork),
    },
  });

  revalidatePath(`/p/${slug}`);
  redirect(`/p/${slug}`);
}

/** Free headshot upload — the headline feature IMDbPro paywalls. */
export async function uploadHeadshot(slug: string, _prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const owned = await requireOwnedProfile(slug);
  if ("error" in owned) return { error: owned.error };

  const file = formData.get("headshot");
  if (!(file instanceof File)) return { error: "No file provided." };

  try {
    const url = await saveUpload(file);
    await prisma.professionalProfile.update({
      where: { id: owned.profile.id },
      data: { headshotUrl: url },
    });
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message };
    throw err;
  }

  revalidatePath(`/p/${slug}`);
  return { ok: true };
}
