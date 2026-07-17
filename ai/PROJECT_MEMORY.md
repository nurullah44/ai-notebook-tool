# Project Memory

Stable facts future Codex sessions should remember. Keep short.

## Product

- Name: Idea Store
- Domain: private collection of ideas with AI rough-memory recall
- Audience: founder-only V1
- Real problem: user remembers rough shape of ideas but not exact note wording or location
- Smallest useful version: login, create/read/edit/delete notes, search notes, ask AI about own notes, logs, backups, targeted tests, deployment notes
- Current stage: Prototype; the V2 idea collection frontend is implemented. The local Chrome capture slice has completed API and extension implementation and is at Stage 5, with only the manual unpacked context-menu workflow pending. The next planned core stage remains the Deployment Slice.

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

The parallel Chrome capture stage map is `docs/inner-voice-extension.html`: stages 1-4 are done, Stage 5 is current with automated checks, a live API/OpenAI save, and options-page inspection done, and the unpacked Chrome context-menu check pending. Stage 6 production domain setup is deferred.

## Stack Decisions

- Frontend: Next.js App Router with TypeScript
- Backend: Next.js server routes and server components
- Database/storage: SQLite through `better-sqlite3`, default file `data/notebook.db`
- Auth: founder-only one-password login with signed HTTP-only session cookie
- AI provider: OpenAI Responses API for rough-memory note lookup and capture-title generation, default model `gpt-5.4-mini`
- Extension: local unpacked Manifest V3 client in plain JavaScript; selection-only context menu, settings in `chrome.storage.local`, and host permission only for `http://localhost:3000/*`
- Deployment: Hetzner VPS planned, with Tailscale admin access and Cloudflare Tunnel web access
- Logging: structured JSON stdout/stderr logs with metadata only
- Backup: manual `npm run backup` command creates an integrity-checked SQLite copy in ignored `backups/`; an isolated local restore test passed; scheduling and off-server storage are deferred to deployment
- Testing: Vitest in Node; tests use fake secrets and must never use the real notebook database. Capture verification recorded 22 auth/capture-route checks and 19 extension pure/service-worker/options checks passing.

## Architecture Decisions

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
- Capture API: `POST /api/capture` uses `EXTENSION_CAPTURE_TOKEN`, trims and validates 3-5,000 characters, limits 10 valid captures per minute per process, and always saves with an AI or deterministic fallback title unless persistence itself fails
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
