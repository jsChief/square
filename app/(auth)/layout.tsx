import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/squareIcon_1024_2x.png";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { ThemePicker } from "@/components/theme-picker";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)]">
      <AuthBrandPanel />

      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md py-2 lg:hidden"
          >
            <Image
              src={logo}
              alt=""
              width={26}
              height={26}
              priority
              className="size-6 rounded-md object-contain"
            />
            <span className="text-base font-semibold tracking-tight">
              square<span className="text-accent">.</span>
            </span>
          </Link>
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-md py-2 text-sm text-muted transition-colors hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to square
          </Link>
          <ThemePicker />
        </div>

        <div className="flex flex-1 items-start justify-center px-5 py-10 sm:px-8 sm:py-14 lg:items-center">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
