"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { AuthButton, AuthField } from "@/components/auth/auth-ui";
import { signUp, type SignupState } from "@/lib/auth-actions";

const initialState: SignupState = {};

const intents = [
  { value: "/sell", label: "I'm selling something" },
  { value: "/listings", label: "I'm here to browse" },
] as const;

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, initialState);
  const [visible, setVisible] = useState(false);
  const nameError = state.error?.includes("name") ? state.error : undefined;
  const emailError = state.error?.includes("email") ? state.error : undefined;
  const passwordError =
    state.error?.includes("password") || state.error?.includes("characters")
      ? state.error
      : undefined;
  const otherError =
    state.error && !nameError && !emailError && !passwordError
      ? state.error
      : undefined;

  return (
    <form action={action} className="space-y-5">
      <AuthField
        id="name"
        name="name"
        label="Full name"
        autoComplete="name"
        placeholder="Alex"
        error={nameError}
        required
      />
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

      <div className="relative">
        <AuthField
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use at least 8 characters."
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

      <fieldset>
        <legend className="text-sm font-medium">What brings you here?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {intents.map((intent, index) => (
            <label
              key={intent.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 text-sm transition-colors hover:border-foreground/25 has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
            >
              <input
                type="radio"
                name="next"
                value={intent.value}
                defaultChecked={index === 0}
                className="size-4 shrink-0 accent-accent"
              />
              <span>{intent.label}</span>
            </label>
          ))}
        </div>
        {otherError && (
          <p role="alert" className="mt-2 text-xs text-danger">
            {otherError}
          </p>
        )}
      </fieldset>

      <AuthButton pending={pending} pendingLabel="Creating account…">
        Create account
      </AuthButton>
    </form>
  );
}
