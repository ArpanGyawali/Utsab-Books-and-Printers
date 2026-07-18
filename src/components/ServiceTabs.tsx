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

/**
 * Each tab's photo keeps its native aspect ratio and is framed like a print
 * laid on the counter (paper mat + tape), same language as the home-page
 * figures. Portrait shots get a narrower column so they don't tower over
 * the item list; landscape shots spread out.
 */
const TABS = [
  {
    key: "stationery",
    items: 7,
    photo: "/images/services/stationery.jpg",
    width: 1024,
    height: 1138,
    portrait: true,
    tilt: "-rotate-[1.2deg]",
  },
  {
    key: "printing",
    items: 11,
    photo: "/images/services/printing.jpg",
    width: 1200,
    height: 820,
    portrait: false,
    tilt: "rotate-[0.8deg]",
  },
  {
    key: "books",
    items: 6,
    photo: "/images/services/books.jpg",
    width: 900,
    height: 1314,
    portrait: true,
    tilt: "rotate-[1.2deg]",
  },
  {
    key: "other",
    items: 7,
    photo: "/images/services/other.jpg",
    width: 1163,
    height: 1007,
    portrait: false,
    tilt: "-rotate-[0.8deg]",
  },
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
              className={`-mb-0.5 min-h-11 shrink-0 rounded-t-md border-2 border-b-0 px-4 pt-2 pb-1.5 font-medium transition-[color,background-color,translate] duration-[var(--dur-micro)] ease-soft ${
                selected
                  ? "border-[var(--ink-faint)] bg-paper text-accent"
                  : "border-transparent bg-paper-shade text-ink-soft hover:text-ink motion-safe:hover:-translate-y-0.5"
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
        <div
          key={tab.key}
          className={`panel-in-stagger grid items-start gap-x-8 gap-y-6 ${
            tab.portrait ? "sm:grid-cols-[2fr_3fr]" : "sm:grid-cols-2"
          }`}
        >
          <figure
            className={`photo-in mx-auto w-full pt-2 sm:mx-0 ${tab.tilt} ${
              tab.portrait ? "max-w-[300px] sm:max-w-[340px]" : "max-w-md sm:max-w-none"
            }`}
          >
            <div className="relative rounded-sm border border-[var(--ink-faint)] bg-paper p-2 pb-3 shadow-[var(--shadow-card)]">
              {/* Bit of tape holding the print to the page */}
              <span
                aria-hidden="true"
                className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-3deg] rounded-[1px] border border-[var(--ink-faint)] bg-paper-shade/80"
              />
              <Image
                src={tab.photo}
                alt={t(`tabs.${tab.key}.photoAlt`)}
                width={tab.width}
                height={tab.height}
                className="h-auto w-full rounded-[1px]"
                sizes={tab.portrait ? "(max-width: 640px) 300px, 340px" : "(max-width: 640px) 100vw, 45vw"}
              />
              {/* TODO(assets): taglines are placeholders — collect the owner's
                  own one-liners (ASSETS.md §3) */}
              <figcaption className="px-1 pt-2.5 text-center font-heading text-[15px] italic leading-snug text-ink-soft">
                {t(`tabs.${tab.key}.tagline`)}
              </figcaption>
            </div>
          </figure>
          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-ink-soft">
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
