/**
 * Applies supabase/migrations/*.sql (sorted by filename) against the database
 * in SUPABASE_DB_URL, tracking applied files in public._migrations.
 *
 *   npm run db:migrate
 *
 * SUPABASE_DB_URL: the "Session pooler" connection string from the Supabase
 * dashboard (Connect → Session pooler), including the database password.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error(
    "SUPABASE_DB_URL is not set. Add the Session-pooler connection string to .env.local."
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(
    `create table if not exists public._migrations (
       name text primary key,
       applied_at timestamptz not null default now()
     )`
  );

  const applied = new Set(
    (await client.query("select name from public._migrations")).rows.map((r) => r.name)
  );

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  let ran = 0;

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skip ${file} (already applied)`);
      continue;
    }
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`  apply ${file} ...`);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into public._migrations (name) values ($1)", [file]);
      await client.query("commit");
      ran++;
    } catch (err) {
      await client.query("rollback");
      console.error(`FAILED in ${file}:`, err.message);
      process.exit(1);
    }
  }

  console.log(ran ? `Done — ${ran} migration(s) applied.` : "Done — nothing to apply.");
} finally {
  await client.end();
}
