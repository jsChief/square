import { displayName, getProfile, requireUser } from "@/lib/auth/session";
import { getSellerStores } from "@/lib/seller/queries";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/dashboard");
  const [profile, stores] = await Promise.all([
    getProfile(),
    getSellerStores(user.id),
  ]);
  const primary = stores[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <DashboardNav
          userId={user.id}
          userName={displayName(user, profile)}
          userAvatarUrl={profile?.avatar_url ?? null}
          storeName={primary?.name ?? null}
          storeLocation={primary?.location ?? null}
          storeCount={stores.length}
        />
        <div className="mt-6 min-w-0 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
