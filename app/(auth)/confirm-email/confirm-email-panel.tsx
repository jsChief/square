"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useActionState } from "react";
import { AuthButton, AuthNotice } from "@/components/auth/auth-ui";
import { resendConfirmation, type ResendState } from "@/lib/auth-actions";

const initialState: ResendState = {};

export function ConfirmEmailPanel({ email }: { email: string }) {
  const [state, action, pending] = useActionState(
    resendConfirmation,
    initialState,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
        <Mail className="size-5 shrink-0 text-accent" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">Waiting for confirmation</p>
          <p className="truncate text-sm font-medium">
            {email || "your email address"}
          </p>
        </div>
        <Link
          href="/signup"
          className="shrink-0 text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
        >
          Change
        </Link>
      </div>

      <AuthNotice tone="info" title="Check your inbox">
        We sent a confirmation link when you signed up. Open it to activate your
        account. If it is missing, ask for another one below.
      </AuthNotice>

      {state.error && <AuthNotice tone="error" title={state.error} />}
      {state.success && <AuthNotice tone="success" title={state.success} />}

      <form action={action}>
        <input type="hidden" name="email" value={email} />
        <AuthButton pending={pending} pendingLabel="Sending link…">
          Resend confirmation email
        </AuthButton>
      </form>
    </div>
  );
}
