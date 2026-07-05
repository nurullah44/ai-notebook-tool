# Architecture

Keep this document factual and short. Update it only after decisions are stable.

## Current Shape

- App: Next.js with TypeScript
- Database: SQLite via `better-sqlite3`, stored at `SQLITE_DB_PATH` or `data/notebook.db`
- Auth: Founder-only login with a secure session
- AI: OpenAI API for rough-memory note lookup
- Deployment: Hetzner VPS, reached through Tailscale for admin access and Cloudflare Tunnel for web traffic

## Boundaries

- UI: Capture-first notebook interface with a large text note box
- Server actions/API: Login, logout, create notes, read notes, update notes, delete notes, search notes, and call AI
- Database access: Server-only SQLite access
- AI calls: Server-only calls using selected note context, not full database dumps
- Auth/session: Founder-only protected routes and private notes

## Decisions

Use this format:

```markdown
### Decision: <short name>

Context:
Decision:
Reason:
Tradeoff:
Date:
```

### Decision: V1 stack

Context:
The app is founder-only for V1, text-only, and intended to teach real product engineering without SaaS complexity.

Decision:
Use Next.js with TypeScript, SQLite, OpenAI API, and a Hetzner VPS. Admin access will use Tailscale. Public web access will later use Cloudflare Tunnel.

Reason:
This gives a mainstream TypeScript app model while keeping the database and deployment model simple enough to understand. SQLite fits a single-user VPS app better than a hosted database for this learning stage.

Tradeoff:
This is more operational work than Vercel plus Supabase. We become responsible for server setup, backups, logs, updates, and restore practice.

Date:
2026-06-20

### Decision: V1 auth

Context:
The app is founder-only for V1 and protects private notes before note persistence exists.

Decision:
Use one server-checked password from `AUTH_PASSWORD` and a signed HTTP-only session cookie using `SESSION_SECRET`.

Reason:
This keeps auth understandable while still avoiding fake browser-only security. The password and session signing secret stay out of committed code.

Tradeoff:
This is not a multi-user account system and has no email reset or public signup path. If the product becomes public, auth should be redesigned.

Date:
2026-07-01

### Decision: V1 notes persistence

Context:
The app is founder-only and needs note data to survive refreshes before search or AI recall can be useful.

Decision:
Use `better-sqlite3` with plain SQL and store notes in one SQLite file. The default local path is `data/notebook.db`, configurable with `SQLITE_DB_PATH`.

Reason:
SQLite matches a single-user VPS app, keeps backup simple, and teaches direct database persistence without ORM abstraction.

Tradeoff:
`better-sqlite3` is a native dependency and uses synchronous DB calls. That is acceptable for a founder-only VPS app, but not ideal for serverless or high-concurrency SaaS.

Date:
2026-07-04

### Decision: V1 note deletion

Context:
The V1 notebook should support deleting saved notes, but not archive.

Decision:
Use `POST /api/notes/[id]/delete` from a confirmed Delete button. The server deletes the SQLite row and redirects home.

Reason:
HTML forms do not send `DELETE` directly, so a protected POST route keeps the implementation simple and understandable.

Tradeoff:
Deletion is permanent until backups or revision history exist.

Date:
2026-07-05

### Decision: V1 note editing

Context:
Saved notes must stay editable before search and AI recall become useful.

Decision:
Use a simple read/edit mode split. `/notes/[id]` reads a saved note, `/notes/[id]?mode=edit` renders writable fields, and `POST /api/notes/[id]` updates the same SQLite row.

Reason:
This keeps editing understandable and avoids a richer client-side editor before it is needed.

Tradeoff:
There is no autosave, edit conflict handling, or revision history yet.

Date:
2026-07-04

## Deferred Complexity

List things intentionally not used yet.

- Multi-tenancy
- Billing
- Teams
- Public signup
- Queues
- Redis
- Kubernetes
- Autonomous agents
