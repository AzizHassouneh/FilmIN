import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/lib/auth-actions";

export default async function LoginPage() {
  if (await auth()) redirect("/");
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mb-6 text-sm text-muted-foreground">Log in to manage your page.</p>
      <AuthForm mode="login" action={loginAction} />
    </div>
  );
}
