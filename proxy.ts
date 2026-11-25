import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/sell", "/orders", "/dashboard"];
const PROTECTED_EXACT = [/^\/listings\/[^/]+\/checkout\/?$/];

function isProtected(pathname: string) {
  return (
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) || PROTECTED_EXACT.some((pattern) => pattern.test(pathname))
  );
}

function copyAuthCookies(response: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) response.headers.set(header, value);
  }
  return response;
}

/**
 * Refreshes the Supabase session on every request and provides optimistic
 * redirects for protected pages. Pages and Server Actions still verify the
 * user with getUser()/getClaims(); this is not an authorization boundary.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Verifies the JWT signature and refreshes an expiring session.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && isProtected(request.nextUrl.pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return copyAuthCookies(NextResponse.redirect(loginUrl), supabaseResponse);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
