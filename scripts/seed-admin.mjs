/**
 * Registers ADMIN_EMAIL as the single admin (Phase 4). Idempotent.
 *
 *   npm run db:seed-admin
 *
 * Two writes, both required for login to work:
 *  1. auth user pre-created (login route uses shouldCreateUser:false, so the
 *     magic link only ever goes to an already-existing user)
 *  2. row in private.admin_emails (what the RLS is_admin() check reads;
 *     private schema is not exposed via PostgREST, hence direct SQL)
 */
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.SUPABASE_DB_URL;

if (!email || !url || !serviceKey || !dbUrl) {
  console.error(
    "Missing ADMIN_EMAIL / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_DB_URL in .env.local."
  );
  process.exit(1);
}

// 1. Auth user
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const { error: createErr } = await supabase.auth.admin.createUser({
  email,
  email_confirm: true,
});
if (createErr) {
  if (createErr.code === "email_exists") {
    console.log(`auth user already exists: ${email}`);
  } else {
    console.error("Could not create auth user:", createErr.message);
    process.exit(1);
  }
} else {
  console.log(`auth user created: ${email}`);
}

// 2. Allowlist row
const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  const { rowCount } = await client.query(
    "insert into private.admin_emails (email) values ($1) on conflict (email) do nothing",
    [email]
  );
  console.log(
    rowCount
      ? `admin_emails row inserted: ${email}`
      : `admin_emails row already present: ${email}`
  );
  const { rows } = await client.query("select email from private.admin_emails");
  if (rows.length > 1) {
    console.warn(
      `WARNING: ${rows.length} emails in private.admin_emails — expected exactly 1:`,
      rows.map((r) => r.email).join(", ")
    );
  }
} finally {
  await client.end();
}
console.log("Done.");
