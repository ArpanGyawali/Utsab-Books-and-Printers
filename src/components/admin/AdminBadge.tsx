import type { BookStatus } from "@/lib/supabase/types";

/** English-only stamp badge for the admin (public Badge is intl-bound). */

const look: Record<BookStatus, { label: string; color: string }> = {
  in_stock: { label: "In stock", color: "text-instock" },
  arriving: { label: "Arriving", color: "text-arriving" },
  out_of_stock: { label: "Out", color: "text-outofstock" },
};

export default function AdminBadge({
  status,
  className = "",
}: {
  status: BookStatus;
  className?: string;
}) {
  const { label, color } = look[status];
  return (
    <span
      className={`stamp-border inline-block -rotate-1 px-2 py-0.5 text-xs font-bold uppercase tracking-widest ${color} ${className}`}
    >
      {label}
    </span>
  );
}
