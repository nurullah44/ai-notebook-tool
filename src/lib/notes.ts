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

export type RecallCandidate = {
  id: string;
  title: string;
  reason: string;
  snippet: string;
};

const RECALL_STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "apps",
  "because",
  "before",
  "into",
  "idea",
  "ideas",
  "later",
  "like",
  "note",
  "notes",
  "one",
  "that",
  "this",
  "user",
  "users",
  "when",
  "with",
  "your",
]);

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

function getSearchTerms(query: string) {
  const terms = Array.from(
    new Set(
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.replace(/[^\p{L}\p{N}]/gu, ""))
        .filter((term) => term.length >= 3 && !RECALL_STOP_WORDS.has(term)),
    ),
  ).slice(0, 12);

  return terms.length > 0 ? terms : [];
}

function getRowRecallScore(row: NoteRow, terms: string[]) {
  const title = row.title.toLowerCase();
  const body = row.body.toLowerCase();

  return terms.reduce((score, term) => {
    if (title.includes(term)) {
      return score + 5;
    }

    if (body.includes(term)) {
      return score + 2;
    }

    return score;
  }, 0);
}

function compareRecallRows(left: NoteRow, right: NoteRow, terms: string[]) {
  const scoreDiff = getRowRecallScore(right, terms) - getRowRecallScore(left, terms);

  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
}

function buildRecallReason(row: NoteRow, terms: string[]) {
  const title = row.title.toLowerCase();
  const body = row.body.toLowerCase();
  const matchedTerms = terms.filter((term) => title.includes(term) || body.includes(term));

  if (matchedTerms.length === 0) {
    return "This note matched your rough search.";
  }

  return `Matched ${matchedTerms.map((term) => `"${term}"`).join(", ")}.`;
}

function buildSnippet(body: string, terms: string[], maxLength = 700) {
  const lowerBody = body.toLowerCase();
  const firstMatchIndex = terms
    .map((term) => lowerBody.indexOf(term))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];

  if (firstMatchIndex === undefined || body.length <= maxLength) {
    return body.slice(0, maxLength);
  }

  const start = Math.max(0, firstMatchIndex - 180);
  const end = Math.min(body.length, start + maxLength);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < body.length ? "..." : "";

  return `${prefix}${body.slice(start, end)}${suffix}`;
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

export function searchRecallCandidates(query: string, limit = 5) {
  const terms = getSearchTerms(query);

  if (terms.length === 0) {
    return [];
  }

  const whereClause = terms
    .map((_, index) => `title LIKE @pattern${index} ESCAPE '\\' OR body LIKE @pattern${index} ESCAPE '\\'`)
    .join(" OR ");
  const params = Object.fromEntries(
    terms.map((term, index) => [`pattern${index}`, `%${escapeLikePattern(term)}%`]),
  );
  const rows = getDb()
    .prepare(
      `
        SELECT id, title, body, created_at, updated_at
        FROM notes
        WHERE ${whereClause}
      `,
    )
    .all(params) as NoteRow[];

  return rows.sort((left, right) => compareRecallRows(left, right, terms)).slice(0, limit).map(
    (row): RecallCandidate => ({
      id: row.id,
      title: row.title || "Untitled note",
      reason: buildRecallReason(row, terms),
      snippet: buildSnippet(row.body, terms),
    }),
  );
}
