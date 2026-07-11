#!/usr/bin/env node

import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_DB_PATH = path.join("data", "notebook.db");
const BACKUP_DIR = "backups";

function readEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");

        if (separatorIndex === -1) {
          return null;
        }

        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^["']|["']$/g, "");

        return [key, value];
      })
      .filter(Boolean),
  );
}

function getEnvValue(key) {
  const localEnv = readEnvFile(path.join(process.cwd(), ".env.local"));
  const exampleEnv = readEnvFile(path.join(process.cwd(), ".env.example"));

  return process.env[key] ?? localEnv[key] ?? exampleEnv[key];
}

function resolveFromProjectRoot(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
}

function getTimestamp() {
  return new Date().toISOString().replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}

async function main() {
  const sourcePath = resolveFromProjectRoot(getEnvValue("SQLITE_DB_PATH") || DEFAULT_DB_PATH);

  if (!existsSync(sourcePath)) {
    console.error(`SQLite database not found at ${sourcePath}`);
    process.exitCode = 1;
    return;
  }

  const backupDirectory = resolveFromProjectRoot(BACKUP_DIR);
  mkdirSync(backupDirectory, { recursive: true });

  const backupPath = path.join(backupDirectory, `notebook-${getTimestamp()}.db`);
  const database = new Database(sourcePath, { readonly: true, fileMustExist: true });

  try {
    await database.backup(backupPath);

    const backupDatabase = new Database(backupPath, { readonly: true, fileMustExist: true });
    const integrity = backupDatabase.pragma("integrity_check", { simple: true });
    const noteCount = backupDatabase.prepare("SELECT COUNT(*) AS count FROM notes").get().count;
    backupDatabase.close();

    if (integrity !== "ok") {
      console.error(`Backup failed integrity check: ${integrity}`);
      process.exitCode = 1;
      return;
    }

    console.info(`Backup created: ${backupPath}`);
    console.info(`Source database: ${sourcePath}`);
    console.info(`Integrity check: ${integrity}`);
    console.info(`Notes copied: ${noteCount}`);
  } finally {
    database.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
