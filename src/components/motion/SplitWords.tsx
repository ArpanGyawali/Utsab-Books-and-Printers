import { Fragment } from "react";

/**
 * Word-by-word entrance for headings (CSS in styles/motion.css). Splits on
 * spaces only — never characters or graphemes — so Devanagari conjuncts and
 * matras always stay inside their word and shaping is untouched. Renders
 * whole words in spans with real spaces between them: line wrapping and
 * screen-reader output are identical to plain text, and with reduced motion
 * (or no CSS animation support) the spans are simply static text.
 *
 * Server component — safe inside any Server Component tree.
 */
export default function SplitWords({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 ? " " : null}
      <span
        className="split-word"
        // Delay index, capped so a long heading's tail doesn't lag
        style={{ "--wi": Math.min(i, 9) } as React.CSSProperties}
      >
        {word}
      </span>
    </Fragment>
  ));
}
