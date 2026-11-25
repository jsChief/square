import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Info,
  LoaderCircle,
} from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export function AuthIntro({
  title,
  description,
}: {
  title: string;
  description: ReactNode;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-balance sm:text-[2.25rem]">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted sm:text-base">
        {description}
      </p>
    </header>
  );
}

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function AuthField({
  id,
  label,
  hint,
  error,
  className,
  ...inputProps
}: AuthFieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "mt-2 h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted hover:border-foreground/25 focus:border-accent focus:ring-2 focus:ring-accent/15",
          error && "border-danger/50 focus:border-danger focus:ring-danger/15",
          className,
        )}
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-danger"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthButton({
  children,
  pending = false,
  pendingLabel = "One moment…",
  className,
  ...buttonProps
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  pendingLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending || buttonProps.disabled}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-[15px] font-medium text-accent-contrast transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...buttonProps}
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="size-4" aria-hidden="true" />
        </>
      )}
    </button>
  );
}

export function AuthNotice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "error";
  title: string;
  children?: ReactNode;
}) {
  const Icon =
    tone === "success" ? CircleCheck : tone === "error" ? CircleAlert : Info;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm leading-relaxed",
        tone === "success" && "border-accent/30 bg-accent-soft",
        tone === "info" && "border-line bg-surface",
        tone === "error" && "border-danger/30 bg-danger/5",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "error" ? "text-danger" : "text-accent",
        )}
        aria-hidden="true"
      />
      <div>
        <p className="font-medium">{title}</p>
        {children && <div className="mt-1 text-muted">{children}</div>}
      </div>
    </div>
  );
}

export function AuthSwitch({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-8 text-sm text-muted">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
      >
        {label}
      </Link>
    </p>
  );
}

export function PrototypeNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted">
      <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
