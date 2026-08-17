import InquireLink from "./InquireLink";
import Reveal from "./motion/Reveal";
import { waLink } from "@/lib/inquiry";

/**
 * "Never a dead end" — the WhatsApp fallback shown whenever a catalog list is
 * empty or the DB is unreachable. Shared by Look-for-Book and the stationery
 * showcase; the copy is passed in so each page speaks in its own voice.
 */
export default function AskInstead({
  heading,
  cta,
  message,
  query,
}: {
  heading: string;
  cta: string;
  message: string;
  query: string;
}) {
  return (
    <Reveal className="mt-10 rounded-md border-[1.5px] border-dashed border-[var(--ink-faint)] p-6 text-center">
      <p className="text-ink-soft">{heading}</p>
      <InquireLink
        href={waLink(message)}
        title={query}
        source="no_results"
        className="lift mt-4 inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-5 py-2 font-medium text-paper shadow-[var(--shadow-card)] hover:bg-accent-deep"
      >
        {cta}
      </InquireLink>
    </Reveal>
  );
}
