import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  GraduationCap,
  IdCard,
  LogOut,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ProfileDetailsForm } from "@/components/profile/profile-details-form";
import { signOut } from "@/lib/auth-actions";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import { getPublicProfileById } from "@/lib/profiles/queries";

export const metadata: Metadata = {
  title: "Profile — square",
  description: "View a square member's profile and manage your own details.",
};

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const profile = await getPublicProfileById(id);
  if (!profile) notFound();

  const currentUser = await getCurrentUser();
  const ownProfile = currentUser ? await getProfile() : null;
  const isOwner = Boolean(
    ownProfile &&
      (ownProfile.id === id || ownProfile.user_id === id || currentUser?.id === id),
  );

  const name = profile.username?.trim() || "square member";
  const university = profile.university?.trim();
  const accountType = profile.account_type
    ?.trim()
    .replace(/[_-]+/g, " ");
  const verified =
    profile.student_email_verified === true ||
    profile.verification_status?.trim().toLowerCase() === "verified";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 rounded-md py-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to listings
        </Link>
        {isOwner && (
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Sign out
            </button>
          </form>
        )}
      </div>

      <section className="mt-7 overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="h-24 bg-gradient-to-br from-accent-soft via-surface to-background" />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar
              src={profile.avatar_url}
              name={name}
              size="xl"
              className="ring-4 ring-surface"
            />
            <div className="min-w-0 pb-1">
              <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                {name}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {isOwner ? "Your square profile" : "square member"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Verified
              </span>
            )}
            {university && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
                <GraduationCap className="size-3.5" aria-hidden="true" />
                {university}
              </span>
            )}
            {accountType && (
              <span className="rounded-full border border-line px-3 py-1.5 text-xs capitalize text-muted">
                {accountType}
              </span>
            )}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="profile-details-heading"
        className="mt-9 rounded-3xl border border-line bg-surface p-5 sm:p-7"
      >
        <div>
          <h2
            id="profile-details-heading"
            className="text-xl font-semibold tracking-tight"
          >
            {isOwner ? "Your details" : `About ${name}`}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {isOwner
              ? "Keep your details current so neighbours know who they’re meeting."
              : "Details this member has chosen to share on square."}
          </p>
        </div>

        {isOwner ? (
          <ProfileDetailsForm
            values={{
              username: ownProfile?.username?.trim() || name,
              university: ownProfile?.university?.trim() || university || "",
              matric: ownProfile?.matric?.trim() || "",
              phone: ownProfile?.phone?.trim() || "",
              address: ownProfile?.address?.trim() || "",
            }}
          />
        ) : (
          <dl className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                University
              </dt>
              <dd className="mt-1.5 flex items-center gap-2 text-sm text-foreground">
                <GraduationCap className="size-4 shrink-0 text-muted" aria-hidden="true" />
                {university || "Not added"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                Account type
              </dt>
              <dd className="mt-1.5 flex items-center gap-2 text-sm text-foreground">
                <IdCard className="size-4 shrink-0 text-muted" aria-hidden="true" />
                <span className="capitalize">{accountType || "Member"}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                Verification
              </dt>
              <dd className="mt-1.5 flex items-center gap-2 text-sm text-foreground">
                <BadgeCheck className="size-4 shrink-0 text-muted" aria-hidden="true" />
                {verified ? "Verified member" : "Not verified"}
              </dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}
