import { requireAdmin } from "@/lib/admin/auth";
import ImportPanel from "@/components/admin/ImportPanel";

export default async function AdminImportPage() {
  await requireAdmin();

  return (
    <>
      <h1 className="text-2xl font-semibold">Import / export CSV</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Same spreadsheet template as always: class, subject, title_en, title_ne,
        publisher, price, status, units, expected_arrival. You will see exactly
        what changes before anything is saved.
      </p>

      <ImportPanel />

      <div className="mt-8 border-t border-dashed border-[var(--ink-faint)] pt-5">
        <h2 className="font-semibold">Backup</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Download the full book list as a CSV — it opens in Excel and can be
          re-imported above.
        </p>
        <a
          href="/api/admin/export"
          download
          className="mt-3 inline-flex min-h-11 items-center rounded-sm border-[1.5px] border-ink px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper-shade"
        >
          Download books.csv
        </a>
      </div>
    </>
  );
}
