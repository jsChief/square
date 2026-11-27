"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { AuthField, AuthNotice } from "@/components/auth/auth-ui";
import {
  updateProfile,
  type UpdateProfileState,
} from "@/lib/profiles/actions";

export interface ProfileFormValues {
  username: string;
  university: string;
  matric: string;
  phone: string;
  address: string;
}

const initialState: UpdateProfileState = {};

export function ProfileDetailsForm({ values }: { values: ProfileFormValues }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={action} className="mt-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          id="profile-username"
          name="username"
          label="Display name"
          autoComplete="name"
          placeholder="How you appear on square"
          defaultValue={values.username}
          maxLength={60}
          required
        />
        <AuthField
          id="profile-university"
          name="university"
          label="University"
          autoComplete="organization"
          placeholder="e.g. University of Lagos"
          defaultValue={values.university}
          maxLength={120}
        />
        <AuthField
          id="profile-matric"
          name="matric"
          label="Matric number"
          placeholder="e.g. 2023123456"
          defaultValue={values.matric}
          maxLength={40}
        />
        <AuthField
          id="profile-phone"
          name="phone"
          type="tel"
          label="Phone number"
          autoComplete="tel"
          placeholder="e.g. +234 800 000 0000"
          defaultValue={values.phone}
          maxLength={40}
        />
        <div className="sm:col-span-2">
          <AuthField
            id="profile-address"
            name="address"
            label="Pickup area"
            autoComplete="street-address"
            placeholder="e.g. Faculty of Engineering car park"
            defaultValue={values.address}
            maxLength={160}
          />
        </div>
      </div>

      {state.error && (
        <div className="mt-6">
          <AuthNotice tone="error" title="Couldn't save changes">
            {state.error}
          </AuthNotice>
        </div>
      )}
      {state.success && (
        <div className="mt-6">
          <AuthNotice tone="success" title="Profile updated">
            Your details are up to date.
          </AuthNotice>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        )}
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
