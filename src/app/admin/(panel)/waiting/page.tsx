import { requireAdmin } from "@/lib/admin/auth";
import { waLinkToCustomer } from "@/lib/inquiry";
import AdminBadge from "@/components/admin/AdminBadge";
import NotifyButton from "@/components/admin/NotifyButton";
import type { BookStatus } from "@/lib/supabase/types";
import { markNotified } from "./actions";

/**
 * Waiting list — the notify-me loop, ordered by booking date (oldest first).
 * Tapping "Notify" opens WhatsApp to the customer with the arrival message
 * prefilled (the owner sends it himself — no SMS gateway, zero cost) and marks
 * the row notified in the same tap. Notified rows sink to the bottom, offer
 * "Notify again", and are auto-deleted 5 days after the last notification.
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
  notified: boolean;
  notified_at: string | null;
  books: WaitingBook | null;
};

const NOTIFIED_TTL_MS = 5 * 24 * 60 * 60 * 1000;

// The customer-facing arrival message is Nepali on purpose (customers browse
// in Nepali; the admin UI language is irrelevant to them). TODO(ne-review)
function arrivalMessage(book: WaitingBook): string {
  const title = book.title_ne || book.title_en;
  return `नमस्ते! तपाईंले खोज्नुभएको किताब "${title}" उत्सव बुक्स एण्ड प्रिन्टर्समा आइपुगेको छ। पसलमै आएर लिन सक्नुहुन्छ। — उत्सव बुक्स, रानीबगिया`;
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const notifyCls =
  "inline-flex min-h-11 shrink-0 items-center rounded-sm border border-accent-deep bg-accent px-3 " +
  "text-sm font-medium text-paper transition-colors duration-150 hover:bg-accent-deep";
const notifyAgainCls =
  "inline-flex min-h-11 shrink-0 items-center rounded-sm border-[1.5px] border-ink px-3 " +
  "text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-shade";

export default async function AdminWaitingPage() {
  const { supabase } = await requireAdmin();

  // Notified entries expire 5 days after the last "Notify" tap — purged here,
  // whenever the owner opens the page (free tier, no cron required).
  await supabase
    .from("inquiries")
    .delete()
    .eq("notified", true)
    .lt("notified_at", new Date(Date.now() - NOTIFIED_TTL_MS).toISOString());

  const { data, error } = await supabase
    .from("inquiries")
    .select(
      "id, phone, created_at, notified, notified_at, books(id, title_en, title_ne, status, classes(name_en))"
    )
    .order("created_at", { ascending: true });

  const rows = ((data ?? []) as unknown as WaitingRow[]).filter((r) => r.books);
  // Booking-date order within each group; notified rows sink to the bottom.
  const ordered = [...rows.filter((r) => !r.notified), ...rows.filter((r) => r.notified)];

  return (
    <>
      <h1 className="text-2xl font-semibold">Waiting list</h1>
      <p className="mt-1 text-sm text-ink-soft">
        People who tapped “notify me”, oldest booking first. Tap Notify —
        WhatsApp opens with the message ready, and the row moves to the bottom
        as notified. Notified entries delete themselves after 5 days.
      </p>

      {error ? (
        <p role="alert" className="mt-6 text-sm font-medium text-outofstock">
          Could not load the waiting list: {error.message}
        </p>
      ) : ordered.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">
          Nobody is waiting right now. New notify-me requests appear here.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {ordered.map((row) => {
            const book = row.books!;
            return (
              <li
                key={row.id}
                className={`rounded-md border border-[var(--ink-faint)] bg-paper p-4 shadow-[var(--shadow-card)] ${
                  row.notified ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold tabular-nums">{row.phone}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-soft">
                      {[book.classes?.name_en, book.title_en, book.title_ne]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      booked {shortDate(row.created_at)}
                      {row.notified && row.notified_at
                        ? ` · notified ${shortDate(row.notified_at)}`
                        : ""}
                    </p>
                  </div>
                  <AdminBadge status={book.status} className="mt-0.5 shrink-0" />
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  {row.notified ? (
                    <p className="text-sm font-medium text-instock">
                      Notified — removed automatically after 5 days.
                    </p>
                  ) : book.status === "in_stock" ? (
                    <p className="text-sm font-medium text-instock">
                      Back in stock — waiting to hear from you.
                    </p>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  <NotifyButton
                    href={waLinkToCustomer(row.phone, arrivalMessage(book))}
                    action={markNotified.bind(null, row.id)}
                    className={row.notified ? notifyAgainCls : notifyCls}
                  >
                    {row.notified ? "Notify again" : "Notify"}
                  </NotifyButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
