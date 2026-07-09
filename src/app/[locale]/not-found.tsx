import { useTranslations } from "next-intl";
import Container from "@/components/Container";
import InkAccent from "@/components/InkAccent";
import { Link } from "@/i18n/navigation";

/**
 * Locale-aware 404 — rendered for notFound() anywhere under [locale],
 * including the [...rest] catch-all for URLs that match no route.
 */
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <Container className="py-20 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">
        {t("kicker")}
      </p>
      <h1 className="mt-2 text-3xl font-semibold [font-family:var(--font-heading)]">
        {t("title")}
      </h1>
      <div className="mx-auto mt-8 max-w-md rounded-md border-[1.5px] border-dashed border-[var(--ink-faint)] p-6">
        <InkAccent variant="book" className="mx-auto h-10 w-10 text-ink-soft" />
        <p className="mt-3 text-ink-soft">{t("body")}</p>
        <Link
          href="/books"
          className="mt-5 inline-flex min-h-11 items-center rounded-sm border border-accent-deep bg-accent px-5 py-2 font-medium text-paper shadow-[var(--shadow-card)] transition-colors duration-150 hover:bg-accent-deep"
        >
          {t("cta")}
        </Link>
      </div>
      <p className="mt-6">
        <Link
          href="/"
          className="text-sm font-medium text-ink underline decoration-ink-soft/40 underline-offset-2"
        >
          {t("home")}
        </Link>
      </p>
    </Container>
  );
}
