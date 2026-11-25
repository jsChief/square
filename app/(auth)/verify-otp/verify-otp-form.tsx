"use client";

import Link from "next/link";
import { useSyncExternalStore, useState, type FormEvent } from "react";
import { AuthButton, AuthNotice } from "@/components/auth/auth-ui";
import { OtpInput } from "@/components/auth/otp-input";
import { isPreviewOtp, PREVIEW_OTP_KEY } from "@/lib/preview-otp";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  const stored = sessionStorage.getItem(PREVIEW_OTP_KEY);
  return isPreviewOtp(stored) ? stored : null;
}

function getServerSnapshot() {
  // Render the gate on the server so the page never flashes blank before the
  // client reads the preview code from sessionStorage.
  return null;
}

export function VerifyOtpForm() {
  const expectedCode = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: 6 }, () => ""),
  );
  const [error, setError] = useState<string | undefined>();
  const [verified, setVerified] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = digits.join("");
    if (value.length !== 6) {
      setError("Enter all six digits.");
      return;
    }
    if (!expectedCode || value !== expectedCode) {
      setError("That code does not match the preview code. Try again.");
      return;
    }
    sessionStorage.removeItem(PREVIEW_OTP_KEY);
    setError(undefined);
    setVerified(true);
  }

  if (!expectedCode) {
    return (
      <div className="space-y-6">
        <AuthNotice tone="info" title="Request a code first">
          This preview only accepts a code generated on the previous screen.
        </AuthNotice>
        <Link
          href="/get-otp"
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-accent-contrast transition-colors hover:bg-accent/90"
        >
          Get a preview code
        </Link>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="space-y-6">
        <AuthNotice tone="success" title="Code verified in this preview">
          Nothing was checked against a server. You are ready to continue.
        </AuthNotice>
        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-accent-contrast transition-colors hover:bg-accent/90"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <p className="text-sm font-medium" id="otp-label">
          Six-digit code
        </p>
        <div className="mt-2" role="group" aria-labelledby="otp-label">
          <OtpInput
            value={digits}
            onChange={(next) => {
              setDigits(next);
              setError(undefined);
            }}
            invalid={Boolean(error)}
          />
        </div>
        {error && (
          <p role="alert" className="mt-2 text-xs leading-relaxed text-danger">
            {error}
          </p>
        )}
      </div>

      <AuthButton>Verify code</AuthButton>
    </form>
  );
}
