import { AuthIntro, AuthNotice } from "@/components/auth/auth-ui";
import { ConfirmEmailPanel } from "./confirm-email-panel";

export const metadata = {
  title: "Confirm your email — square",
  description: "Confirm the email address for your square account.",
};

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const address = typeof email === "string" && email.length <= 254 ? email : "";

  return (
    <>
      <AuthIntro
        title="Confirm your email"
        description="One quick step before you start buying and selling."
      />
      <ConfirmEmailPanel email={address} />
      <div className="mt-8">
        <AuthNotice tone="info" title="Need help?">
          Check your spam folder, or create a new account with a different email
          address if the link never arrives.
        </AuthNotice>
      </div>
    </>
  );
}
