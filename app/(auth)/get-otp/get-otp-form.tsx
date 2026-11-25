"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AuthButton,
  AuthField,
  AuthNotice,
} from "@/components/auth/auth-ui";
import { PREVIEW_OTP_KEY } from "@/lib/preview-otp";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function GetOtpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [code, setCode] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!emailPattern.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    const nextCode = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem(PREVIEW_OTP_KEY, nextCode);
    setError(undefined);
    setCode(nextCode);
  }

  if (code) {
    return (
      <div className="space-y-6">
        <AuthNotice tone="success" title={`Preview code for ${email.trim()}`}>
          Copy this code into the next step. It is not sent or stored.
        </AuthNotice>
        <p className="text-center text-3xl font-semibold tracking-[0.24em] tabular-nums">
          {code}
        </p>
        <button
          type="button"
          onClick={() => router.push("/verify-otp")}
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-accent-contrast transition-colors hover:bg-accent/90"
        >
          Enter this code
        </button>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(PREVIEW_OTP_KEY);
            setCode(null);
          }}
          className="mx-auto block text-sm font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <AuthField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="alex@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error}
        required
      />
      <AuthButton>Get code</AuthButton>
    </form>
  );
}
