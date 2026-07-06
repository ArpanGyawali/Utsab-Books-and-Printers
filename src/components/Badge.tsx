import { useTranslations } from "next-intl";

export type BookStatus = "in_stock" | "arriving" | "out_of_stock";

const statusColor: Record<BookStatus, string> = {
  in_stock: "text-instock",
  arriving: "text-arriving",
  out_of_stock: "text-outofstock",
};

/**
 * Stamp-styled status badge. Text comes from messages (`status.*`).
 */
export default function Badge({
  status,
  className = "",
}: {
  status: BookStatus;
  className?: string;
}) {
  const t = useTranslations("status");
  return (
    <span
      className={`stamp-border inline-block -rotate-1 px-2 py-0.5 text-xs font-bold uppercase tracking-widest ${statusColor[status]} ${className}`}
    >
      {t(status)}
    </span>
  );
}
