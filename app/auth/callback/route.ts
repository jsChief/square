import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeDestination(value: string | null, fallback = "/listings") {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : fallback;
}

/** Completes Supabase email confirmation / recovery links. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeDestination(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set(
    "error",
    "That sign-in link has expired or is invalid. Request a new one.",
  );
  return NextResponse.redirect(loginUrl);
}
