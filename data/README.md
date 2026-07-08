# Data

`books.sample.csv` — **dummy data** in the exact spreadsheet template the owner
will fill (see ASSETS.md §5). Used to exercise the Phase 3 CSV import script and
the Look-for-Book UI until the real inventory arrives. Replace with the owner's
completed spreadsheet; do not treat any row here as a real price or title.

Columns: `class, subject, title_en, title_ne, publisher, price, status, units, expected_arrival, stream`
- `status`: `in_stock` | `out_of_stock` | `arriving`
- `price` blank = shown as "Ask / सोध्नुहोस्"
- `expected_arrival` (YYYY-MM-DD) only meaningful when `status=arriving`
- `stream`: `science` | `management` | `arts` — class 11/12 only; blank = all streams
