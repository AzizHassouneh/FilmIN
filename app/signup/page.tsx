import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";
import { signupAction } from "@/lib/auth-actions";

export default async function SignupPage() {
  if (await auth()) redirect("/");
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Join FilmIN — free</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Claim your page, curate your credits, upload your headshots. No paywall, ever.
      </p>
      <AuthForm mode="signup" action={signupAction} />
    </div>
  );
}
