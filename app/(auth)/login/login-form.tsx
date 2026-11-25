"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { AuthButton, AuthField } from "@/components/auth/auth-ui";
import { signIn, type LoginState } from "@/lib/auth-actions";

const initialState: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, initialState);
  const [visible, setVisible] = useState(false);
  const emailError = state.error?.includes("email") ? state.error : undefined;
  const passwordError =
    state.error && !emailError ? state.error : undefined;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <AuthField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="alex@example.com"
        error={emailError}
        required
      />

      <div>
        <div className="relative">
          <AuthField
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            error={passwordError}
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
        <div className="mt-3 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <AuthButton pending={pending} pendingLabel="Signing in…">
        Sign in
      </AuthButton>
    </form>
  );
}
