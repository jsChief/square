"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Plus } from "lucide-react";
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

export function SiteHeader({ viewer }: { viewer: ViewerState }) {
  const pathname = usePathname();
  const showSearch = pathname !== "/";

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

        {showSearch && (
          <div className="ml-auto hidden w-full max-w-64 xl:block">
            <SearchBar compact />
          </div>
        )}

        <Link
          href="/dashboard/listings/new"
          aria-label="Sell an item"
          aria-current={pathname === "/dashboard/listings/new" ? "page" : undefined}
          className={cn(
            "ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90",
            showSearch && "xl:ml-0",
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
      </div>
    </header>
  );
}
