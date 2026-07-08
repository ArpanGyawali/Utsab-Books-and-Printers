import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

/** Paths under /admin that must stay reachable while logged out. */
const ADMIN_PUBLIC = ["/admin/login", "/admin/auth/callback"];

/**
 * /admin/** — refresh the Supabase session cookie and require the admin user.
 * First line of defense only: the admin layout, every server action, and every
 * route handler re-check via requireAdmin(), and RLS enforces in Postgres.
 */
async function adminGuard(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // getUser() revalidates the token with the auth server (refreshing it if
  // expired) — never trust the cookie contents alone.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isAdmin = Boolean(
    admin && user?.email && user.email.trim().toLowerCase() === admin
  );

  if (ADMIN_PUBLIC.includes(request.nextUrl.pathname)) {
    return isAdmin
      ? NextResponse.redirect(new URL("/admin", request.url))
      : response;
  }
  if (!isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return response;
}

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminGuard(request);
  }
  return intl(request);
}

export const config = {
  // Everything except API routes, Next internals, and static files.
  // /admin intentionally matches — the guard above handles it.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
