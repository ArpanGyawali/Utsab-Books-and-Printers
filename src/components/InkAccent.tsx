/**
 * Small hand-drawn ink accents. Decorative only (aria-hidden).
 * Irregular paths on purpose — they should feel penned, not geometric.
 */

type Variant = "underline" | "star" | "book";

const marks: Record<Variant, { viewBox: string; path: React.ReactNode }> = {
  // Rough double underline stroke
  underline: {
    viewBox: "0 0 120 12",
    path: (
      <>
        <path
          d="M2 5 C 20 2.5, 45 6.5, 63 4.5 S 100 3, 118 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M14 9.5 C 34 7.5, 58 10.5, 78 8.5 S 98 8, 106 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.55"
        />
      </>
    ),
  },
  // Scribbled asterisk / spark
  star: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path
          d="M12 3.5 C 11.6 8, 12.3 16, 12 20.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M4.5 8 C 9 10, 15.5 14.2, 19.5 16.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M19.5 8.2 C 15 10.5, 8.5 14, 4.8 16.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    ),
  },
  // Tiny open book doodle
  book: {
    viewBox: "0 0 32 22",
    path: (
      <>
        <path
          d="M16 4.5 C 12 1.8, 6 2.2, 2.8 4 L 3.2 18.5 C 7 16.8, 12.5 16.8, 16 19.2 C 19.5 16.8, 25 16.8, 28.8 18.5 L 29.2 4 C 26 2.2, 20 1.8, 16 4.5 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M16 4.8 C 15.8 9, 16.1 15, 16 19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M6 7.5 C 8.5 6.8, 11 7, 13 7.8 M6 11 C 8.5 10.3, 11 10.5, 13 11.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </>
    ),
  },
};

export default function InkAccent({
  variant,
  className = "",
}: {
  variant: Variant;
  className?: string;
}) {
  const mark = marks[variant];
  return (
    <svg
      aria-hidden="true"
      viewBox={mark.viewBox}
      className={`block ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {mark.path}
    </svg>
  );
}
