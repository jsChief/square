"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  AuthButton,
  AuthField,
  AuthNotice,
} from "@/components/auth/auth-ui";
import {
  forgotPassword,
  type ForgotPasswordState,
} from "@/lib/auth-actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    forgotPassword,
    initialState,
  );

  if (state.sentTo) {
    return (
      <div className="space-y-6">
        <AuthNotice tone="success" title="Check your inbox">
          If an account uses {state.sentTo}, a password reset link is on its way.
          The link expires, so use it soon.
        </AuthNotice>
        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-accent-contrast transition-colors hover:bg-accent/90"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <AuthField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="alex@example.com"
        error={state.error}
        required
      />
      <AuthButton pending={pending} pendingLabel="Sending link…">
        Send reset link
      </AuthButton>
    </form>
  );
}
