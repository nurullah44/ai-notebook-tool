import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type * as DbModule from "./db";
import type * as NotesModule from "./notes";

const tempDirectory = mkdtempSync(path.join(tmpdir(), "ai-notebook-test-"));
const testDbPath = path.join(tempDirectory, "notebook.db");

let db: typeof DbModule;
let notes: typeof NotesModule;

describe("notes persistence and search", () => {
  beforeAll(async () => {
    vi.stubEnv("SQLITE_DB_PATH", testDbPath);
    db = await import("./db");
    notes = await import("./notes");
  });

  beforeEach(() => {
    db.getDb().exec("DELETE FROM notes");
  });

  afterAll(() => {
    db.getDb().close();
    vi.unstubAllEnvs();
    rmSync(tempDirectory, { recursive: true, force: true });
  });

  it("creates and reads a trimmed note while rejecting an empty body", () => {
    const created = notes.createNote({
      title: "  Product direction  ",
      body: "  Build the smallest useful notebook.  ",
    });

    expect(created).toMatchObject({
      title: "Product direction",
      body: "Build the smallest useful notebook.",
    });
    expect(notes.getNote(created!.id)).toEqual(created);
    expect(() => notes.createNote({ title: "Empty", body: "   " })).toThrow(
      notes.EmptyNoteError,
    );
  });

  it("updates the same note and then deletes it", () => {
    const created = notes.createNote({ title: "Draft", body: "First version" });
    const updated = notes.updateNote(created!.id, {
      title: "Final",
      body: "Second version",
    });

    expect(updated).toMatchObject({
      id: created!.id,
      title: "Final",
      body: "Second version",
    });
    expect(db.getDb().prepare("SELECT COUNT(*) AS count FROM notes").get()).toEqual({ count: 1 });
    expect(notes.deleteNote(created!.id)).toBe(true);
    expect(notes.getNote(created!.id)).toBeNull();
  });

  it("searches title and body while escaping LIKE wildcard characters", () => {
    const titleMatch = notes.createNote({ title: "Launch is 100% ready", body: "Checklist" });
    notes.createNote({ title: "Launch is 100 percent ready", body: "Different wording" });
    const bodyMatch = notes.createNote({
      title: "Search syntax",
      body: "Remember the private under_score marker.",
    });
    notes.createNote({ title: "Near match", body: "Remember the private underXscore marker." });

    expect(notes.searchNotes("100%").map((note) => note.id)).toEqual([titleMatch!.id]);
    expect(notes.searchNotes("under_score").map((note) => note.id)).toEqual([bodyMatch!.id]);
  });

  it("ranks and limits AI recall candidates with bounded snippets", () => {
    const titleMatch = notes.createNote({
      title: "Tool buying pattern",
      body: "Choose the product before choosing more tools.",
    });
    const bodyMatch = notes.createNote({
      title: "Builder habit",
      body: `${"Earlier context. ".repeat(80)}tool buying before choosing a product.`,
    });
    notes.createNote({
      title: "Weak match",
      body: "A tool selection checklist.",
    });

    const candidates = notes.searchRecallCandidates("tool buying", 2);

    expect(candidates.map((candidate) => candidate.id)).toEqual([
      titleMatch!.id,
      bodyMatch!.id,
    ]);
    expect(candidates[1].snippet).toContain("tool buying");
    expect(candidates[1].snippet.length).toBeLessThanOrEqual(706);
  });
});
