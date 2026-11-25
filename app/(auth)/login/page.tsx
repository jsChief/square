import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthIntro, AuthNotice, AuthSwitch } from "@/components/auth/auth-ui";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in — square",
  description: "Sign in to your square account to buy and sell nearby.",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

function safeDestination(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/sell";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  const destination = safeDestination(next);

  const user = await getCurrentUser();
  if (user) redirect(destination);

  return (
    <>
      <AuthIntro
        title="Sign in to square"
        description="Use the email and password for your square account to continue."
      />
      {error && (
        <div className="mb-6">
          <AuthNotice tone="error" title={error} />
        </div>
      )}
      <LoginForm next={destination} />
      <AuthSwitch
        prompt="New around here?"
        href="/signup"
        label="Create an account"
      />
      <p className="mt-4 text-sm text-muted">
        Just browsing?{" "}
        <Link
          href="/listings"
          className="font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
        >
          Browse listings
        </Link>
      </p>
    </>
  );
}
