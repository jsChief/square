import { AuthIntro, AuthSwitch } from "@/components/auth/auth-ui";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Reset your password — square",
  description: "Start the password reset flow on square.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthIntro
        title="Reset your password"
        description="Enter the email you use on square. We'll send you a secure reset link."
      />
      <ForgotPasswordForm />
      <AuthSwitch prompt="Remembered it?" href="/login" label="Back to sign in" />
    </>
  );
}
