import Image from "next/image";

/**
 * Branded pending indicator: the seal with a dashed stamp ring turning
 * around it (styles/motion.css — ring holds still under reduced motion).
 * Pass a translated label; it's announced via role="status".
 */
export default function LogoSpinner({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`logo-spinner ${className}`.trim()}
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={48}
        height={48}
        sizes="48px"
        className="h-12 w-12 select-none"
      />
    </span>
  );
}
