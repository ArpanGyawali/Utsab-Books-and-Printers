"use client";

import { useEffect, useRef } from "react";

/**
 * Shared engine behind scroll reveals: attach the returned ref to an element
 * carrying the `reveal` (or `reveal-stagger`) class and it gains `is-in` the
 * first time it scrolls into view. Used via <Reveal> for whole blocks, or
 * directly where the animated element is inside an existing client component
 * (e.g. HoursTable's <tbody>, so its rows can stagger).
 *
 * Safety behavior is documented with the CSS in styles/motion.css.
 */
export default function useReveal<T extends HTMLElement>(stagger = false) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.classList.add("is-in");

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      show();
      return;
    }

    // If the CSS failsafe fired before hydration (very slow JS), the content
    // is already visible — keep it shown rather than re-hiding it. In stagger
    // mode the wrapper stays visible, so probe the first animated child.
    const probe = (stagger ? el.firstElementChild : el) ?? el;
    const alreadyShown = getComputedStyle(probe).opacity === "1";
    el.classList.add("is-armed");
    if (alreadyShown) {
      show();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show();
          io.disconnect();
        }
      },
      // Trigger slightly before the element clears the viewport bottom
      { rootMargin: "0px 0px -8%" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [stagger]);

  return ref;
}
