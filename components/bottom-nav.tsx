"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Package,
  Plus,
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

const items: BottomNavItem[] = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  {
    href: "/listings",
    label: "Browse",
    icon: Package,
    match: (p) => p.startsWith("/listings"),
  },
  { href: "/sell", label: "Sell", icon: Plus, match: (p) => p.startsWith("/sell") },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (p) => p.startsWith("/dashboard"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    match: (p) => p.startsWith("/settings"),
  },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-[calc(0.875rem+env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 md:hidden"
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
