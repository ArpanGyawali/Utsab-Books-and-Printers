import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

const base =
  "lift inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 py-2.5 " +
  "font-medium leading-snug " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-paper border border-accent-deep hover:bg-accent-deep " +
    "shadow-[var(--shadow-card)]",
  secondary:
    "border-[1.5px] border-ink text-ink bg-transparent hover:bg-paper-shade",
};

type LinkHref = ComponentProps<typeof Link>["href"];

type Props = {
  variant?: Variant;
  href?: LinkHref;
  children: React.ReactNode;
  className?: string;
} & Omit<ComponentProps<"button">, "className">;

export default function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...rest
}: Props) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
