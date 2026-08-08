# Project Memory

Stable facts future Codex sessions should remember. Keep short.

## Product

- Name: Idea Store
- Domain: private collection of ideas with AI rough-memory recall
- Audience: founder-only V1
- Real problem: user remembers rough shape of ideas but not exact note wording or location
- Smallest useful version: login, create/read/edit/delete notes, search notes, ask AI about own notes, logs, backups, targeted tests, deployment notes
- Current stage: Prototype; Laravel migration Stage 4 is complete. Founder auth, note CRUD, UI, keyword search, AI recall, extension capture, logging/privacy, and backup/restore have parity evidence.

## Active Workflow

- Canonical map: `docs/inner-voice.html`
- Active side workflow: `docs/inner-voice-laravel-migration.html`
- Required active documents:
  - `docs/LARAVEL_MIGRATION_CONTRACT.md`
  - `docs/LARAVEL_MIGRATION_BASELINE.md`
- Status: Stage 4 operations parity is complete. Laravel owns the extension capture path, structured logging/privacy, and verified Artisan SQLite backup/restore. The combined reference/extension suite passes 49 tests, and Laravel passes 46 tests with 227 assertions.
- Current stage: 5 - Cut Over With A Rollback Gate (next)
- Next checkpoint: prepare the Laravel VPS deployment, smoke checks, traffic switch, observation window, and rollback rehearsal without retiring Next.js early.

## Current Execution Constraints

- Migration work changes Laravel only. The Next.js implementation is read-only reference code.
- Normal `AGENTS.md` branch, review, documentation, and learning workflow is restored.
- Playwright is forbidden. Manual browser verification uses the provided Chrome integration only.
- Work one Stage 5 vertical slice at a time; deployment and cutover must preserve the verified database backup and rollback gate.

## Learning Goal

Build a small real project while understanding product decisions, architecture, UI/UX, testing, security, deployment, logging, backups, and AI reliability.

## Current Build Sequence

Follow `docs/inner-voice.html` as the stage map.

1. Product Definition - done
2. Stack Choice - done
3. Project Skeleton - done
4. Authentication Slice - done
5. Notes Slice - done
   - create/read notes - done
   - edit saved notes - done
   - delete saved notes - done
6. Search Slice - done
7. AI Question Slice - done
8. Logging Slice - done
9. Backup Slice - done
10. Tests Slice - done
   - auth foundation: password, signed-session tampering, and unauthenticated note creation - done
   - notes/search tests using temporary SQLite - done
   - AI request/output safety and backup integrity tests - done

The Chrome capture stage map is `docs/inner-voice-extension.html`: stages 1-4 are done. Stage 5's unpacked context-menu request and persistence path passed against isolated Laravel data; manual badge/tooltip observation remains pending. Stage 6 production domain setup is deferred.

## Stack Decisions

- Frontend: Next.js App Router with TypeScript
- Backend: Next.js server routes and server components
- Database/storage: SQLite through `better-sqlite3`, default file `data/notebook.db`
- Auth: founder-only one-password login with signed HTTP-only session cookie
- AI provider: OpenAI Responses API for rough-memory note lookup and capture-title generation, default model `gpt-5.4-mini`
- Extension: local unpacked Manifest V3 client in plain JavaScript; selection-only context menu, settings in `chrome.storage.local`, and host permission only for `http://localhost:3000/*`
- Deployment: Hetzner VPS planned, with Tailscale admin access and Cloudflare Tunnel web access
- Logging: structured JSON stdout/stderr logs with metadata only
- Backup: `php artisan notebook:backup` creates an integrity/count-checked SQLite copy in ignored Laravel private storage; `notebook:restore --force` validates the chosen backup, preserves the current target as a safety backup, and restores with count/integrity verification. Scheduling and off-server storage are deferred to deployment.
- Testing: Vitest protects the read-only Next.js reference; Node's built-in runner protects the 19 extension checks; PHPUnit protects Laravel. Tests use fake secrets and must never use the real notebook database.

## Architecture Decisions

### Decision: Laravel migration foundation

Laravel 13 runs side-by-side in `laravel/` on PHP 8.5 with Blade, normal static assets, SQLite, encrypted cookie sessions, JSON stderr logging, and PHPUnit. Vite, Tailwind, queues, database-backed sessions, and default user/cache/jobs tables are excluded. Until cutover, the Next.js app remains the product behavior reference.

### Decision: Laravel founder authentication

Laravel now owns the first migrated product slice: one password from `AUTH_PASSWORD`, a regenerated encrypted cookie session, founder route middleware, CSRF-protected login/logout forms, production-secure cookies, and metadata-only auth logs. Ten Laravel tests currently pass with 27 assertions.

### Decision: Laravel note read views

Laravel now reads the configured compatible SQLite notes table through Query Builder. Authenticated `/` and `/notes/{id}` render the shared Blade collection, newest-first with a 100-note query limit; a direct note is moved into the first visible batch and opened to its body. Fifteen Laravel tests currently pass with 48 assertions.

### Decision: Laravel note CRUD

Authenticated, CSRF-protected POST routes now create, update, and delete notes through Query Builder. Blade and minimal JavaScript provide create/edit composers, cancel behavior, word counting, and browser delete confirmation. Empty bodies are rejected without writes, note content is never logged, and 24 Laravel tests currently pass with 93 assertions.

### Decision: Laravel keyword search and AI recall

Laravel owns URL keyword search, wildcard escaping, newest-first results, local lexical candidate ranking, and authenticated OpenAI Responses API recall. Recall sends bounded candidate snippets, uses strict structured output with `store: false`, validates returned IDs, falls back locally, and logs safe model/latency/outcome/token metadata. The suite passes 31 tests with 130 assertions; Chrome parity and one approved live OpenAI call passed.

### Decision: Laravel extension capture API

Laravel now owns bearer-authenticated `POST /api/capture` in the session-free API route group. Missing capture-token configuration returns `503`; an invalid bearer token returns `401` before JSON parsing. Input follows JavaScript Unicode trim/length behavior and is limited to 3-5,000 UTF-16 code units. An atomic Laravel-cache sliding window permits 10 valid requests per minute across workers. Title generation uses OpenAI strict structured output for 4-10 words and at most 80 characters, with `store: false` and a 25-second timeout; invalid output or provider failure uses a safe fallback. Successful persistence writes a UUID and UTC timestamps to SQLite. Logs contain metadata only, and unexpected failures return a safe `500`. Laravel serves locally on the unchanged extension's exact localhost origin, and its 19 tests use Node's built-in runner. Direct and unpacked-Chrome live capture requests both returned `201` and wrote only to isolated temporary SQLite.

### Decision: Laravel structured logging and privacy

Laravel writes JSON events to stderr through Monolog. Auth events contain no submitted password; note success/rejection events contain IDs and reasons only; note read/write failures catch `QueryException` before framework reporting can serialize private search, title, or body bindings and log only the exception class. AI recall candidate-query failures return a generic response and the same safe metadata boundary. AI recall always emits completion metadata for local or model results, while search/provider failures emit error-level `ai.recall_failed`; contexts contain model, duration, candidate/match counts, OpenAI-use flag, outcome, status/error class, and token counts when available, never questions, note text, snippets, prompts, API keys, or raw output. Capture keeps the same metadata-only boundary. Privacy behavior is protected by feature tests.

### Decision: Laravel SQLite recovery

Laravel uses PHP's SQLite online backup API for consistent copies. `notebook:backup` verifies source/backup note counts and backup integrity. `notebook:restore` requires `--force`, validates the chosen backup before touching the target, creates a verified pre-restore safety backup, removes stale WAL/SHM sidecars, restores, and verifies integrity/count. Three feature tests rehearse these behaviors only on temporary physical SQLite files.

### Decision: V1 stack

Use Next.js, TypeScript, SQLite, OpenAI API, and a Hetzner VPS. This keeps the app mainstream and TypeScript-based while preserving a simple single-file database model.

### Decision: V1 auth

Use one server-checked password from `AUTH_PASSWORD` and a signed HTTP-only session cookie using `SESSION_SECRET`. No public signup, OAuth, teams, or multi-user account model in V1.

### Decision: V1 notes persistence

Use `better-sqlite3` with plain SQL and one SQLite file. DB code stays server-only in `src/lib/db.ts` and `src/lib/notes.ts`.

### Decision: Local Chrome selection capture

Use a plain-JavaScript Manifest V3 extension as a separate local client. It sends selected text only to bearer-authenticated `POST /api/capture`; the server validates and rate-limits the input, generates a bounded title with OpenAI or a deterministic fallback, and saves through the existing SQLite note path. Production domain and permission changes are deferred.

## Local Patterns

- Routing: protected pages check `isAuthenticated()` server-side and redirect to `/login`
- Data loading: server pages load data, then pass serializable props to client UI
- State: current editor is mostly server/form-based, with `?mode=edit` for saved-note editing
- Home UI: three idea cards appear at a time; cards flip from title to explanation and scrolling loads three more near the page bottom
- Idea controls: a fixed plus always opens an empty full-page plain-text editor; flipped cards expose edit and delete
- Search: home route supports URL query search with `/?q=...`, scanning note title and body
- AI Recall V1: app retrieves notes first with ranked keyword search, sends only top candidate snippets to OpenAI when `OPENAI_API_KEY` exists, and returns closest notes with short reasons
- Chrome capture: `extension/background.js` registers one selection-only context menu and shows `...`, check, or `!` badge state with a tooltip; there is no popup, content script, retry, URL, page title, HTML, or tag capture
- Capture API: Laravel `POST /api/capture` uses `EXTENSION_CAPTURE_TOKEN`, rejects missing configuration with `503`, rejects invalid bearer auth with `401` before parsing JSON, trims and validates 3-5,000 characters, and limits 10 valid captures per minute with a Laravel cache-backed sliding window. It saves UUID notes with UTC timestamps using an OpenAI or safe fallback title unless persistence itself fails.
- Logging: `src/lib/logger.ts` writes safe JSON server logs for auth, note operations, and AI recall metadata
- Backup: `scripts/backup-sqlite.mjs` reads the configured SQLite path, creates a timestamped backup, and runs an integrity check
- AI Recall V1 non-goals: no whole-notebook dump, no LLM tool calling, no vector database, no chat history, no streaming, no advisor behavior yet
- Styling: CSS modules with restrained blue idea cards, focused hover, 3D flip, and blurred fullscreen search/composer overlays
- Deferred UI: the idea body/editor field still feels narrow; expand it in a later frontend refinement, not the extension slice
- Validation: server routes validate private inputs even if browser fields also validate
- Testing: database and backup tests use temporary SQLite files; automated AI tests use fake fetch responses and no real API key; a separate live localhost capture API check used configured OpenAI and created a note successfully
- Error handling: wrong login and empty note use redirect query states
- AI calls: `POST /api/ai/recall` uses local keyword retrieval first, then OpenAI Responses API with structured JSON output when `OPENAI_API_KEY` exists; without a key it returns local matches

## Rules Learned

- Update `docs/build-log.html` after meaningful teaching slices.
- Update `ai/PROJECT_MEMORY.md` when stable product or architecture memory changes.
- Do not log full private note text by default.
