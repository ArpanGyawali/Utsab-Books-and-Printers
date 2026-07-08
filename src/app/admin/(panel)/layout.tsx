import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { supabaseSession } from "@/lib/supabase/ssr";
import AdminNav from "@/components/admin/AdminNav";

/** Shell for every admin screen. The guard here backs up proxy.ts. */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  async function logout() {
    "use server";
    const supabase = await supabaseSession();
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-[var(--ink-faint)] bg-paper-shade/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <span className="stamp-border inline-block -rotate-1 select-none px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--stamp)]">
            Utsab Books · Admin
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="min-h-11 rounded-sm border-[1.5px] border-ink px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
            >
              Log out
            </button>
          </form>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>
    </div>
  );
}
