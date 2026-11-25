import { AuthIntro, AuthSwitch } from "@/components/auth/auth-ui";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Choose a new password — square",
  description: "Choose a new password for your square account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const address = typeof email === "string" && email.length <= 254 ? email : "";

  return (
    <>
      <AuthIntro
        title="Choose a new password"
        description={
          address
            ? `Setting a new password for ${address}.`
            : "Open the reset link from your email to set a new password."
        }
      />
      <ResetPasswordForm />
      <AuthSwitch prompt="Back to where you started?" href="/login" label="Sign in" />
    </>
  );
}
