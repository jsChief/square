import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/squareIcon_1024_2x.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-28 pt-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:pb-10">
        <div>
          <div className="flex items-center font-semibold">
            <Image
              src={logo}
              alt=""
              width={24}
              height={24}
              className="size-6 rounded object-contain mr-2"
            />
            square<span className="text-accent">.</span>
          </div>
          <p className="mt-2 max-w-xs text-sm text-muted">
            The easy way to find and pick up what you need, nearby.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link href="/listings" className="hover:text-foreground">
            Browse all listings
          </Link>
          <Link href="/sell" className="hover:text-foreground">
            Sell
          </Link>
          <Link href="/listings?category=textbooks" className="hover:text-foreground">
            Textbooks
          </Link>
          <Link href="/settings" className="hover:text-foreground">
            Settings
          </Link>
        </div>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} square. Built for the neighborhood.
        </p>
      </div>
    </footer>
  );
}
