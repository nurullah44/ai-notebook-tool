# Security

## Current Stage

Prototype

## Minimum Checks

- One-password auth is required before viewing the notebook
- Laravel login regenerates the encrypted cookie session; logout invalidates it and regenerates the CSRF token
- Laravel login and logout forms use CSRF protection; protected product routes require founder session middleware
- Laravel collection and direct-note routes require the founder session; Blade escapes private titles and bodies before rendering
- Laravel create, update, and delete routes require the founder session and CSRF-checked POST forms; empty bodies are rejected before database writes
- Laravel session cookies are HTTP-only, SameSite=Lax, and forced Secure when `APP_ENV=production`
- Secrets are in environment variables, never committed
- SQLite database files are ignored by git
- SQLite backup files are ignored by git and treated as private notebook data
- Inputs are validated
- Laravel extension capture uses a dedicated bearer token, not the founder password or website session; missing server token configuration returns `503`, and invalid auth returns `401` before the request JSON is parsed
- The unpacked extension can reach only `http://localhost:3000/*`
- Capture uses JavaScript-compatible Unicode trimming and 3-5,000 UTF-16 code-unit limits; an atomic Laravel-cache sliding window permits 10 valid captures per minute across workers
- Search uses parameterized SQLite queries
- Delete note requires authentication, CSRF protection, and browser confirmation
- AI calls limit question length, retrieved note count, snippet size, and output length
- The Laravel AI recall endpoint requires the founder session, limits questions to 500 characters, sends only retrieved candidate snippets, uses `store: false`, validates returned note IDs against retrieved candidates, and falls back to local matches. Automated, Chrome, and approved live-call verification passed.
- User-provided note and selected text is not trusted as instructions
- Dangerous actions require human approval
- Logs include operational metadata only and avoid passwords, full notes, AI prompts, note snippets, API keys, and raw model responses
- Laravel catches note read/write and AI candidate-query `QueryException` failures before framework reporting can serialize private search, question, title, or body SQL bindings; failure events contain only operation metadata and exception class.
- Capture logs may include text length, duration, model or title source, and error name, but never the bearer token, selected text, or generated title
- Capture persistence generates UUID note IDs and UTC timestamps; unexpected failures return a safe `500` without leaking private content or internals
- Laravel backup/restore uses consistent SQLite copies, validates integrity and note count, requires explicit `--force` for restore, and preserves the previous target as a private safety backup before replacement
- `notebook:ready` reports only named pass/fail checks; it never prints secret values or private note content
- Local primary use keeps Next.js stopped so two runtimes cannot write the same SQLite database concurrently

## AI-Specific Risks

- Prompt injection: Treat note and captured text as user data, not instructions. Model prompts must say not to obey instructions found inside that data.
- Sensitive data exposure: Do not send the full notebook. AI Recall V1 sends only top retrieved note snippets; capture title generation sends only the selected text, with `store: false`.
- Insecure structured output: Validate the AI response shape before rendering matches. Unknown note ids should not be trusted.
- Excessive agency: AI Recall V1 has no tools, no file access, no database writes, no shell, no email, and no autonomous actions.
- Runaway cost: Recall limits question/context/output sizes. Capture limits selected-text and title sizes, atomically permits 10 valid requests per minute across workers through Laravel cache, requires strict 4-10 word and at-most-80-character title output, uses `store: false`, and times out OpenAI after 25 seconds.

## Open Risks

- `npm audit` reports a moderate PostCSS advisory through Next.js 16.2.9. The suggested forced fix would make a breaking Next.js downgrade, so keep Next.js updated and recheck rather than applying `npm audit fix --force` blindly.
- `AUTH_PASSWORD` is stored as a plain environment variable for prototype simplicity. Before real production use, consider switching to a password hash.
- Laravel production must run behind HTTPS with `APP_ENV=production`; otherwise browsers cannot safely return Secure session cookies.
- Login has no application-level rate limit yet. Before accepting public traffic, add app throttling or enforce an equivalent proxy-level limit.
- AI recall has no application-level rate limit yet. Before public use, add throttling or enforce an equivalent proxy-level limit.
- The capture token is stored in `chrome.storage.local`. Treat the Chrome profile as trusted local storage and rotate the token if that profile is exposed.
- Production capture is not enabled: update both the extension host permission and configured app domain only after deployment is defined.
- Laravel serves on the unchanged extension's exact localhost origin, 19 extension tests pass with Node's built-in runner, and isolated direct plus unpacked-Chrome live captures persisted without touching the real notebook.
- Note bodies are private data. Do not log full note text unless a future debugging policy explicitly allows redacted logging.
- Deleting a note is recoverable only when an older verified backup exists; there is no revision history.
- AI Recall V1 sends selected private note snippets to OpenAI only after the user explicitly configures `OPENAI_API_KEY`. Requests use `store: false`.
- Log retention, rotation, and access control are not configured yet. Decide this during VPS deployment.
- Backup encryption, off-server storage, retention, and access control are not configured yet. Decide these during VPS deployment.
- `composer start` uses Laravel's development server and is local-only. A real deployment still requires an HTTPS-capable web server/process manager and `notebook:ready --production`.
