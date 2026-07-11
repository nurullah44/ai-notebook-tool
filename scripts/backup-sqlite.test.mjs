import Database from "better-sqlite3";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { backupSqliteDatabase } from "./backup-sqlite.mjs";

const tempDirectory = mkdtempSync(path.join(tmpdir(), "ai-notebook-backup-test-"));

describe("SQLite backup", () => {
  afterAll(() => {
    rmSync(tempDirectory, { recursive: true, force: true });
  });

  it("creates an integrity-checked copy with every note", async () => {
    const sourcePath = path.join(tempDirectory, "source.db");
    const backupDirectory = path.join(tempDirectory, "backups");
    const sourceDatabase = new Database(sourcePath);

    sourceDatabase.exec(`
      CREATE TABLE notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT INTO notes VALUES
        ('one', 'First', 'Body one', '2026-01-01', '2026-01-01'),
        ('two', 'Second', 'Body two', '2026-01-02', '2026-01-02');
    `);
    sourceDatabase.close();

    const result = await backupSqliteDatabase({ sourcePath, backupDirectory });

    expect(existsSync(result.backupPath)).toBe(true);
    expect(result.integrity).toBe("ok");
    expect(result.noteCount).toBe(2);

    const backupDatabase = new Database(result.backupPath, {
      readonly: true,
      fileMustExist: true,
    });
    expect(backupDatabase.prepare("SELECT COUNT(*) AS count FROM notes").get()).toEqual({
      count: 2,
    });
    backupDatabase.close();
  });
});
