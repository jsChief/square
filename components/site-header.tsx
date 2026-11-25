"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogIn, Plus } from "lucide-react";
import logo from "@/assets/squareIcon_1024_2x.png";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "./profile-avatar";
import { SearchBar } from "./search-bar";

export interface ViewerState {
  signedIn: boolean;
  id: string | null;
  hasListings: boolean;
  name: string;
  avatarUrl: string | null;
}

interface NavLink {
  href: string;
  label: string;
  match?: (pathname: string) => boolean;
}

const sellingLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", match: (p) => p === "/dashboard" },
  {
    href: "/dashboard/listings",
    label: "Your listings",
    match: (p) => p.startsWith("/dashboard/listings"),
  },
  {
    href: "/dashboard/orders",
    label: "Sales orders",
    match: (p) => p.startsWith("/dashboard/orders"),
  },
  {
    href: "/dashboard/reviews",
    label: "Reviews",
    match: (p) => p.startsWith("/dashboard/reviews"),
  },
];

export function SiteHeader({ viewer }: { viewer: ViewerState }) {
  const pathname = usePathname();
  const showSearch = pathname !== "/";

  const baseLinks: NavLink[] = [
    {
      href: "/listings",
      label: "Browse listings",
      match: (p) => p.startsWith("/listings"),
    },
    ...(viewer.signedIn
      ? [
          {
            href: "/orders",
            label: "Your orders",
            match: (p: string) => p.startsWith("/orders"),
          },
        ]
      : []),
    { href: "/#how-it-works", label: "How it works" },
  ];

  const sellingActive = sellingLinks.some((link) => link.match?.(pathname));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 py-2">
          <Image
            src={logo}
            alt=""
            width={28}
            height={28}
            priority
            className="size-7 rounded-md object-contain"
          />
          <span className="hidden text-lg font-semibold tracking-tight min-[360px]:inline">
            square<span className="text-accent">.</span>
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-1 text-sm text-muted lg:flex"
        >
          {baseLinks.map((link) => {
            const active = link.match?.(pathname) ?? false;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {viewer.hasListings ? (
            <details className="relative">
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-2 transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden",
                  sellingActive && "text-foreground",
                )}
              >
                Selling
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </summary>
              <div className="absolute left-0 top-11 z-50 w-44 rounded-xl border border-line bg-surface p-2 shadow-lg">
                {sellingLinks.map((link) => {
                  const active = link.match?.(pathname) ?? false;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block rounded-lg px-3 py-2.5 transition-colors hover:bg-background",
                        active ? "font-medium text-accent" : "text-muted",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          ) : viewer.signedIn ? (
            <Link
              href="/sell"
              aria-current={pathname.startsWith("/sell") ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-2 transition-colors hover:text-foreground",
                pathname.startsWith("/sell") && "text-foreground",
              )}
            >
              Start selling
            </Link>
          ) : null}
        </nav>

        {showSearch && (
          <div className="ml-auto hidden w-full max-w-64 xl:block">
            <SearchBar compact />
          </div>
        )}

        <Link
          href="/sell"
          aria-label="Sell an item"
          aria-current={pathname === "/sell" ? "page" : undefined}
          className={cn(
            "ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90",
            showSearch && "sm:ml-0",
          )}
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sell an item</span>
        </Link>

        {viewer.signedIn ? (
          <ProfileAvatar
            userId={viewer.id}
            src={viewer.avatarUrl}
            name={viewer.name}
            size="md"
          />
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 text-xs font-medium text-accent-contrast transition-colors hover:bg-accent/90 active:scale-[0.97] sm:px-4 sm:text-sm"
          >
            <LogIn className="size-3.5 sm:size-4" aria-hidden="true" />
            Log in
          </Link>
        )}

        <details className="relative lg:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-line text-muted [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Open menu</span>
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute right-0 top-12 w-52 rounded-xl border border-line bg-surface p-2 text-sm shadow-lg"
          >
            {baseLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-3 hover:bg-background"
              >
                {link.label}
              </Link>
            ))}
            {viewer.signedIn && (
              <div className="mt-2 border-t border-line pt-2">
                <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                  Selling
                </p>
                {viewer.hasListings ? (
                  sellingLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-lg px-3 py-3 hover:bg-background"
                    >
                      {link.label}
                    </Link>
                  ))
                ) : (
                  <Link
                    href="/sell"
                    className="block rounded-lg px-3 py-3 hover:bg-background"
                  >
                    Start selling
                  </Link>
                )}
              </div>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}
