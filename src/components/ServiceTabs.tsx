"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "./Button";
import InkAccent from "./InkAccent";
import PrintQuoteForm from "./PrintQuoteForm";

/**
 * Notebook index-tab layout: four tabs styled like copy dividers.
 * Keyboard accessible — roving tabindex, arrow keys, Home/End.
 */

const TABS = [
  { key: "stationery", items: 6, photo: "/images/placeholders/stationery.svg" },
  { key: "printing", items: 7, photo: "/images/placeholders/printing.svg" },
  { key: "books", items: 5, photo: "/images/placeholders/books.svg" },
  { key: "other", items: 4, photo: "/images/placeholders/services-other.svg" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ServiceTabs() {
  const t = useTranslations("services");
  const [active, setActive] = useState<TabKey>("stationery");
  const tabRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});

  function onKeyDown(e: React.KeyboardEvent) {
    const idx = TABS.findIndex((tab) => tab.key === active);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (idx + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    const key = TABS[next].key;
    setActive(key);
    tabRefs.current[key]?.focus();
  }

  const tab = TABS.find((tabDef) => tabDef.key === active)!;

  return (
    <div>
      {/* Tab rail — notebook dividers peeking over the page edge */}
      <div
        role="tablist"
        aria-label={t("tablistLabel")}
        onKeyDown={onKeyDown}
        className="-mx-4 flex gap-1 overflow-x-auto border-b-2 border-[var(--ink-faint)] px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map(({ key }) => {
          const selected = key === active;
          return (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[key] = el;
              }}
              role="tab"
              id={`tab-${key}`}
              aria-selected={selected}
              aria-controls={`panel-${key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(key)}
              className={`-mb-0.5 min-h-11 shrink-0 rounded-t-md border-2 border-b-0 px-4 pt-2 pb-1.5 font-medium transition-colors duration-150 ${
                selected
                  ? "border-[var(--ink-faint)] bg-paper text-accent"
                  : "border-transparent bg-paper-shade text-ink-soft hover:text-ink"
              }`}
            >
              {t(`tabs.${key}.label`)}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div
        role="tabpanel"
        id={`panel-${tab.key}`}
        aria-labelledby={`tab-${tab.key}`}
        className="pt-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {/* TODO(assets): swap placeholder for the real service photo */}
          <div className="relative aspect-[8/5] overflow-hidden rounded-md shadow-[var(--shadow-card)]">
            <Image
              src={tab.photo}
              alt={t(`tabs.${tab.key}.photoAlt`)}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
          <div>
            {/* TODO(assets): taglines are placeholders — collect the owner's
                own one-liners (ASSETS.md §3) */}
            <p className="text-lg font-medium">{t(`tabs.${tab.key}.tagline`)}</p>
            <h3 className="mt-4 mb-2 text-sm font-bold uppercase tracking-widest text-ink-soft">
              {t("itemsHeading")}
            </h3>
            <ul className="space-y-1.5">
              {Array.from({ length: tab.items }, (_, i) => (
                <li key={i} className="flex items-start gap-2 text-ink-soft">
                  <InkAccent
                    variant="star"
                    className="mt-1.5 h-3 w-3 shrink-0 text-accent"
                  />
                  {t(`tabs.${tab.key}.items.i${i + 1}`)}
                </li>
              ))}
            </ul>
            {tab.key === "books" ? (
              <Button href="/books" variant="secondary" className="mt-5">
                {t("tabs.books.cta")}
              </Button>
            ) : null}
          </div>
        </div>

        {tab.key === "printing" ? <PrintQuoteForm /> : null}
      </div>
    </div>
  );
}
