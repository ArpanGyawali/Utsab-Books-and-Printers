import { requireAdmin } from "@/lib/admin/auth";
import ImportPanel from "@/components/admin/ImportPanel";

export default async function AdminImportPage() {
  await requireAdmin();

  return (
    <>
      <h1 className="text-2xl font-semibold">Import / export</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Download the Excel template below and fill it in — the class, status,
        stream and genre cells are dropdowns, so you pick instead of type.
        Columns: class, subject, title_en, title_ne, publisher, price, status,
        units, expected_arrival, stream (class 11–12 only; blank = all streams),
        genre (other books only — pick from the book types you manage under
        Lists; leave class and subject blank on those rows). Upload the filled
        .xlsx (or a .csv) and you will see exactly what changes before anything
        is saved.
      </p>

      <div className="mt-4">
        <a
          href="/api/admin/template"
          download
          className="inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-ink px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
        >
          Download the Excel template
        </a>
      </div>

      <ImportPanel />

      <div className="mt-8 border-t border-dashed border-[var(--ink-faint)] pt-5">
        <h2 className="font-semibold">Backup</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Download the full current book list as an Excel file — same template
          format (with the dropdowns), so you can edit it and re-import above.
        </p>
        <a
          href="/api/admin/export"
          download
          className="mt-3 inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-ink px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
        >
          Download current list (Excel)
        </a>
      </div>
    </>
  );
}
