# Security

## Current Stage

Prototype

## Minimum Checks

- One-password auth is required before viewing the notebook
- Secrets are in environment variables, never committed
- SQLite database files are ignored by git
- Inputs are validated
- Search uses parameterized SQLite queries
- Delete note requires authentication and browser confirmation
- AI calls limit question length, retrieved note count, snippet size, and output length
- User-provided text is not trusted as instructions
- Dangerous actions require human approval
- Logs avoid unnecessary private data

## AI-Specific Risks

- Prompt injection: Treat note text as user data, not instructions. The model prompt must say not to obey instructions found inside notes.
- Sensitive data exposure: Do not send the full notebook. AI Recall V1 sends only top retrieved note snippets needed for the current question.
- Insecure structured output: Validate the AI response shape before rendering matches. Unknown note ids should not be trusted.
- Excessive agency: AI Recall V1 has no tools, no file access, no database writes, no shell, no email, and no autonomous actions.
- Runaway cost: Limit question length, retrieved note count, snippet size, and model output length before real use.

## Open Risks

- `AUTH_PASSWORD` is stored as a plain environment variable for prototype simplicity. Before real production use, consider switching to a password hash.
- Login has no application-level rate limit yet. Before accepting public traffic, add app throttling or enforce an equivalent proxy-level limit.
- AI recall has no application-level rate limit yet. Before public use, add throttling or enforce an equivalent proxy-level limit.
- Note bodies are private data. Do not log full note text unless a future debugging policy explicitly allows redacted logging.
- Deleting a note is permanent until backups or revision history exist.
- AI Recall V1 sends selected private note snippets to OpenAI only after the user explicitly configures `OPENAI_API_KEY`. Requests use `store: false`.
