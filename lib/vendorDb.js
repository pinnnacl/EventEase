import path from "path";
import Database from "better-sqlite3";

let db;

function getDbFilePath() {
  const file = process.env.EVENTEASE_DB_FILE || "eventease.sqlite";
  return path.isAbsolute(file) ? file : path.join(process.cwd(), file);
}

function initSchema(database) {
  database.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('vendor','user','admin')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      business_name TEXT NOT NULL,
      category TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      phone TEXT NOT NULL,
      description TEXT NOT NULL,
      pricing_range TEXT,
      profile_image TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Lightweight migration for existing DBs created before vendor moderation.
  const cols = database.prepare("PRAGMA table_info(vendors)").all();
  const hasStatus = cols.some((c) => c.name === "status");
  if (!hasStatus) {
    database.exec(
      "ALTER TABLE vendors ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected'))",
    );
  }
}

export function getVendorDb() {
  if (db) return db;
  db = new Database(getDbFilePath());
  initSchema(db);
  return db;
}

