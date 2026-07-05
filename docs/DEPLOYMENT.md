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
```

## Deploy Steps

1. Provision a small Hetzner VPS.
2. Install and verify Tailscale for private admin access.
3. Lock down public inbound access before treating the server as production.
4. Deploy the Next.js app and SQLite database file.
5. Publish the app through Cloudflare Tunnel.
6. Verify login, note creation, search, AI lookup, logs, and backup.

## Migration Notes

- Database migration command: table creation currently runs at app startup through `src/lib/db.ts`.
- Rollback plan: Restore the previous app release and SQLite backup. Exact command deferred until the app exists.

## Verification

- App loads:
- Login works:
- Notes flow works:
- AI call works:
- Logs visible:
