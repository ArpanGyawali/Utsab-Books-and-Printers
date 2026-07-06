import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "./Container";
import StampLogo from "./StampLogo";
import LanguageToggle from "./LanguageToggle";
import OpenNowDot from "./OpenNowDot";

const links = [
  { href: "/services", key: "services" },
  { href: "/books", key: "books" },
  { href: "/contact", key: "contact" },
] as const;

export default function Navbar() {
  const t = useTranslations("nav");

  return (
    <header className="border-b border-[var(--ink-faint)] bg-paper/95">
      <Container className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
        <Link href="/" className="mr-auto no-underline" aria-label={t("home")}>
          <StampLogo size="sm" />
        </Link>

        <OpenNowDot className="order-2 sm:order-none" />
        <LanguageToggle />

        <nav
          aria-label={t("home")}
          className="-mx-4 order-last flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 sm:mx-0 sm:w-auto sm:px-0"
        >
          {links.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className="whitespace-nowrap rounded-sm px-3 py-2 font-medium text-ink-soft no-underline transition-colors duration-150 hover:bg-paper-shade hover:text-ink"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
