"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Plus,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
}

export function BottomNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname() ?? "";

  const homeItem: BottomNavItem = {
    href: signedIn ? "/listings" : "/",
    label: "Home",
    icon: Home,
    match: signedIn ? (p) => p.startsWith("/listings") : (p) => p === "/",
  };
  const settingsItem: BottomNavItem = {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    match: (p) => p.startsWith("/settings"),
  };

  const items: BottomNavItem[] = signedIn
    ? [
        homeItem,
        {
          href: "/orders",
          label: "Orders",
          icon: Receipt,
          match: (p) => p === "/orders" || p.startsWith("/orders/"),
        },
        {
          href: "/dashboard/listings/new",
          label: "Sell",
          icon: Plus,
          match: (p) => p === "/dashboard/listings/new" || p === "/sell",
        },
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          match: (p) => p.startsWith("/dashboard"),
        },
        settingsItem,
      ]
    : [homeItem, settingsItem];

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-[calc(0.875rem+env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:max-w-md lg:max-w-lg"
    >
      <div className="flex items-stretch justify-between rounded-full border border-line bg-surface/90 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur-xl">
        {items.map((item) => {
          const active = item.match?.(pathname) ?? pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-1.5 text-[10px] font-medium sm:text-[11px]",
                "transition-[color,background-color,transform] duration-150 ease-out active:scale-95",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
