"use client";

import { createContext, useContext, useEffect, useState } from "react";
import LogoSpinner from "./LogoSpinner";

/**
 * In-place pending indicator for Look-for-Book filtering.
 *
 * The books page has no route `loading.tsx` (so the current results stay
 * visible during a filter navigation instead of collapsing to a full-page
 * spinner). This adds the missing feedback without any layout movement: a
 * click on a filter link — or a search submit — flips `pending` on, and the
 * next server render (a new `resultsKey`) flips it back off. While pending, an
 * overlay spinner sits over the results area; the old results stay underneath,
 * so nothing shifts and the page never jumps.
 *
 * Progressive enhancement: without JS the plain links/form still navigate;
 * the overlay simply never appears.
 */

const PendingContext = createContext(false);

export function BooksPendingProvider({
  resultsKey,
  children,
}: {
  /** Changes whenever the server commits a new set of results — clears pending. */
  resultsKey: string;
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState(false);

  // A committed navigation delivers a new resultsKey → results are on screen.
  useEffect(() => {
    setPending(false);
  }, [resultsKey]);

  // Safety net: never let the overlay stick if a click didn't cause a commit
  // (e.g. re-submitting the identical search).
  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(() => setPending(false), 5000);
    return () => clearTimeout(id);
  }, [pending]);

  function onClickCapture(e: React.MouseEvent) {
    if (e.defaultPrevented) return;
    // Let modified clicks (new tab, etc.) through untouched
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    if (anchor.target && anchor.target !== "_self") return; // opens a new tab
    let dest: URL;
    try {
      dest = new URL(anchor.href, window.location.href);
    } catch {
      return;
    }
    // External destinations (wa.me, viber:, tel:, maps) aren't filter navs
    if (dest.origin !== window.location.origin) return;
    // Re-clicking the active filter is a no-op — no commit would clear pending
    if (
      dest.pathname === window.location.pathname &&
      dest.search === window.location.search
    ) {
      return;
    }
    setPending(true);
  }

  return (
    <PendingContext.Provider value={pending}>
      <div
        className="contents"
        onClickCapture={onClickCapture}
        onSubmitCapture={() => setPending(true)}
      >
        {children}
      </div>
    </PendingContext.Provider>
  );
}

/**
 * Overlay spinner over the results region. Always mounted so it can fade;
 * pointer-events stay off so it never traps a tap on the results underneath.
 * The spinner is sticky so it stays in view while scrolling a long list.
 */
export function ResultsPendingOverlay({ label }: { label: string }) {
  const pending = useContext(PendingContext);
  return (
    <div
      aria-hidden={!pending}
      className={`pointer-events-none absolute inset-0 z-10 bg-[color-mix(in_srgb,var(--paper)_62%,transparent)] motion-safe:transition-opacity motion-safe:duration-300 ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="sticky top-24 flex justify-center pt-4">
        {pending ? <LogoSpinner label={label} /> : null}
      </div>
    </div>
  );
}
