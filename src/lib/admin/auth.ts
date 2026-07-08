import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabaseSession } from "@/lib/supabase/ssr";
import type { Database } from "@/lib/supabase/types";

/**
 * Admin authorization. Defense in depth, per the Next.js data-security guide:
 * proxy.ts gates /admin/** early, every server action and route handler calls
 * requireAdmin() itself, and RLS `is_admin()` policies enforce the same rule
 * inside Postgres for anything running on the session client.
 */

export function isAdminEmail(email: string | null | undefined): boolean {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(admin && email && email.trim().toLowerCase() === admin);
}

export type AdminContext = {
  /** Session-bound client — queries run under RLS as the admin user. */
  supabase: SupabaseClient<Database>;
  user: User;
};

/**
 * Verifies the current session belongs to the admin (getUser() revalidates
 * the JWT against the auth server — never trusts the cookie alone) or
 * redirects to the login page.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await supabaseSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/admin/login");
  }
  return { supabase, user };
}
