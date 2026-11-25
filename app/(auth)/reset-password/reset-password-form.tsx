"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import {
  AuthButton,
  AuthField,
  AuthNotice,
} from "@/components/auth/auth-ui";
import { resetPassword, type ResetPasswordState } from "@/lib/auth-actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, initialState);
  const [visible, setVisible] = useState(false);

  if (state.success) {
    return (
      <div className="space-y-6">
        <AuthNotice tone="success" title="Password updated">
          {state.success}
        </AuthNotice>
        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-accent-contrast transition-colors hover:bg-accent/90"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  const lengthError = state.error?.includes("8 characters")
    ? state.error
    : undefined;
  const matchError = state.error?.includes("match") ? state.error : undefined;
  const otherError =
    state.error && !lengthError && !matchError ? state.error : undefined;

  return (
    <form action={action} className="space-y-5">
      <div className="relative">
        <AuthField
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use at least 8 characters."
          error={lengthError ?? otherError}
          className="pr-12"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-[2.25rem] flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <AuthField
        id="confirm-password"
        name="confirm-password"
        type={visible ? "text" : "password"}
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        error={matchError}
        required
      />

      <AuthButton pending={pending} pendingLabel="Updating password…">
        Update password
      </AuthButton>
    </form>
  );
}
