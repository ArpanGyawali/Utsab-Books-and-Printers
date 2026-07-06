import { useTranslations } from "next-intl";
import Button from "./Button";
import Container from "./Container";
import InkAccent from "./InkAccent";
import SectionHeading from "./SectionHeading";

/**
 * Temporary "coming soon" body for pages whose real content lands in
 * Phase 2 (services, contact) and Phase 3 (books).
 */
export default function StubPage({
  page,
}: {
  page: "services" | "books" | "contact";
}) {
  const t = useTranslations("stub");

  return (
    <Container className="py-16">
      <SectionHeading>{t(`${page}.title`)}</SectionHeading>
      <p className="max-w-xl text-ink-soft">{t(`${page}.note`)}</p>
      <p className="mt-1 max-w-xl text-sm text-ink-soft">{t("comingSoon")}</p>
      <InkAccent variant="book" className="my-8 h-8 w-12 text-accent" />
      <Button href="/" variant="secondary">
        {t("backHome")}
      </Button>
    </Container>
  );
}
