"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Home" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/booklist", label: "Book list" },
  { href: "/admin/waiting", label: "Waiting" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/settings", label: "Settings" },
];

/** Horizontal scrolling tab strip — thumb-sized targets, phone first. */
export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto">
      <ul className="mx-auto flex max-w-3xl gap-1 px-3 pb-2">
        {items.map(({ href, label }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-sm px-3.5 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper-shade hover:text-ink"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
