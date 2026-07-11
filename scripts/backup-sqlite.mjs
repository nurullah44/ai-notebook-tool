import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

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

export async function backupSqliteDatabase({ sourcePath, backupDirectory }) {
  if (!existsSync(sourcePath)) {
    throw new Error(`SQLite database not found at ${sourcePath}`);
  }

  mkdirSync(backupDirectory, { recursive: true });

  const backupPath = path.join(backupDirectory, `notebook-${getTimestamp()}.db`);
  const database = new Database(sourcePath, { readonly: true, fileMustExist: true });

  try {
    await database.backup(backupPath);

    const backupDatabase = new Database(backupPath, { readonly: true, fileMustExist: true });
    let integrity;
    let noteCount;

    try {
      integrity = backupDatabase.pragma("integrity_check", { simple: true });
      noteCount = backupDatabase.prepare("SELECT COUNT(*) AS count FROM notes").get().count;
    } finally {
      backupDatabase.close();
    }

    if (integrity !== "ok") {
      throw new Error(`Backup failed integrity check: ${integrity}`);
    }

    return { backupPath, integrity, noteCount };
  } finally {
    database.close();
  }
}

async function main() {
  const sourcePath = resolveFromProjectRoot(getEnvValue("SQLITE_DB_PATH") || DEFAULT_DB_PATH);
  const backupDirectory = resolveFromProjectRoot(BACKUP_DIR);
  const result = await backupSqliteDatabase({ sourcePath, backupDirectory });

  console.info(`Backup created: ${result.backupPath}`);
  console.info(`Source database: ${sourcePath}`);
  console.info(`Integrity check: ${result.integrity}`);
  console.info(`Notes copied: ${result.noteCount}`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
