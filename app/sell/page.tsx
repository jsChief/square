import { signOut } from "@/lib/auth-actions";
import { displayName, getProfile, requireUser } from "@/lib/auth/session";
import { SellForm } from "@/components/sell-form";

export const metadata = {
  title: "Sell an item — square",
  description: "List something you no longer need and let AI help write the description.",
};

export default async function SellPage() {
  const user = await requireUser("/sell");
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
        <span className="text-muted">
          Signed in as{" "}
          <span className="font-medium text-foreground">
            {displayName(user, profile)}
          </span>
        </span>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          List something on square
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">
          A few details is all it takes. Our AI can draft the description for
          you — just review and publish.
        </p>
      </div>
      <div className="mt-10">
        <SellForm />
      </div>
    </div>
  );
}
