# Deployment

## Current Target

- Status: deferred; no deployment or traffic switch is authorized yet
- Planned platform: Hetzner VPS
- Domain: undecided
- Application: Laravel/PHP with SQLite
- Web server/process manager: undecided
- Next.js: retired to the separate local `../idea-store-nextjs-archive`; it is not part of deployment

## Environment Variables

```text
AUTH_PASSWORD
SQLITE_DB_PATH
EXTENSION_CAPTURE_TOKEN
OPENAI_API_KEY
OPENAI_MODEL
APP_KEY
APP_ENV
APP_DEBUG
APP_URL
```

`OPENAI_MODEL` defaults to `gpt-5.4-mini`. Keep `EXTENSION_CAPTURE_TOKEN` separate from the founder password and `APP_KEY`.

Before any future deployment, `APP_ENV=production`, `APP_DEBUG=false`, an HTTPS `APP_URL`, and secure session cookies must make `php artisan notebook:ready --production` pass.

## Deploy Steps

These steps are a deferred plan, not completed deployment evidence:

1. Provision a small Hetzner VPS.
2. Install and verify Tailscale for private admin access.
3. Lock down public inbound access before treating the server as production.
4. Deploy Laravel and a freshly verified SQLite backup.
5. Publish the app through Cloudflare Tunnel.
6. Run `php artisan notebook:ready --production`, then verify login, note creation, search, AI lookup, capture, logs, and backup.

## Chrome Extension Deployment

The current unpacked extension is local-only and permits only `http://localhost:3000/*`. Do not treat capture as production-ready until a production app domain is chosen and both the manifest host permission and extension app URL are updated together. Chrome Web Store distribution is not part of this slice.

For current local use, run Laravel with `composer start` from `laravel/`; it binds to `http://localhost:3000`, matching the unchanged extension permission and saved app URL exactly.

## Migration Notes

- Fresh Laravel database migration command: `php artisan migrate`; existing compatible notebook data must not be recreated or reshaped.
- Database backup command: `cd laravel && php artisan notebook:backup`.
- Local fallback: stop Laravel and restore a verified SQLite backup; the retired Next.js archive is not a data fallback.
- Future rollback plan: stop the app, restore the previous Laravel release and chosen SQLite backup, restart, then verify critical flows. Git rollback is not database rollback.

## Verification

- Local readiness: `php artisan notebook:ready`
- Future production readiness: `php artisan notebook:ready --production`
- App loads:
- Login works:
- Notes flow works:
- AI call works:
- Capture API works with the dedicated token: passed locally on 2026-08-08 against isolated SQLite
- Unpacked extension context-menu capture works in Chrome: request and persistence passed locally on 2026-08-08; success badge/tooltip observation remains pending
- Logs visible: Laravel JSON stderr shape and metadata-only capture/recall events verified locally
- `php artisan notebook:backup` succeeds and reports matching note count plus `Integrity: ok`:
