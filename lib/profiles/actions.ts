"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export interface UpdateProfileState {
  error?: string;
  success?: string;
}

function readField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfile(
  _previous: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const currentProfile = await getProfile();
  if (!currentProfile) {
    return { error: "Sign in to edit your profile." };
  }

  const values = {
    username: readField(formData, "username"),
    university: readField(formData, "university"),
    matric: readField(formData, "matric"),
    phone: readField(formData, "phone"),
    address: readField(formData, "address"),
  };

  if (!values.username) {
    return { error: "Enter a display name." };
  }
  if (values.username.length > 60) {
    return { error: "Display name must be 60 characters or fewer." };
  }
  if (values.university.length > 120) {
    return { error: "University must be 120 characters or fewer." };
  }
  if (values.matric.length > 40) {
    return { error: "Matric number must be 40 characters or fewer." };
  }
  if (values.phone.length > 40) {
    return { error: "Phone number must be 40 characters or fewer." };
  }
  if (values.address.length > 160) {
    return { error: "Pickup area must be 160 characters or fewer." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", currentProfile.id);

  if (error) {
    return { error: "We couldn't save your profile. Try again." };
  }

  const profileRouteId = currentProfile.user_id ?? currentProfile.id;
  revalidatePath(`/profile/${profileRouteId}`);

  return { success: "Profile updated." };
}
