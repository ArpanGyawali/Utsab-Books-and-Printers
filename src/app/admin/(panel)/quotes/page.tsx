import { requireAdmin } from "@/lib/admin/auth";
import { waLinkToCustomer } from "@/lib/inquiry";
import { normalizeNepaliMobile } from "@/lib/phone";
import type { PrintQuote } from "@/lib/supabase/types";
import { setQuoteHandled } from "./actions";

/**
 * Print-quote inbox. The customer already opened WhatsApp with the same
 * details when submitting, so this list is the owner's backup/to-do view —
 * reply from here if the customer never pressed send, then mark handled.
 */

const bindingLabels: Record<string, string> = {
  none: "no binding",
  spiral: "spiral",
  book: "book / tape",
};

// Customer-facing reply, Nepali on purpose. TODO(ne-review)
function replyMessage(q: PrintQuote): string {
  return `नमस्ते ${q.name} जी! उत्सव बुक्स एण्ड प्रिन्टर्सबाट — तपाईंको प्रिन्टको काम ("${q.description.slice(0, 80)}") बारे कुरा गर्न यो म्यासेज गरेको। फाइल यहीँ पठाउनुहोस्, मूल्य भनिहाल्छु।`;
}

function QuoteCard({ quote }: { quote: PrintQuote }) {
  const phone = normalizeNepaliMobile(quote.phone);
  return (
    <li
      className={`rounded-md border border-[var(--ink-faint)] bg-paper p-4 shadow-[var(--shadow-card)] ${
        quote.handled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold">{quote.name}</h2>
          <p className="text-sm tabular-nums text-ink-soft">{quote.phone}</p>
        </div>
        <span className="shrink-0 text-xs text-ink-soft">
          {new Date(quote.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm">{quote.description}</p>
      {quote.binding ? (
        <p className="mt-1 text-sm text-ink-soft">
          Binding: {bindingLabels[quote.binding] ?? quote.binding}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {phone ? (
          <a
            href={waLinkToCustomer(phone, replyMessage(quote))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-3 text-sm font-medium text-paper transition-colors duration-150 hover:bg-accent-deep"
          >
            Reply on WhatsApp
          </a>
        ) : (
          <a
            href={`tel:${quote.phone.replace(/[^+\d]/g, "")}`}
            className="inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-3 text-sm font-medium text-paper transition-colors duration-150 hover:bg-accent-deep"
          >
            Call {quote.phone}
          </a>
        )}
        <form action={setQuoteHandled}>
          <input type="hidden" name="id" value={quote.id} />
          <input type="hidden" name="handled" value={quote.handled ? "false" : "true"} />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-ink px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
          >
            {quote.handled ? "Mark as new" : "Mark handled"}
          </button>
        </form>
      </div>
    </li>
  );
}

export default async function AdminQuotesPage() {
  const { supabase } = await requireAdmin();

  const [{ data: open, error }, { data: recentHandled }] = await Promise.all([
    supabase
      .from("print_quotes")
      .select("*")
      .eq("handled", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("print_quotes")
      .select("*")
      .eq("handled", true)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <>
      <h1 className="text-2xl font-semibold">Print quotes</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Jobs sent from the website's quote form. Most customers also opened
        WhatsApp themselves — check there first, then mark handled here.
      </p>

      {error ? (
        <p role="alert" className="mt-6 text-sm font-medium text-outofstock">
          Could not load quotes: {error.message}
        </p>
      ) : !open?.length ? (
        <p className="mt-6 text-sm text-ink-soft">No new quote requests.</p>
      ) : (
        <ul className="mt-5 grid gap-4">
          {open.map((q) => (
            <QuoteCard key={q.id} quote={q} />
          ))}
        </ul>
      )}

      {recentHandled?.length ? (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium text-ink-soft">
            Recently handled ({recentHandled.length})
          </summary>
          <ul className="mt-3 grid gap-4">
            {recentHandled.map((q) => (
              <QuoteCard key={q.id} quote={q} />
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}
