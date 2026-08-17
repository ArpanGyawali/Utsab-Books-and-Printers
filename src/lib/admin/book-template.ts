import ExcelJS from "exceljs";
import { CLASS_TOKENS } from "./csv";

/**
 * Builds the book-list Excel workbook — the single format for both the blank
 * template (Import screen) and the "download current list" backup. The
 * constrained columns (class, status, stream, genre) are dropdowns so values
 * are picked, not typed; the genre list is the live admin-managed set. Filled
 * with the current books, the same file round-trips straight back through the
 * importer. Server-only (exceljs is not shipped to the client).
 */

export const TEMPLATE_COLUMNS = [
  "class",
  "subject",
  "title_en",
  "title_ne",
  "publisher",
  "price",
  "status",
  "units",
  "expected_arrival",
  "stream",
  "genre",
] as const;

export type TemplateRow = Partial<
  Record<(typeof TEMPLATE_COLUMNS)[number], string | number>
>;

/** Excel inline-list validation wants the options as one quoted CSV string. */
function list(values: string[], allowBlank: boolean): ExcelJS.DataValidation {
  return { type: "list", allowBlank, formulae: [`"${values.join(",")}"`] };
}

export async function buildBookWorkbook(
  genreSlugs: string[],
  rows: TemplateRow[] = [],
): Promise<ExcelJS.Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("books");
  ws.columns = TEMPLATE_COLUMNS.map((c) => ({ header: c, key: c, width: 16 }));
  ws.getRow(1).font = { bold: true };
  for (const row of rows) ws.addRow(row);

  // Keep dropdowns a comfortable margin below the last filled row.
  const lastRow = Math.max(500, rows.length + 50);
  const validations: Record<string, ExcelJS.DataValidation> = {
    class: list(CLASS_TOKENS, true),
    status: list(["in_stock", "out_of_stock", "arriving"], false),
    stream: list(["science", "management", "arts"], true),
    genre: list(genreSlugs, true),
  };
  for (const [key, validation] of Object.entries(validations)) {
    const col = ws.getColumn(key);
    for (let r = 2; r <= lastRow; r++) {
      ws.getCell(r, col.number).dataValidation = validation;
    }
  }

  return wb.xlsx.writeBuffer();
}
