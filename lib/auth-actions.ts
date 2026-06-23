"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";

export type AuthState = { error?: string } | undefined;

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function safeRedirectTo(value: FormDataEntryValue | null): string {
  const s = typeof value === "string" ? value.trim() : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }
  const redirectTo = safeRedirectTo(formData.get("next"));
  try {
    await signIn("credentials", { ...parsed.data, redirectTo });
  } catch (err) {
    // AuthError = bad credentials; anything else (e.g. the redirect) must rethrow.
    if (err instanceof AuthError) return { error: "Invalid email or password." };
    throw err;
  }
  return undefined;
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }

  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const name = (formData.get("name") as string | null)?.trim() || null;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, passwordHash } });

  const redirectTo = safeRedirectTo(formData.get("next"));
  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Account created — please log in." };
    throw err;
  }
  return undefined;
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
