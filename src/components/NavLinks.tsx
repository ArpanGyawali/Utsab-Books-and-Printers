"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const links = [
  { href: "/services", key: "services" },
  { href: "/books", key: "books" },
  { href: "/contact", key: "contact" },
] as const;

/**
 * Client child of the (server) Navbar — needs the pathname for the
 * active-page state. The grow-from-left underline and its `aria-current`
 * persistent state live in styles/motion.css (.nav-link).
 */
export default function NavLinks() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, key }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`nav-link whitespace-nowrap rounded-sm px-3 py-2 font-medium no-underline transition-colors duration-150 hover:text-ink ${
              active ? "text-ink" : "text-ink-soft"
            }`}
          >
            {t(key)}
          </Link>
        );
      })}
    </>
  );
}
