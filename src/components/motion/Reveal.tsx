"use client";

import useReveal from "./useReveal";

/**
 * One-time scroll reveal (fade + slight rise). Thin client wrapper so pages
 * stay Server Components — pass server-rendered children straight through.
 *
 * Progressive enhancement contract (CSS lives in styles/motion.css):
 * children are visible by default; the hidden start state only applies once
 * the inline `html.js` gate script has run, a CSS failsafe force-shows
 * content if hydration never completes, and reduced-motion skips everything.
 */

type Props = {
  children: React.ReactNode;
  /** Wrapping element, so lists can reveal as the <ul> itself. */
  as?: "div" | "section" | "ul" | "span";
  className?: string;
  /** Animate direct children one-by-one instead of the block as a whole. */
  stagger?: boolean;
  /** Entrance direction: rise ("up", default) or slide in from a side. */
  from?: "up" | "left" | "right";
};

export default function Reveal({
  children,
  as: Tag = "div",
  className,
  stagger = false,
  from = "up",
}: Props) {
  const ref = useReveal<HTMLElement>(stagger);

  const cls = [
    stagger ? "reveal-stagger" : "reveal",
    from === "left" ? "reveal-from-left" : from === "right" ? "reveal-from-right" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag ref={ref as React.Ref<never>} className={cls}>
      {children}
    </Tag>
  );
}
