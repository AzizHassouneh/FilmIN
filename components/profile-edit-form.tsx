"use client";

import Image from "next/image";
import { useActionState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProfile, uploadHeadshot, type ProfileState } from "@/lib/profile-actions";

type Links = { website?: string; reel?: string; instagram?: string };

type Props = {
  slug: string;
  displayName: string;
  bio?: string | null;
  location?: string | null;
  roles: string[];
  links: Links;
  openToWork: boolean;
  headshotUrl?: string | null;
};

const inputClass =
  "h-9 w-full rounded-lg border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProfileEditForm(props: Props) {
  const save = updateProfile.bind(null, props.slug);
  const upload = uploadHeadshot.bind(null, props.slug);
  const [saveState, saveAction, saving] = useActionState<ProfileState, FormData>(save, undefined);
  const [upState, upAction, uploading] = useActionState<ProfileState, FormData>(upload, undefined);

  return (
    <div className="flex flex-col gap-10">
      {/* Free headshot upload — the headline IMDbPro-killer. */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">Headshot</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Upload a headshot — free, always. JPEG, PNG, or WebP up to 5 MB.
        </p>
        <form action={upAction} className="flex items-center gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {props.headshotUrl ? (
              <Image src={props.headshotUrl} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserRound className="size-8" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              name="headshot"
              accept="image/jpeg,image/png,image/webp"
              required
              className="text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm"
            />
            <Button type="submit" variant="outline" size="sm" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload headshot"}
            </Button>
            {upState?.error ? <p className="text-sm text-destructive">{upState.error}</p> : null}
            {upState?.ok ? <p className="text-sm text-primary">Headshot updated.</p> : null}
          </div>
        </form>
      </section>

      {/* Profile details. */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Details</h2>
        <form action={saveAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Name</span>
            <input name="displayName" defaultValue={props.displayName} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Roles</span>
            <input
              name="roles"
              defaultValue={props.roles.join(", ")}
              placeholder="Actor, Choreographer"
              className={inputClass}
            />
            <span className="text-xs text-muted-foreground">Comma-separated.</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Location</span>
            <input name="location" defaultValue={props.location ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Bio</span>
            <textarea
              name="bio"
              defaultValue={props.bio ?? ""}
              rows={4}
              className="w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Reel URL</span>
            <input name="reel" type="url" defaultValue={props.links.reel ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Website</span>
            <input name="website" type="url" defaultValue={props.links.website ?? ""} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Instagram</span>
            <input name="instagram" defaultValue={props.links.instagram ?? ""} className={inputClass} />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="openToWork"
              defaultChecked={props.openToWork}
              className="size-4 accent-[var(--primary)]"
            />
            <span className="text-sm font-medium">Open to work</span>
          </label>

          {saveState?.error ? <p className="text-sm text-destructive">{saveState.error}</p> : null}
          <Button type="submit" size="lg" disabled={saving} className="self-start">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </section>
    </div>
  );
}
