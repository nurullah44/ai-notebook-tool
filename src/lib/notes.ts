import "server-only";

import { randomUUID } from "node:crypto";
import { getDb } from "./db";

export type CurrentNote = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type RecentNote = {
  id: string;
  title: string;
  updatedAt: string;
  updatedAtLabel: string;
};

type NoteRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export class EmptyNoteError extends Error {
  constructor() {
    super("Note body is required.");
    this.name = "EmptyNoteError";
  }
}

function toCurrentNote(row: NoteRow): CurrentNote {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatUpdatedAt(isoDate: string) {
  const updatedAt = new Date(isoDate).getTime();
  const diffMinutes = Math.max(0, Math.floor((Date.now() - updatedAt) / 60000));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays} days ago`;
}

function toRecentNote(row: NoteRow): RecentNote {
  return {
    id: row.id,
    title: row.title || "Untitled note",
    updatedAt: row.updated_at,
    updatedAtLabel: formatUpdatedAt(row.updated_at),
  };
}

function escapeLikePattern(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export function createNote(input: { title: string; body: string }) {
  const title = input.title.trim();
  const body = input.body.trim();

  if (!body) {
    throw new EmptyNoteError();
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  getDb()
    .prepare(
      `
        INSERT INTO notes (id, title, body, created_at, updated_at)
        VALUES (@id, @title, @body, @createdAt, @updatedAt)
      `,
    )
    .run({
      id,
      title,
      body,
      createdAt: now,
      updatedAt: now,
    });

  return getNote(id);
}

export function updateNote(id: string, input: { title: string; body: string }) {
  const title = input.title.trim();
  const body = input.body.trim();

  if (!body) {
    throw new EmptyNoteError();
  }

  const result = getDb()
    .prepare(
      `
        UPDATE notes
        SET title = @title,
            body = @body,
            updated_at = @updatedAt
        WHERE id = @id
      `,
    )
    .run({
      id,
      title,
      body,
      updatedAt: new Date().toISOString(),
    });

  return result.changes > 0 ? getNote(id) : null;
}

export function deleteNote(id: string) {
  const result = getDb()
    .prepare(
      `
        DELETE FROM notes
        WHERE id = ?
      `,
    )
    .run(id);

  return result.changes > 0;
}

export function getNote(id: string) {
  const row = getDb()
    .prepare(
      `
        SELECT id, title, body, created_at, updated_at
        FROM notes
        WHERE id = ?
      `,
    )
    .get(id) as NoteRow | undefined;

  return row ? toCurrentNote(row) : null;
}

export function listRecentNotes(limit = 8) {
  const rows = getDb()
    .prepare(
      `
        SELECT id, title, body, created_at, updated_at
        FROM notes
        ORDER BY updated_at DESC
        LIMIT ?
      `,
    )
    .all(limit) as NoteRow[];

  return rows.map(toRecentNote);
}

export function searchNotes(query: string, limit = 8) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const pattern = `%${escapeLikePattern(trimmedQuery)}%`;
  const rows = getDb()
    .prepare(
      `
        SELECT id, title, body, created_at, updated_at
        FROM notes
        WHERE title LIKE @pattern ESCAPE '\\'
           OR body LIKE @pattern ESCAPE '\\'
        ORDER BY updated_at DESC
        LIMIT @limit
      `,
    )
    .all({ pattern, limit }) as NoteRow[];

  return rows.map(toRecentNote);
}
