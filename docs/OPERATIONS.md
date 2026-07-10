# Operations

## Logs

- App logs: JSON lines written to server stdout/stderr through `src/lib/logger.ts`.
- Auth logs: login success, login failure, and logout.
- Note logs: create, update, delete, and rejected empty-note attempts. Logs include note IDs only.
- AI call logs: recall completion/failure, model name, candidate count, returned match count, duration, and whether OpenAI was used.
- Error logs: safe metadata only. Do not log passwords, full notes, AI prompts, note snippets, API keys, or raw model responses.

Example log shape:

```json
{
  "timestamp": "2026-07-10T12:00:00.000Z",
  "level": "info",
  "event": "ai.recall_completed",
  "metadata": {
    "candidateCount": 3,
    "durationMs": 812,
    "matchCount": 2,
    "model": "gpt-5.4-mini",
    "usedOpenAI": true
  }
}
```

Production retention is deferred to the Deployment Slice. On the VPS, these logs should be collected by the process manager or system journal.

## Backups

- Database backup method: SQLite file copy/dump, exact command deferred to Backup Slice
- Backup schedule:
- Restore test:
- Deleted notes cannot be restored until backups exist and restore is tested.

## Rollback

- Last known good deploy:
- Rollback command/process:

## Incident Notes

Use this format:

```markdown
### Incident: <short name>

Date:
Impact:
Cause:
Fix:
Lesson:
```
