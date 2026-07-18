import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "./Container";
import StampLogo from "./StampLogo";
import LanguageToggle from "./LanguageToggle";
import NavLinks from "./NavLinks";
import OpenNowDot from "./OpenNowDot";
import type { WeekHours } from "@/lib/site";

export default function Navbar({ hours }: { hours: WeekHours }) {
  const t = useTranslations("nav");

  return (
    <header className="nav-in border-b border-[var(--ink-faint)] bg-paper/95">
      <Container className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
        <Link
          href="/"
          className="group mr-auto flex items-center gap-2.5 no-underline"
          aria-label={t("home")}
        >
          {/* The shop's round seal; decorative next to the wordmark stamp.
              Gentle tilt + grow when the lockup is hovered. */}
          <Image
            src="/images/logo.png"
            alt=""
            width={56}
            height={56}
            sizes="56px"
            className="h-12 w-12 shrink-0 select-none transition-[rotate,scale] duration-[var(--dur-micro)] ease-soft motion-safe:group-hover:-rotate-2 motion-safe:group-hover:scale-105 sm:h-14 sm:w-14"
          />
          <StampLogo size="sm" />
        </Link>

        <OpenNowDot hours={hours} className="order-2 sm:order-none" />
        <LanguageToggle />

        <nav
          aria-label={t("home")}
          className="-mx-4 order-last flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 sm:mx-0 sm:w-auto sm:px-0"
        >
          <NavLinks />
        </nav>
      </Container>
    </header>
  );
}
