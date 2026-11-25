import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/** Returns the verified auth user, or null. Never trust the cookie directly. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

/** Server-side guard. Call this inside actions as well as protected pages. */
export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const destination = next?.startsWith("/") && !next.startsWith("//")
      ? next
      : "/listings";
    redirect(`/login?next=${encodeURIComponent(destination)}`);
  }
  return user;
}

/** Profile rows use both id and user_id as the auth id in this schema. */
export async function getProfile(): Promise<ProfileRow | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const byUserId = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!byUserId.error && byUserId.data) return byUserId.data;

  const byId = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return byId.error ? null : byId.data;
}

export function displayName(user: User, profile?: ProfileRow | null) {
  return (
    profile?.username?.trim() ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "") ||
    user.email?.split("@")[0] ||
    "Member"
  );
}
