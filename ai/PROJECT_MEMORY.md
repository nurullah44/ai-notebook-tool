# Project Memory

Stable facts future Codex sessions should remember. Keep short.

## Product

- Name: AI Notebook
- Domain: private text notebook with later AI rough-memory recall
- Audience: founder-only V1
- Real problem: user remembers rough shape of ideas but not exact note wording or location
- Smallest useful version: login, create/read/edit/delete notes, search notes, ask AI about own notes, logs, backups, targeted tests, deployment notes
- Current stage: Prototype; Backup Slice is done. Next planned stage is Tests Slice.

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

## Stack Decisions

- Frontend: Next.js App Router with TypeScript
- Backend: Next.js server routes and server components
- Database/storage: SQLite through `better-sqlite3`, default file `data/notebook.db`
- Auth: founder-only one-password login with signed HTTP-only session cookie
- AI provider: OpenAI Responses API for rough-memory note lookup, default model `gpt-5.4-mini`
- Deployment: Hetzner VPS planned, with Tailscale admin access and Cloudflare Tunnel web access
- Logging: structured JSON stdout/stderr logs with metadata only
- Backup: manual `npm run backup` command creates an integrity-checked SQLite copy in ignored `backups/`; an isolated local restore test passed; scheduling and off-server storage are deferred to deployment

## Architecture Decisions

### Decision: V1 stack

Use Next.js, TypeScript, SQLite, OpenAI API, and a Hetzner VPS. This keeps the app mainstream and TypeScript-based while preserving a simple single-file database model.

### Decision: V1 auth

Use one server-checked password from `AUTH_PASSWORD` and a signed HTTP-only session cookie using `SESSION_SECRET`. No public signup, OAuth, teams, or multi-user account model in V1.

### Decision: V1 notes persistence

Use `better-sqlite3` with plain SQL and one SQLite file. DB code stays server-only in `src/lib/db.ts` and `src/lib/notes.ts`.

## Local Patterns

- Routing: protected pages check `isAuthenticated()` server-side and redirect to `/login`
- Data loading: server pages load data, then pass serializable props to client UI
- State: current editor is mostly server/form-based, with `?mode=edit` for saved-note editing
- Home UI: root page starts with a large centered plus button; clicking it opens the new-note editor
- Recent notes UI: row dots reveal a trash icon; clicking trash deletes immediately
- Search: home route supports URL query search with `/?q=...`, scanning note title and body
- AI Recall V1: app retrieves notes first with ranked keyword search, sends only top candidate snippets to OpenAI when `OPENAI_API_KEY` exists, and returns closest notes with short reasons
- Logging: `src/lib/logger.ts` writes safe JSON server logs for auth, note operations, and AI recall metadata
- Backup: `scripts/backup-sqlite.mjs` reads the configured SQLite path, creates a timestamped backup, and runs an integrity check
- AI Recall V1 non-goals: no whole-notebook dump, no LLM tool calling, no vector database, no chat history, no streaming, no advisor behavior yet
- Styling: CSS modules with calm blue visual direction
- Validation: server routes validate private inputs even if browser fields also validate
- Testing: manual checks for now; automated tests planned later
- Error handling: wrong login and empty note use redirect query states
- AI calls: `POST /api/ai/recall` uses local keyword retrieval first, then OpenAI Responses API with structured JSON output when `OPENAI_API_KEY` exists; without a key it returns local matches

## Rules Learned

- Update `docs/build-log.html` after meaningful teaching slices.
- Update `ai/PROJECT_MEMORY.md` when stable product or architecture memory changes.
- Do not log full private note text by default.
