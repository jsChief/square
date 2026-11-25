"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

const authRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
  "/get-otp",
  "/verify-otp",
];

/**
 * Auth screens get their own compact shell, so the marketplace header and
 * footer are suppressed there. Passing them in as props keeps them server
 * rendered everywhere else.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isAuth = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>
      {!isAuth && header}
      <main id="main" className="flex-1">
        {children}
      </main>
      {!isAuth && footer}
      {!isAuth && <BottomNav />}
    </div>
  );
}
