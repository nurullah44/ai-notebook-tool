# Deployment

## Current Target

- Platform: Hetzner VPS
- Domain:
- Database: SQLite file on the VPS
- Environment: Single Node.js app process, exact process manager deferred

## Environment Variables

```text
AUTH_PASSWORD
SESSION_SECRET
SQLITE_DB_PATH
EXTENSION_CAPTURE_TOKEN
OPENAI_API_KEY
OPENAI_MODEL
```

`OPENAI_MODEL` defaults to `gpt-5.4-mini`. Keep `EXTENSION_CAPTURE_TOKEN` separate from the founder password and session secret.

## Deploy Steps

1. Provision a small Hetzner VPS.
2. Install and verify Tailscale for private admin access.
3. Lock down public inbound access before treating the server as production.
4. Deploy the Next.js app and SQLite database file.
5. Publish the app through Cloudflare Tunnel.
6. Verify login, note creation, search, AI lookup, logs, and backup.

## Chrome Extension Deployment

The current unpacked extension is local-only and permits only `http://localhost:3000/*`. Do not treat capture as production-ready until a production app domain is chosen and both the manifest host permission and extension app URL are updated together. Chrome Web Store distribution is not part of this slice.

## Migration Notes

- Database migration command: table creation currently runs at app startup through `src/lib/db.ts`.
- Database backup command: `npm run backup`.
- Rollback plan: Stop the app, restore the previous app release and chosen SQLite backup, restart, then verify the critical flows.

## Verification

- App loads:
- Login works:
- Notes flow works:
- AI call works:
- Capture API works with the dedicated token:
- Unpacked extension context-menu capture works in Chrome: manual and still pending locally
- Logs visible:
- `npm run backup` succeeds and the backup passes its integrity check:
