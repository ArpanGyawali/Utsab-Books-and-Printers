/**
 * Notebook ruled-line section divider: three faint blue rules with the
 * red margin line crossing them, like the top of a fresh copy page.
 */
export default function RuledDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`ruled ruled-draw h-[82px] w-full ${className}`}
    />
  );
}
