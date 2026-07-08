import { requireAdmin } from "@/lib/admin/auth";
import { waLinkToCustomer } from "@/lib/inquiry";
import AdminBadge from "@/components/admin/AdminBadge";
import type { BookStatus } from "@/lib/supabase/types";
import { markBookNotified, markNotified } from "./actions";

/**
 * Waiting list — the notify-me loop. Waiters are grouped by book; books that
 * are back IN STOCK float to the top: those are the ones to message now.
 * "Notify" opens WhatsApp to the customer with the arrival message prefilled;
 * the owner sends it himself (no SMS gateway, zero cost).
 */

type WaitingBook = {
  id: string;
  title_en: string;
  title_ne: string | null;
  status: BookStatus;
  classes: { name_en: string } | null;
};

type WaitingRow = {
  id: string;
  phone: string;
  created_at: string;
  books: WaitingBook | null;
};

// The customer-facing arrival message is Nepali on purpose (customers browse
// in Nepali; the admin UI language is irrelevant to them). TODO(ne-review)
function arrivalMessage(book: WaitingBook): string {
  const title = book.title_ne || book.title_en;
  return `नमस्ते! तपाईंले खोज्नुभएको किताब "${title}" उत्सव बुक्स एण्ड प्रिन्टर्समा आइपुगेको छ। पसलमै आएर लिन सक्नुहुन्छ। — उत्सव बुक्स, रानीबगिया`;
}

const statusRank: Record<BookStatus, number> = {
  in_stock: 0,
  arriving: 1,
  out_of_stock: 2,
};

export default async function AdminWaitingPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("inquiries")
    .select("id, phone, created_at, books(id, title_en, title_ne, status, classes(name_en))")
    .eq("notified", false)
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as WaitingRow[];
  const groups = new Map<string, { book: WaitingBook; waiters: WaitingRow[] }>();
  for (const row of rows) {
    if (!row.books) continue;
    const group = groups.get(row.books.id) ?? { book: row.books, waiters: [] };
    group.waiters.push(row);
    groups.set(row.books.id, group);
  }
  const sorted = [...groups.values()].sort(
    (a, b) =>
      statusRank[a.book.status] - statusRank[b.book.status] ||
      b.waiters.length - a.waiters.length
  );

  return (
    <>
      <h1 className="text-2xl font-semibold">Waiting list</h1>
      <p className="mt-1 text-sm text-ink-soft">
        People who tapped “notify me”. When a book is back in stock it moves to
        the top — message each person, then tick them off.
      </p>

      {error ? (
        <p role="alert" className="mt-6 text-sm font-medium text-outofstock">
          Could not load the waiting list: {error.message}
        </p>
      ) : sorted.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">
          Nobody is waiting right now. New notify-me requests appear here.
        </p>
      ) : (
        <ul className="mt-5 grid gap-4">
          {sorted.map(({ book, waiters }) => (
            <li
              key={book.id}
              className="rounded-md border border-[var(--ink-faint)] bg-paper p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{book.title_en}</h2>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {[book.classes?.name_en, book.title_ne].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <AdminBadge status={book.status} className="mt-0.5 shrink-0" />
              </div>

              {book.status === "in_stock" ? (
                <p className="mt-2 text-sm font-medium text-instock">
                  Back in stock — {waiters.length} waiting to hear from you.
                </p>
              ) : null}

              <ul className="mt-3 divide-y divide-[var(--ink-faint)]">
                {waiters.map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="text-sm">
                      <span className="font-medium tabular-nums">{w.phone}</span>
                      <span className="ml-2 text-xs text-ink-soft">
                        since {new Date(w.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <a
                        href={waLinkToCustomer(w.phone, arrivalMessage(book))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-3 text-sm font-medium text-paper transition-colors duration-150 hover:bg-accent-deep"
                      >
                        Notify
                      </a>
                      <form action={markNotified}>
                        <input type="hidden" name="id" value={w.id} />
                        <button
                          type="submit"
                          title="Mark as notified"
                          className="inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-ink px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
                        >
                          Done
                        </button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>

              {waiters.length > 1 ? (
                <form action={markBookNotified} className="mt-2 text-right">
                  <input type="hidden" name="book_id" value={book.id} />
                  <button
                    type="submit"
                    className="min-h-11 rounded-sm px-2 text-sm font-medium text-ink-soft underline hover:text-ink"
                  >
                    Mark all {waiters.length} as notified
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
