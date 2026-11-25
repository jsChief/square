import { AuthIntro, AuthSwitch, PrototypeNote } from "@/components/auth/auth-ui";
import { VerifyOtpForm } from "./verify-otp-form";

export const metadata = {
  title: "Enter your code — square",
  description: "Preview the one-time code verification step on square.",
};

export default function VerifyOtpPage() {
  return (
    <>
      <AuthIntro
        title="Enter your code"
        description="Type the six digits from the previous screen. Paste works too."
      />
      <VerifyOtpForm />
      <AuthSwitch prompt="Need a new code?" href="/get-otp" label="Get another code" />
      <PrototypeNote>
        Verification is local to this preview. No code is checked against a
        server and nothing is stored.
      </PrototypeNote>
    </>
  );
}
