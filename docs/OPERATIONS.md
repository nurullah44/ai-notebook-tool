# Operations

## Logs

- Laravel migration logs: JSON lines written to stderr through Laravel Monolog and `JsonFormatter`. The Next.js reference logger remains read-only until cutover.
- Auth logs: login success, login failure, and logout.
- Note logs: create, update, delete, and rejected empty-note attempts. Logs include note IDs only.
- AI recall logs: `ai.recall_completed` for local/model results and error-level `ai.recall_failed` for provider failures, with model, candidate count, returned match count, duration, OpenAI use, outcome, status/error class, and token counts when available.
- Capture logs: rejection/fallback/completion/failure plus safe metadata such as text length, duration, model, title source, reason, or error name.
- Error logs: safe metadata only. Note reads, keyword search, AI candidate retrieval, and note writes catch query exceptions before SQL bindings can expose searches, questions, titles, or bodies. Do not log passwords, capture tokens, full notes, selected text, generated titles, AI questions/prompts, note snippets, API keys, or raw model responses.

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

## Local Chrome Capture

- The unpacked extension targets exactly `http://localhost:3000` and has no production host permission.
- The badge shows `...` while saving, a check mark after success, and `!` after failure. Its tooltip gives the current status or safe error message.
- There is no automatic retry. After correcting the app URL, token, server, or input problem, retry the context-menu action intentionally.
- Laravel holds the 10-valid-captures-per-minute limit in an atomic cache-backed sliding window shared by server workers.

Verification recorded on 2026-08-08: 39 Laravel tests with 184 assertions passed; 19 extension tests passed with Node's built-in runner; direct and unpacked-Chrome live capture requests used configured OpenAI, returned `201`, and persisted only to isolated temporary SQLite. The real notebook was not opened for writes. Browser automation could not inspect `chrome://extensions` or the native success badge/tooltip, so independent manual observation of that visual feedback remains pending.

## Backups

- Run `php artisan notebook:backup` from `laravel/`.
- The command reads Laravel's configured SQLite path and defaults output to `storage/app/private/backups/`.
- It uses SQLite's online backup API, creates a timestamped `notebook-*.db`, then reads integrity and note count from that completed snapshot. Failed verification removes the incomplete artifact.
- Laravel private storage is ignored by git because backup files contain private notebook data.
- Backup schedule: manual for local development; automate it during the Deployment Slice when the VPS scheduler is chosen.

### Restore Procedure

1. Stop the app so it cannot write to SQLite during restore.
2. Run `php artisan notebook:restore storage/app/private/backups/notebook-<timestamp>.db --force` from `laravel/`.
3. The command validates the chosen backup before touching the target, creates a verified `notebook-pre-restore-*.db` safety backup under ignored `storage/app/private/backups/`, removes stale `-wal`/`-shm` sidecars, restores, and verifies integrity plus note count.
4. Keep both the chosen backup and pre-restore safety backup until verification and the observation window finish.
5. Start the app.
6. Verify login, recent notes, keyword search, AI recall, and extension capture.

Deleted notes can be restored only from a backup created before the deletion. Four Laravel tests rehearse consistent backup, forced restore with an ignored safety copy, invalid-backup rejection, and failed-artifact cleanup on temporary physical SQLite files; the real notebook is never used.

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
