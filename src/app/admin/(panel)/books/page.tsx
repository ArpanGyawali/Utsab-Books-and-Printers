import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { coverUrl } from "@/lib/books";
import AdminBadge from "@/components/admin/AdminBadge";
import type { BookStatus } from "@/lib/supabase/types";

/** Searchable books list → tap a row to edit. Same search column as public. */

const STATUS_FILTERS: { value: BookStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "in_stock", label: "In stock" },
  { value: "arriving", label: "Arriving" },
  { value: "out_of_stock", label: "Out of stock" },
];

function sanitizeQuery(q: string): string {
  return q.replace(/[%_,.()"'\\*]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const q = sanitizeQuery(params.q ?? "");
  const status = (
    ["in_stock", "arriving", "out_of_stock"] as const
  ).find((s) => s === params.status);

  let query = supabase
    .from("books")
    .select("*, classes(name_en)")
    .order("class_id")
    .order("subject")
    .order("title_en")
    .limit(500);
  if (q) query = query.ilike("search", `%${q}%`);
  if (status) query = query.eq("status", status);

  const { data: books, error } = await query;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Books</h1>
        <Link
          href="/admin/books/new"
          className="inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-4 text-sm font-medium text-paper transition-colors duration-150 hover:bg-accent-deep"
        >
          + Add book
        </Link>
      </div>

      <form className="mt-4 flex gap-2" action="/admin/books" method="get">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search title, subject, publisher…"
          className="w-full rounded-sm border-[1.5px] border-[var(--ink-faint)] bg-paper px-3 py-2.5 text-ink placeholder:text-ink-soft/60 focus-visible:border-ink"
        />
        <button
          type="submit"
          className="min-h-11 shrink-0 rounded-sm border-[1.5px] border-ink px-4 text-sm font-medium hover:bg-paper-shade"
        >
          Search
        </button>
      </form>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(({ value, label }) => {
          const active = (status ?? "") === value;
          const href = `/admin/books?${new URLSearchParams({
            ...(q ? { q } : {}),
            ...(value ? { status: value } : {}),
          })}`;
          return (
            <Link
              key={label}
              href={href}
              className={`inline-flex min-h-9 shrink-0 items-center rounded-sm border-[1.5px] px-3 text-sm font-medium transition-colors duration-150 ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-[var(--ink-faint)] text-ink-soft hover:bg-paper-shade"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-6 text-sm font-medium text-outofstock">
          Could not load books: {error.message}
        </p>
      ) : !books?.length ? (
        <p className="mt-6 text-sm text-ink-soft">
          {q || status ? "Nothing matches that search." : "No books yet — add one or import a CSV."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--ink-faint)] rounded-md border border-[var(--ink-faint)] bg-paper">
          {books.map((book) => {
            const cover = coverUrl(book);
            return (
              <li key={book.id}>
                <Link
                  href={`/admin/books/${book.id}`}
                  className="flex min-h-11 items-center gap-3 p-3 transition-colors duration-150 hover:bg-paper-shade/60"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      width={36}
                      height={48}
                      sizes="36px"
                      className="h-12 w-9 shrink-0 rounded-sm border border-[var(--ink-faint)] object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-9 shrink-0 select-none items-center justify-center rounded-sm border border-dashed border-[var(--ink-faint)] bg-paper-shade/70 text-lg font-semibold text-ink-soft/35"
                    >
                      {book.title_en.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{book.title_en}</span>
                    <span className="block truncate text-sm text-ink-soft">
                      {[
                        book.classes?.name_en,
                        book.subject,
                        book.price !== null ? `Rs. ${Number(book.price)}` : "Ask",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <AdminBadge status={book.status} />
                    {book.status === "in_stock" ? (
                      <span className="mt-1 block text-xs tabular-nums text-ink-soft">
                        {book.units} pcs
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
