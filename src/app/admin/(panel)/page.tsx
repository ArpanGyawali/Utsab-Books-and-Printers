import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";

/** Dashboard — the numbers the owner acts on, each linking to its screen. */
export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [books, outOfStock, waiting, quotes] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }),
    supabase
      .from("books")
      .select("id", { count: "exact", head: true })
      .eq("status", "out_of_stock"),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("notified", false),
    supabase
      .from("print_quotes")
      .select("id", { count: "exact", head: true })
      .eq("handled", false),
  ]);

  const tiles = [
    { label: "Books listed", value: books.count ?? 0, href: "/admin/books" },
    { label: "Out of stock", value: outOfStock.count ?? 0, href: "/admin/books?status=out_of_stock" },
    { label: "Waiting for a book", value: waiting.count ?? 0, href: "/admin/waiting" },
    { label: "New print quotes", value: quotes.count ?? 0, href: "/admin/quotes" },
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold">Namaste!</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Here is how the shop looks online right now.
      </p>

      <ul className="mt-5 grid grid-cols-2 gap-3">
        {tiles.map(({ label, value, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="block rounded-md border border-[var(--ink-faint)] bg-paper p-4 shadow-[var(--shadow-card)] transition-colors duration-150 hover:bg-paper-shade/60"
            >
              <span className="block text-3xl font-bold tabular-nums">{value}</span>
              <span className="mt-1 block text-sm text-ink-soft">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-2">
        <Link
          href="/admin/books/new"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-accent-deep bg-accent px-4 font-medium text-paper transition-colors duration-150 hover:bg-accent-deep"
        >
          + Add a book
        </Link>
        <Link
          href="/admin/import"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border-[1.5px] border-ink px-4 font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
        >
          Import / export CSV
        </Link>
      </div>
    </>
  );
}
