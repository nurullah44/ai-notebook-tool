# Laravel Migration Baseline

## Purpose

This is the reproducible evidence captured before the Laravel rewrite starts.
It protects behavior and data without publishing private idea content.

Captured on: 2026-08-01

## Automated Test Baseline

Command:

```text
npm test
```

Result:

```text
Test Files  9 passed (9)
Tests       49 passed (49)
```

The suite covers authentication, note CRUD, literal keyword search, local AI
candidate ranking, AI response safety, Chrome capture, extension behavior, and
SQLite backup integrity.

## SQLite Data Baseline

Configured source: `data/notebook.db`

The live database was backed up with `npm run backup`. That backup was copied to
an isolated restore file and opened independently.

| Check | Source | Backup | Isolated restore |
| --- | --- | --- | --- |
| `PRAGMA integrity_check` | `ok` | `ok` | `ok` |
| Journal mode | `wal` | `wal` | `wal` |
| Note count | 4 | 4 | 4 |
| Oldest `created_at` | `2026-07-17T07:32:23.728Z` | same | same |
| Newest `updated_at` | `2026-08-01T18:20:36.236Z` | same | same |

Schema:

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

Index:

```sql
CREATE INDEX idx_notes_updated_at
  ON notes(updated_at DESC)
```

The backup and isolated restore SHA-256 hashes matched:

```text
EFCC50ABFB6759314582797F0536E38F62480140F0C390B1F4705DF22AAF22CF
```

The live WAL database file was compared at the data level instead of by file
hash because active SQLite WAL files do not need to be byte-identical to a
consistent backup. No note title or body was recorded in this document.

## Search Golden Cases

Laravel must reproduce these cases using temporary fixture data:

1. Creating a note trims title and body; an empty trimmed body is rejected.
2. Updating preserves the note ID and original `created_at`, while changing
   `updated_at`.
3. Keyword search examines both title and body.
4. `%`, `_`, and `\\` in the query are treated as literal characters, not SQL
   `LIKE` wildcards.
5. Keyword results are ordered by `updated_at` descending and obey the limit.
6. Local AI retrieval gives a title term weight of 5 and a body term weight of
   2, uses recency as the tie-breaker, returns at most 5 candidates, and limits
   each body snippet to 700 characters.

Current executable reference: `src/lib/notes.test.ts`.

## AI Golden Cases

Laravel must reproduce these cases with a fake HTTP response; migration tests
must not call the real OpenAI API.

1. Only locally selected candidate snippets are sent to the model.
2. Private candidate text is marked as untrusted context and cannot override
   the system instructions.
3. A model result containing an unknown note ID is rejected.
4. Malformed or unusable model output falls back to valid local matches.
5. The public response keeps the contract documented in
   `docs/LARAVEL_MIGRATION_CONTRACT.md`.

Current executable reference: `src/app/api/ai/recall/route.test.ts`.

## Capture And Recovery Golden Cases

1. Backup creates a separate SQLite file containing every note and passing
   `PRAGMA integrity_check`.
2. The Chrome capture API preserves exact trimmed selected text.
3. Invalid authorization and malformed JSON are rejected before persistence.
4. OpenAI failure or timeout still saves with the deterministic fallback title.
5. Operational logs do not contain captured private text.

Current executable references:

- `scripts/backup-sqlite.test.mjs`
- `src/app/api/capture/route.test.ts`
- `extension/*.test.js`

## Stage 1 Exit Rule

Stage 1 evidence is complete. The compatibility contract and this baseline must
be committed before Laravel installation begins. UI parity will use the current
source and CSS as the reference, followed by manual Chrome comparison after the
Blade UI exists.
