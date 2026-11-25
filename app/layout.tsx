import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { displayName, getProfile } from "@/lib/auth/session";
import { getSellerProducts, getSellerStores } from "@/lib/seller/queries";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "square — buy and sell nearby",
  description:
    "Find textbooks, tech, furniture, and more from people near campus. Search, pick your deal, and arrange an easy local pickup.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  let signedIn = false;
  let userId: string | null = null;
  let hasListings = false;
  let name = "";
  let avatarUrl: string | null = null;
  if (data.user) {
    signedIn = true;
    userId = data.user.id;
    const profile = await getProfile();
    name = displayName(data.user, profile);
    avatarUrl = profile?.avatar_url ?? null;
    const stores = await getSellerStores(data.user.id);
    if (stores.length > 0) {
      const products = await getSellerProducts(stores.map((store) => store.id));
      hasListings = products.length > 0;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <ThemeProvider>
          <SiteChrome
            header={<SiteHeader viewer={{ signedIn, id: userId, hasListings, name, avatarUrl }} />}
            footer={<SiteFooter />}
          >
            {children}
          </SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
