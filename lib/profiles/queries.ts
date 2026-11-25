import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

type PublicProfileRow =
  Database["public"]["Views"]["public_profiles"]["Row"];

export type PublicProfileSummary = Pick<
  PublicProfileRow,
  "id" | "avatar_url" | "username"
>;

export type PublicProfile = Pick<
  PublicProfileRow,
  | "id"
  | "avatar_url"
  | "username"
  | "university"
  | "account_type"
  | "student_email_verified"
  | "verification_status"
>;

export async function getPublicProfileById(
  id: string,
): Promise<PublicProfile | null> {
  if (!id) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("public_profiles")
    .select(
      "id,avatar_url,username,university,account_type,student_email_verified,verification_status",
    )
    .eq("id", id)
    .maybeSingle();

  return data?.id ? data : null;
}

export async function getPublicProfilesByIds(
  ids: Array<string | null | undefined>,
): Promise<Map<string, PublicProfileSummary>> {
  const uniqueIds = [
    ...new Set(ids.filter((id): id is string => Boolean(id))),
  ];
  if (uniqueIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data } = await supabase
    .from("public_profiles")
    .select("id,avatar_url,username")
    .in("id", uniqueIds);

  const profiles = new Map<string, PublicProfileSummary>();
  for (const profile of data ?? []) {
    if (profile.id) profiles.set(profile.id, profile);
  }
  return profiles;
}
