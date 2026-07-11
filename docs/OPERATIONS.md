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

- Run `npm run backup` from the project root.
- The command reads `SQLITE_DB_PATH`, falling back to `data/notebook.db`.
- It creates a timestamped file in `backups/`, then runs SQLite's integrity check and reports the copied note count.
- The `backups/` directory is ignored by git because backup files contain private notebook data.
- Backup schedule: manual for local development; automate it during the Deployment Slice when the VPS scheduler is chosen.

### Restore Procedure

1. Stop the app so it cannot write to SQLite during restore.
2. Move the current database file and any matching `-wal` and `-shm` sidecar files into a separate recovery directory. Keep this old file set for investigation.
3. Confirm no old database, `-wal`, or `-shm` file remains at the configured `SQLITE_DB_PATH` location.
4. Copy the chosen `backups/notebook-<timestamp>.db` file to the path configured by `SQLITE_DB_PATH`.
5. Start the app.
6. Verify login, recent notes, keyword search, and AI recall.

Deleted notes can be restored only from a backup created before the deletion. A local restore test succeeded on 2026-07-11 by copying a backup to a temporary database and verifying integrity and note count without touching the live database.

## Rollback

- Last known good deploy:
- Rollback command/process: stop the app, restore the previous app release and chosen SQLite backup, restart, then run the verification checklist above.

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
