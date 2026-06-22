"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createPost, type SocialState } from "@/lib/social-actions";

export function PostComposer() {
  const [state, action, pending] = useActionState<SocialState, FormData>(createPost, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea after a successful post (no error returned).
  useEffect(() => {
    if (!pending && state === undefined) formRef.current?.reset();
  }, [pending, state]);

  return (
    <form ref={formRef} action={action} className="rounded-lg border border-border bg-card p-3">
      <textarea
        name="body"
        rows={3}
        required
        maxLength={2000}
        placeholder="Share an update — a wrap, a credit, what you're looking for…"
        className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <div className="mt-2 flex items-center justify-between">
        {state?.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : (
          <span />
        )}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  );
}
