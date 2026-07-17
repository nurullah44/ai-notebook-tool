# Architecture

Keep this document factual and short. Update it only after decisions are stable.

## Current Shape

- App: Next.js with TypeScript
- Extension: unpacked Manifest V3 Chrome extension in `extension/`, implemented in plain JavaScript
- Database: SQLite via `better-sqlite3`, stored at `SQLITE_DB_PATH` or `data/notebook.db`
- Auth: Founder-only login with a secure session
- AI: OpenAI Responses API for rough-memory note lookup and capture-title generation, defaulting to `gpt-5.4-mini`
- Capture API: dedicated bearer-authenticated `POST /api/capture` endpoint for selected text
- Logging: structured JSON stdout/stderr logs with metadata only
- Backup: manual verified SQLite backup through `npm run backup`, stored locally in ignored `backups/`
- Tests: focused Vitest coverage for auth, notes, search, AI boundaries, backup, the capture API, and extension behavior; database tests use temporary SQLite files
- Deployment: Hetzner VPS, reached through Tailscale for admin access and Cloudflare Tunnel for web traffic

## Boundaries

- UI: Capture-first notebook interface with a large text note box
- Extension client: selection-only context menu, local settings, API request, and badge/tooltip feedback; no popup or content script
- Server actions/API: Login, logout, create notes, read notes, update notes, delete notes, search notes, call AI, and capture selected text
- Database access: Server-only SQLite access
- AI calls: Server-only calls using selected note context for recall or selected text for capture-title generation
- Auth/session: Founder-only protected routes plus a separate capture token for the extension
- Logs: Server-only operational metadata through `src/lib/logger.ts`; capture logs never include the token, selected text, or generated title

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

### Decision: V1 keyword search

Context:
AI recall needs retrieval, but we should prove basic note search before adding model calls or vector search.

Decision:
Use the home route query string, `/?q=...`, and a server-side SQLite `LIKE` search over note title and body.

Reason:
This creates a refreshable, linkable search state without new routes, client state, or extra dependencies.

Tradeoff:
This is exact keyword matching. It has no typo tolerance, semantic matching, ranking, highlighting, or vector search yet.

Date:
2026-07-05

### Decision: AI Recall V1

Context:
The app has persisted notes and keyword search. The next learning step is AI recall, but we should avoid sending the whole notebook or building tool-calling before the basic retrieval flow is proven.

Decision:
Use app-side retrieval first. `POST /api/ai/recall` receives a rough user question, authenticates the request, retrieves matching notes with ranked keyword search, sends only those candidate note snippets to OpenAI when `OPENAI_API_KEY` is configured, and returns closest note matches with short reasons. If no key is configured, the route falls back to local retrieval results. The result shape is:

```ts
type RecallResult = {
  answer: string;
  matches: {
    noteId: string;
    title: string;
    reason: string;
  }[];
};
```

Reason:
This teaches the core AI product loop without extra search infrastructure: retrieve context, constrain model input, ask for a small structured answer, and show note references to the user.

Tradeoff:
Keyword retrieval may miss vague memories and synonyms. OpenAI can only reason over candidates the app already found. Tool calling, embeddings, semantic search, streaming, chat history, and full advisor behavior stay deferred.

Date:
2026-07-08

### Decision: V1 operational logging

Context:
The app now has auth, persistent notes, deletion, search, and paid AI calls. We need enough visibility to debug failures without exposing private note content.

Decision:
Use a small server-only logger that writes JSON lines to stdout/stderr. Log auth events, note operation metadata, and AI recall metadata. Do not log passwords, note bodies, note snippets, full prompts, API keys, or raw model responses.

Reason:
This works locally and on a VPS without adding a logging service or dashboard. It also teaches the important logging boundary: log what happened, not the user's private content.

Tradeoff:
Logs are not searchable inside the app, and retention/rotation still depends on the future VPS process manager or system journal setup.

Date:
2026-07-10

### Decision: V1 SQLite backup

Context:
The notebook now contains persistent private notes. A database failure or mistaken deletion could otherwise remove the only copy.

Decision:
Use `npm run backup` to create a timestamped SQLite backup in the ignored `backups/` directory. The command uses SQLite's backup API, verifies database integrity, and reports the copied note count.

Reason:
This gives the founder a real, understandable recovery artifact without adding cloud storage, a scheduler, or another service before deployment.

Tradeoff:
The backup is manual and stored on the same machine. A local isolated restore was verified, but scheduling, off-server copies, encryption, retention, and a production VPS restore drill remain deployment work.

Date:
2026-07-11

### Decision: Idea Store collection frontend

Context:
The notebook behavior worked, but the three-column editor presented ideas like ordinary files instead of valuable objects worth revisiting.

Decision:
Keep the existing auth, SQLite, CRUD routes, URL keyword search, and AI recall endpoint. Replace only the client presentation with an Idea Store collection: three title cards at a time, explanation on flip, fullscreen search and composer overlays, and edit/delete controls on each flipped card.

Reason:
The visual model now matches the product direction without migrating data or rebuilding working backend behavior. Server pages still load serializable note data and ordinary forms still submit to the same routes.

Tradeoff:
The collection has no automatic resurfacing behavior yet. Scrolling reveals more ideas, but the future way to explore the whole idea chain remains undecided. The visual redesign has browser verification but no automated end-to-end or screenshot regression test.

Date:
2026-07-11

### Decision: Local Chrome selection capture

Context:
Capturing a useful idea from another page required copying text, switching tabs, naming it, and saving it manually. The extension is a separate client and must not receive website sessions or paid API secrets.

Decision:
Use an unpacked plain-JavaScript Manifest V3 extension in `extension/`. It registers one selected-text context-menu action, stores `appUrl` and the capture token in `chrome.storage.local`, and has host permission only for `http://localhost:3000/*`. It sends only trimmed selected text to `POST /api/capture`; it does not send a page URL, page title, HTML, tags, or browsing data.

The server authenticates a dedicated bearer token, accepts 3-5,000 characters, and permits 10 valid captures per minute per process. It asks the OpenAI Responses API for a 4-10 word title no longer than 80 characters, using `gpt-5.4-mini` by default, `store: false`, prompt-injection protection, and a 25-second abort. The shorter AI budget leaves room below Chrome's 30-second service-worker fetch limit. Invalid AI output, timeout, or AI failure uses a deterministic fallback title and still saves the note to the existing SQLite database. Capture logs contain metadata only: text length, duration, model or source, and error name.

Reason:
This keeps extension power narrow and keeps authentication, validation, AI cost, private-data handling, and persistence on the server. Badge text and tooltips provide loading, success, or failure feedback without adding a popup, content script, retry queue, or second data model.

Tradeoff:
V1 is local and unpacked. The rate limit is process-local, the capture token is stored in the Chrome profile, and the actual unpacked context-menu workflow still needs a manual Chrome check. Production domain and host-permission changes remain deferred until deployment.

Date:
2026-07-17

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
- LLM tool calling
- Vector search
- Streaming AI responses
- Production Chrome extension domain and host permission
