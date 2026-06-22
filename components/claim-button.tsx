"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { claimProfile, type ProfileState } from "@/lib/profile-actions";

export function ClaimButton({ slug }: { slug: string }) {
  const action = claimProfile.bind(null, slug);
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    () => action(),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Claiming…" : "This is me — claim this page"}
      </Button>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
