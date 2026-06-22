"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AuthState } from "@/lib/auth-actions";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

const inputClass =
  "h-9 w-full rounded-lg border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isSignup ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Name</span>
          <input name="name" type="text" autoComplete="name" className={inputClass} />
        </label>
      ) : null}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className={inputClass}
        />
      </label>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "…" : isSignup ? "Create account — free" : "Log in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? (
          <>
            Already here?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New to FilmIN?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Join free
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
