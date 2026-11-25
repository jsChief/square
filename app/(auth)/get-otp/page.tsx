import { AuthIntro, AuthSwitch, PrototypeNote } from "@/components/auth/auth-ui";
import { GetOtpForm } from "./get-otp-form";

export const metadata = {
  title: "Get a one-time code — square",
  description: "Preview the one-time code step on square.",
};

export default function GetOtpPage() {
  return (
    <>
      <AuthIntro
        title="Get a one-time code"
        description="Enter the email you use on square. We'll show a six-digit code you can use on the next screen."
      />
      <GetOtpForm />
      <AuthSwitch prompt="Prefer the usual route?" href="/login" label="Sign in" />
      <PrototypeNote>
        This is a preview: no code is sent anywhere. The code below is generated
        in your browser and shown on screen.
      </PrototypeNote>
    </>
  );
}
