"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Star,
  Store,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile-avatar";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "Listings", icon: Package },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/stores", label: "Stores", icon: Store },
];

export function DashboardNav({
  userId,
  userName,
  userAvatarUrl,
}: {
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
}) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    return item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
          <ProfileAvatar
            userId={userId}
            src={userAvatarUrl}
            name={userName}
            size="lg"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="mt-0.5 text-xs text-muted">Seller account</p>
          </div>
        </div>

        <nav aria-label="Dashboard" className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="mt-6 border-t border-line pt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-danger"
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </aside>

      {/* Mobile pill nav */}
      <nav
        aria-label="Dashboard"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
      >
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                active
                  ? "border-accent bg-accent text-accent-contrast"
                  : "border-line bg-surface text-muted hover:border-accent hover:text-accent",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
