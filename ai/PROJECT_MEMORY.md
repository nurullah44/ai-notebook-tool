# Project Memory

Stable facts future Codex sessions should remember. Keep short.

## Product

- Name: AI Notebook
- Domain: private text notebook with later AI rough-memory recall
- Audience: founder-only V1
- Real problem: user remembers rough shape of ideas but not exact note wording or location
- Smallest useful version: login, create/read/edit/delete notes, search notes, ask AI about own notes, logs, backups, targeted tests, deployment notes
- Current stage: Prototype; Notes Slice is done. Search Slice is next.

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
6. Search Slice - next

## Stack Decisions

- Frontend: Next.js App Router with TypeScript
- Backend: Next.js server routes and server components
- Database/storage: SQLite through `better-sqlite3`, default file `data/notebook.db`
- Auth: founder-only one-password login with signed HTTP-only session cookie
- AI provider: OpenAI API planned for rough-memory note lookup
- Deployment: Hetzner VPS planned, with Tailscale admin access and Cloudflare Tunnel web access
- Logging: deferred
- Backup: deferred; SQLite file backup path required before real use

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
- Styling: CSS modules with calm blue visual direction
- Validation: server routes validate private inputs even if browser fields also validate
- Testing: manual checks for now; automated tests planned later
- Error handling: wrong login and empty note use redirect query states
- AI calls: not implemented yet

## Rules Learned

- Update `docs/build-log.html` after meaningful teaching slices.
- Update `ai/PROJECT_MEMORY.md` when stable product or architecture memory changes.
- Do not log full private note text by default.
