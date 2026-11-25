import { redirect } from "next/navigation";
import { AuthIntro, AuthNotice, AuthSwitch } from "@/components/auth/auth-ui";
import { getCurrentUser } from "@/lib/auth/session";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Create an account — square",
  description: "Get started selling and buying locally on square.",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/sell");

  return (
    <>
      <AuthIntro
        title="Get started on square"
        description="Create an account to list items, buy nearby, and keep track of your orders."
      />
      <SignupForm />
      <AuthSwitch prompt="Already have access?" href="/login" label="Sign in" />
      <div className="mt-8">
        <AuthNotice tone="info" title="Email confirmation">
          We send a confirmation link to protect your account and your payments.
        </AuthNotice>
      </div>
    </>
  );
}
