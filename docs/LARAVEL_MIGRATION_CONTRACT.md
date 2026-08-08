# Laravel Migration Compatibility Contract

## Purpose

This document defines what the Laravel rewrite must preserve from the current Next.js application.

The migration may change internal implementation. It must not silently change user data, product behavior, public URLs, Chrome capture, AI response contracts, or recovery guarantees.

## Parity Levels

### Exact Contract

These must remain byte- or schema-compatible where stated:

- existing SQLite note data
- note IDs and timestamps
- public product URLs
- Chrome extension request and response contract
- AI recall JSON response shape
- configured input limits

### Equivalent User Result

Internal values may differ, but the user-visible result must remain the same:

- Laravel session cookie content may differ from the Next.js token
- internal controller and service boundaries may differ
- redirect implementation may differ when browser behavior remains equivalent
- CSS class names may differ while layout and interaction remain visually equivalent

Migration invalidates the old Next.js session. Existing notes remain untouched; the user logs in again once.

## Core Product Invariants

- One private user authenticates with one configured password.
- Unauthenticated users cannot read or mutate ideas.
- Existing ideas remain readable without data conversion loss.
- The user can create, read, edit, cancel, save, and permanently delete ideas.
- Titles are optional; body text is required.
- Keyword search examines title and body.
- AI recall retrieves local candidates before calling OpenAI.
- AI answers remain grounded in retrieved ideas.
- Chrome captures selected text only through the server.
- Private note text, prompts, secrets, and model output are not written to operational logs.

## Page And Form Routes

| Method | URL | Authentication | Required behavior |
| --- | --- | --- | --- |
| `GET` | `/login` | Guest | Render password form. Authenticated session redirects home. |
| `GET` | `/` | Required | Render recent ideas. Optional trimmed `q` performs keyword search. |
| `GET` | `/notes/{id}` | Required | Render existing idea; missing ID returns `404`. |
| `GET` | `/notes/{id}?mode=edit` | Required | Open that idea in edit mode. Other `mode` values remain read mode. |
| `POST` | `/api/login` | Guest | Read form field `password`; wrong input redirects to `/login?error=wrong`; valid input starts session and redirects home. |
| `POST` | `/api/logout` | Not required | End browser session and redirect to `/login`. |
| `POST` | `/api/notes` | Required | Read form fields `title` and `body`; create idea and redirect to `/notes/{new-id}`. |
| `POST` | `/api/notes/{id}` | Required | Update existing idea and redirect to `/notes/{id}`; missing ID redirects home. |
| `POST` | `/api/notes/{id}/delete` | Required | Permanently delete if present and redirect home. |
| `POST` | `/api/ai/recall` | Required | Accept recall JSON and return the AI recall JSON contract below. |
| `POST` | `/api/capture` | Bearer token | Preserve the exact Chrome extension contract below. |

Web form redirects may use Laravel's equivalent redirect status. `/api/capture` status codes and JSON remain exact because the extension consumes them directly.

The development-only `/prototype/idea-collection` route is not yet classified as a production parity requirement. Decide whether to port or retire it before final cutover.

## Authentication Contract

- Password source remains `AUTH_PASSWORD`.
- Password comparison must avoid timing-dependent plain string comparison.
- A valid login creates a seven-day browser session.
- Session cookie is `HttpOnly`, `SameSite=Lax`, path `/`, and `Secure` in production.
- Protected page requests redirect to `/login` when session is missing, invalid, or expired.
- Protected JSON recall requests return `401` JSON instead of an HTML redirect.
- Logout invalidates the current browser session.
- No signup, user table, OAuth, password reset, teams, roles, or multi-user authorization is added.
- Laravel may use its encrypted session cookie and `APP_KEY`; it does not need to reproduce the old HMAC token bytes.
- Browser forms receive Laravel CSRF protection.
- `/api/capture` stays bearer-authenticated and must not depend on browser session or CSRF state.

## SQLite Contract

Existing database path configuration:

```text
SQLITE_DB_PATH=data/notebook.db
```

Relative paths resolve from the application working directory. Absolute paths remain supported.

Required table:

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_notes_updated_at
ON notes(updated_at DESC);
```

Data invariants:

- IDs remain application-generated UUID strings.
- Timestamps remain ISO timestamp strings.
- Creation gives `created_at` and `updated_at` the same timestamp.
- Update preserves `id` and `created_at`.
- Update changes only `title`, `body`, and `updated_at`.
- SQLite WAL mode remains enabled.
- Existing database is opened in place only after copied-database compatibility tests pass.
- Fresh installation can create the same schema through Laravel migration files.
- Migration must never recreate, truncate, or silently reshape an existing `notes` table.

## Idea Validation Contract

- Missing or non-string `title` becomes an empty string.
- Missing or non-string `body` becomes an empty string.
- Title and body are trimmed before persistence.
- Empty title is valid.
- Empty or whitespace-only body is rejected.
- Empty create redirects to `/?error=empty-note` and shows `Write something before saving.`
- Empty update redirects to `/notes/{id}?mode=edit&error=empty-note`.
- Current app has no server-side title or body length limit. Any new limit requires a product decision before implementation.

## Keyword Search Contract

- Search URL remains `/?q=...`.
- Blank trimmed query returns no search result set and normal home behavior resumes.
- Entire trimmed query is used as one substring pattern against both `title` and `body`.
- Backslash, `%`, and `_` are escaped so SQLite wildcard symbols are searched literally.
- Results sort by `updated_at DESC`.
- Home may retrieve up to 100 matching rows.
- Search overlay opens automatically when the page loads with a non-empty `q`.
- Visible grid initially shows the first three results.
- SQLite's existing `LIKE` case behavior is preserved; no new search normalization is introduced during migration.

## AI Recall Contract

Request:

```json
{
  "question": "rough memory or idea"
}
```

- Content is JSON.
- `question` must be a non-empty string after trimming.
- Maximum question length is 500 characters.
- Malformed or invalid input returns `400` JSON.
- Missing normal session returns `401 {"error":"Not authenticated."}`.

Local retrieval:

- Normalize question to lowercase terms containing Unicode letters/numbers.
- Remove punctuation, duplicates, stop words, and terms shorter than three characters.
- Use at most 12 terms.
- Candidate query uses OR substring matching across title and body.
- Title term match scores 5; otherwise body term match scores 2.
- Score ties use newest `updated_at` first.
- Retrieve at most five candidates.
- Candidate body snippet is centered around the earliest matched term and bounded to 700 body characters, with truncation markers when needed.

OpenAI behavior:

- Skip OpenAI when no API key or no candidates exist.
- Use OpenAI Responses API through server-side credentials.
- Model comes from `OPENAI_MODEL`, default `gpt-5.4-mini`.
- Send `store: false`.
- Send only question plus candidate IDs, titles, and bounded snippets.
- Preserve strict structured output.
- Model may return at most three matches.
- Ignore unknown candidate IDs and duplicate IDs.
- Use local candidate titles as authoritative.
- Invalid model output or OpenAI failure returns local fallback matches with HTTP `200`.

Response shape:

```json
{
  "answer": "string",
  "matches": [
    {
      "noteId": "uuid",
      "title": "local title",
      "reason": "short explanation"
    }
  ]
}
```

UI currently displays at most three `matches`; it does not display `answer`.

## Chrome Capture Exact Contract

Request:

```http
POST /api/capture
Authorization: Bearer <EXTENSION_CAPTURE_TOKEN>
Content-Type: application/json
```

```json
{
  "text": "selected text"
}
```

Authentication and validation:

- Missing server token configuration returns `503`.
- Missing or invalid bearer token returns `401` before processing body.
- `text` uses JavaScript-compatible Unicode whitespace trimming.
- Text length must be 3-5,000 JavaScript UTF-16 code units inclusive.
- Malformed or invalid JSON returns `400`.
- Ten validated captures are allowed per atomic sliding 60-second Laravel-cache window shared by server workers.
- Exceeding limit returns `429`.

Title generation:

- Use Responses API and the configured/default model.
- Send `store: false`.
- Strict result is `{title:string}`.
- Timeout is 25 seconds.
- Valid AI title is 4-10 words, at most 80 characters, with no straight or curly quotation marks.
- Missing AI config, timeout, request failure, or invalid output still saves the idea.
- Fallback title uses up to the first ten whitespace-normalized words and at most 80 characters.

Responses:

```text
201 {"id":"uuid","title":"saved title"}
500 {"error":"Idea could not be saved."}
```

Other documented `400`, `401`, `429`, and `503` responses remain JSON errors usable by the extension.

## Chrome Extension Contract

- Manifest V3 remains plain JavaScript.
- Permissions remain `contextMenus` and `storage` only.
- Local host permission remains `http://localhost:3000/*` until production-domain work.
- Context menu remains selection-only and named `Save to Idea Store`.
- Only trimmed selected text is sent; no URL, page title, HTML, cookies, tags, or browsing history.
- Settings remain `appUrl` and trimmed `captureToken` in `chrome.storage.local`.
- Token input remains password-masked and required.
- Local URL validation currently accepts exactly `http://localhost:3000` without trailing slash.
- Capture is single-flight; duplicate click is ignored while one request is active.
- Badge shows `...` while saving, a green check on success, and red `!` on failure.
- Tooltip describes status and clears after three seconds.
- Extension source behavior stays unchanged during Laravel migration.
- Extension tests move from Vitest to Node's built-in test runner without changing production extension files.

## Visible UI Contract

- Preserve current Idea Store name, colors, typography, spacing, responsive layout, and visual hierarchy.
- Empty collection shows `Your first idea is waiting.`
- Collection initially shows three cards.
- Scrolling within roughly 100px of page bottom reveals three more cards.
- Card front shows title; card back shows body, edit, and delete controls.
- Card flips by click, Enter, or Space.
- Opening `/notes/{id}` brings that note into the visible batch and opens its body side.
- Plus button opens an empty fullscreen create editor.
- Edit opens the selected note in a fullscreen editor.
- Cancel exits without saving and removes edit mode from URL.
- Delete asks for browser confirmation, permanently deletes, then returns home.
- Search overlay closes through close control or backdrop.
- Composer closes through close control or backdrop when allowed by current behavior.
- Keyword and AI search remain separate modes with explicit submit controls.
- Hover and flip motion should feel visually equivalent; respect reduced-motion behavior.

Parity evidence uses the current source and CSS as the implementation reference,
then manual desktop/mobile comparison in Chrome. Exact generated CSS class names
are not part of the contract.

## Environment Contract

Existing names that must remain supported or receive an explicit documented replacement:

```text
AUTH_PASSWORD
SESSION_SECRET
SQLITE_DB_PATH
EXTENSION_CAPTURE_TOKEN
OPENAI_API_KEY
OPENAI_MODEL
```

Laravel also requires its own application/session configuration such as `APP_KEY`. Real values never enter source control.

## Logging And Privacy Contract

- Logs remain structured and searchable.
- Auth logs contain outcome and safe metadata, not submitted password.
- Note logs do not contain full title/body by default.
- AI recall logs may contain duration, model, candidate/match counts, OpenAI-use flag, and error class.
- Recall logs must not contain question, note text, snippets, prompt, raw model output, or API key.
- Capture logs may contain duration, model/local source, text length, title source, OpenAI-use flag, and error class.
- Capture logs must not contain selected text, bearer token, prompt, raw model output, or API key.

## Backup And Recovery Contract

- Backup output remains outside Git.
- Backup is a consistent SQLite copy, not an unsafe copy during active writes.
- Backup runs SQLite integrity check.
- Backup note count matches source note count.
- Restore instructions are executable and tested against copied data.
- Real cutover requires a fresh verified backup before traffic switch.
- Git rollback is never treated as database rollback.

## Known Current Behaviors Requiring A Decision

These are observed behaviors, not automatically protected product requirements:

- Closing keyword search does not clear URL `q` or restore unfiltered server data until navigation/refresh.
- AI success with zero matches has no visible empty-state message because UI ignores `answer`.
- AI recall has no request timeout or rate limit.
- The Next.js capture limiter is process-local and resets on restart. Laravel intentionally uses an atomic cache-backed window shared by workers, preserving the same request limit while preventing concurrent paid-call bypasses; entries expire after 60 seconds instead of resetting with a worker restart.
- Create/update have no server-side text length limits.
- Mobile keyword search extends past the right edge and hides its trailing controls.
- Development prototype route is not available in production.

Before porting each affected slice, explicitly choose preserve or fix. Do not change these accidentally inside framework migration.

## Baseline Evidence

- Current full test output: 49 tests across 9 files pass.
- Route and payload inventory was reviewed against this contract.
- SQLite schema, index, count, time bounds, and integrity were recorded without private text.
- A backup was created, restored into an isolated path, and hash-checked.
- Keyword, lexical recall, AI, capture, and recovery golden cases were recorded.
- Evidence is recorded in `docs/LARAVEL_MIGRATION_BASELINE.md`.
- On 2026-08-08, an unpacked Chrome context-menu capture returned `201` through Laravel and persisted selected text to isolated temporary SQLite. Independent manual observation of the success badge/tooltip remains pending.

## Migration Acceptance

Laravel may replace Next.js only when:

- all exact contracts pass
- all equivalent user-result checks pass
- copied existing SQLite data opens without mutation or loss
- PHPUnit and extension test suites pass
- approved live AI and unpacked extension checks pass
- UI comparison is accepted
- backup restore and rollback rehearsal pass
- active documentation describes the Laravel system

## Current Source Of Truth

Until cutover, executable behavior remains authoritative in:

- `src/app/`
- `src/lib/auth.ts`
- `src/lib/db.ts`
- `src/lib/notes.ts`
- `extension/`
- `scripts/backup-sqlite.mjs`

This contract becomes authoritative for parity decisions after review. Differences discovered later must be recorded here before implementation changes behavior.
