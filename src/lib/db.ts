import "server-only";

import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dbPath = process.env.SQLITE_DB_PATH ?? path.join("data", "notebook.db");
const resolvedDbPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(/* turbopackIgnore: true */ process.cwd(), dbPath);

const globalForDb = globalThis as typeof globalThis & {
  notebookDb?: Database.Database;
};

function createDatabase() {
  mkdirSync(path.dirname(resolvedDbPath), { recursive: true });

  const database = new Database(resolvedDbPath);
  database.pragma("journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notes_updated_at
      ON notes(updated_at DESC);
  `);

  return database;
}

export function getDb() {
  if (!globalForDb.notebookDb) {
    globalForDb.notebookDb = createDatabase();
  }

  return globalForDb.notebookDb;
}

export function getDbPath() {
  return resolvedDbPath;
}
