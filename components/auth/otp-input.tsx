"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({
  value,
  onChange,
  invalid = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  invalid?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function update(index: number, digit: string) {
    const next = [...value];
    next[index] = digit;
    onChange(next);
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    if (digits.length === 0) return;
    event.preventDefault();
    const next = Array.from({ length: 6 }, (_, index) => digits[index] ?? "");
    onChange(next);
    refs.current[Math.min(digits.length, 5)]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          aria-label={`Digit ${index + 1} of 6`}
          aria-invalid={invalid || undefined}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[index] ?? ""}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            if (digits.length > 1) {
              digits
                .slice(0, 6 - index)
                .split("")
                .forEach((digit, offset) => update(index + offset, digit));
              refs.current[Math.min(index + digits.length, 5)]?.focus();
              return;
            }
            update(index, digits);
            if (digits && index < 5) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className={cn(
            "h-12 min-w-0 rounded-xl border border-line bg-surface text-center text-xl font-medium tabular-nums text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15",
            invalid && "border-danger/50 focus:border-danger focus:ring-danger/15",
          )}
        />
      ))}
    </div>
  );
}
