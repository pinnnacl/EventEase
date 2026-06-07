#!/usr/bin/env node
/**
 * Apply venue highlight migrations (016 + 017) to hosted Supabase.
 *
 * Usage (Dashboard → Project Settings → Database → Database password):
 *   SUPABASE_DB_PASSWORD='your-db-password' node scripts/applyVenueHighlightMigrations.js
 *
 * Optional override:
 *   SUPABASE_PROJECT_REF=acgwiiowjumugkqprojx
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ref = process.env.SUPABASE_PROJECT_REF || "acgwiiowjumugkqprojx";
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error(
    "Missing SUPABASE_DB_PASSWORD.\n" +
      "Copy your database password from Supabase Dashboard → Project Settings → Database,\n" +
      "then run:\n\n" +
      "  SUPABASE_DB_PASSWORD='…' node scripts/applyVenueHighlightMigrations.js\n",
  );
  process.exit(1);
}

const root = path.join(__dirname, "..");
const files = [
  path.join(root, "supabase/migrations/016_venue_highlights.sql"),
  path.join(root, "supabase/migrations/017_venue_suitable_for.sql"),
];

async function main() {
  const client = new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to Supabase Postgres.");

  for (const file of files) {
    const sql = fs.readFileSync(file, "utf8");
    console.log(`\n==> ${path.basename(file)}`);
    await client.query(sql);
    console.log("    OK");
  }

  const { rows } = await client.query(`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vendors'
      and column_name in (
        'venue_type','guest_capacity','dining_capacity','parking_capacity',
        'air_conditioned','stage_available','wheelchair_accessible','suitable_for'
      )
    order by column_name
  `);
  console.log("\nVerified columns:", rows.map((r) => r.column_name).join(", ") || "(none)");
  await client.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
