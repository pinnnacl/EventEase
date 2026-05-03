import path from "path";
import Database from "better-sqlite3";

let db;

function getDbFilePath() {
  const file = process.env.EVENTEASE_DB_FILE || "eventease.sqlite";
  return path.isAbsolute(file) ? file : path.join(process.cwd(), file);
}

function initCustomerSchema(database) {
  database.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS customers (
      phone_digits TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_otp_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_digits TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      name TEXT NOT NULL,
      location TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS customer_otp_phone_idx
      ON customer_otp_challenges(phone_digits);
  `);
}

export function getCustomerAuthDb() {
  if (db) return db;
  db = new Database(getDbFilePath());
  initCustomerSchema(db);
  return db;
}
