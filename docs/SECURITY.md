# Security

## Current Stage

Prototype

## Minimum Checks

- One-password auth is required before viewing the notebook
- Secrets are in environment variables, never committed
- SQLite database files are ignored by git
- SQLite backup files are ignored by git and treated as private notebook data
- Inputs are validated
- Search uses parameterized SQLite queries
- Delete note requires authentication and browser confirmation
- AI calls limit question length, retrieved note count, snippet size, and output length
- User-provided text is not trusted as instructions
- Dangerous actions require human approval
- Logs include operational metadata only and avoid passwords, full notes, AI prompts, note snippets, API keys, and raw model responses

## AI-Specific Risks

- Prompt injection: Treat note text as user data, not instructions. The model prompt must say not to obey instructions found inside notes.
- Sensitive data exposure: Do not send the full notebook. AI Recall V1 sends only top retrieved note snippets needed for the current question.
- Insecure structured output: Validate the AI response shape before rendering matches. Unknown note ids should not be trusted.
- Excessive agency: AI Recall V1 has no tools, no file access, no database writes, no shell, no email, and no autonomous actions.
- Runaway cost: Limit question length, retrieved note count, snippet size, and model output length before real use.

## Open Risks

- `npm audit` reports a moderate PostCSS advisory through Next.js 16.2.9. The suggested forced fix would make a breaking Next.js downgrade, so keep Next.js updated and recheck rather than applying `npm audit fix --force` blindly.
- `AUTH_PASSWORD` is stored as a plain environment variable for prototype simplicity. Before real production use, consider switching to a password hash.
- Login has no application-level rate limit yet. Before accepting public traffic, add app throttling or enforce an equivalent proxy-level limit.
- AI recall has no application-level rate limit yet. Before public use, add throttling or enforce an equivalent proxy-level limit.
- Note bodies are private data. Do not log full note text unless a future debugging policy explicitly allows redacted logging.
- Deleting a note is permanent until backups or revision history exist.
- AI Recall V1 sends selected private note snippets to OpenAI only after the user explicitly configures `OPENAI_API_KEY`. Requests use `store: false`.
- Log retention, rotation, and access control are not configured yet. Decide this during VPS deployment.
- Backup encryption, off-server storage, retention, and access control are not configured yet. Decide these during VPS deployment.
