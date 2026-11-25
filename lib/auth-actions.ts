"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

export interface SignupState {
  error?: string;
}

export interface ForgotPasswordState {
  error?: string;
  sentTo?: string;
}

export interface ResetPasswordState {
  error?: string;
  success?: string;
}

export interface ResendState {
  error?: string;
  success?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeDestination(value: FormDataEntryValue | null, fallback = "/sell") {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

function authError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "That email and password don't match. Try again or reset your password.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirm your email address first, then sign in.";
  }
  if (normalized.includes("already registered")) {
    return "An account with that email already exists. Sign in instead.";
  }
  if (normalized.includes("password should be")) {
    return "Use a password with at least 8 characters.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (normalized.includes("auth session missing") || normalized.includes("not authenticated")) {
    return "Open the reset link from your email first, then choose a new password.";
  }
  return message;
}

export async function signIn(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");

  if (!emailPattern.test(email)) return { error: "Enter a valid email address." };
  if (!password) return { error: "Enter your password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authError(error.message) };

  redirect(safeDestination(formData.get("next")));
}

export async function signUp(
  _previous: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const destination = safeDestination(formData.get("next"), "/listings");

  if (!name) return { error: "Enter your name to continue." };
  if (!emailPattern.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) {
    return { error: "Use a password with at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(destination)}`,
    },
  });

  if (error) return { error: authError(error.message) };

  // Email confirmation can be disabled in Supabase; in that case the user is
  // signed in immediately.
  if (data.session) redirect(destination);

  const confirmUrl = new URL("/confirm-email", await siteOrigin());
  confirmUrl.searchParams.set("email", email);
  confirmUrl.searchParams.set("next", destination);
  redirect(confirmUrl.pathname + confirmUrl.search);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPassword(
  _previous: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = readString(formData, "email").toLowerCase();
  if (!emailPattern.test(email)) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });
  if (error) return { error: authError(error.message) };

  return { sentTo: email };
}

export async function resetPassword(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = readString(formData, "password");
  const confirmation = readString(formData, "confirm-password");

  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirmation) return { error: "Those passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authError(error.message) };

  return { success: "Password updated. You can sign in with your new password." };
}

export async function resendConfirmation(
  _previous: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const email = readString(formData, "email").toLowerCase();
  if (!emailPattern.test(email)) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent("/listings")}`,
    },
  });
  if (error) return { error: authError(error.message) };

  return { success: "A new confirmation link is on its way." };
}
