# AI Notebook

A private, founder-only notebook that saves text notes, searches them, and uses AI to recall notes from rough memories.

## Local Setup

Laravel is now the primary local runtime. Next.js remains installed but passive for later comparison or fallback.

1. Enter `laravel/` and run `composer setup`.
2. Configure `laravel/.env`, including a physical `SQLITE_DB_PATH`, `AUTH_PASSWORD`, and `EXTENSION_CAPTURE_TOKEN`.
3. Run `php artisan notebook:ready`.
4. If the database already contains notes, run `php artisan notebook:backup` before promoting Laravel.
5. Start Laravel with `composer start`.

Open `http://localhost:3000`.

`composer start` runs the secret-safe readiness gate before serving. It is the local-primary command, not a production web server. Future deployment must first pass `php artisan notebook:ready --production` and use an HTTPS-capable production server stack.

## Passive Next.js Reference

Next.js is not deleted and should remain stopped while Laravel owns port 3000. When comparison is needed, build it first and start it explicitly:

```powershell
npm install
npm run build
npm run start
```

## Local Chrome Extension

Run Laravel from `laravel/` with `composer start`; it keeps the existing extension contract available at exactly `http://localhost:3000`.

1. Start Laravel and keep it available at exactly `http://localhost:3000`.
2. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the `extension/` folder.
3. Set one identical `EXTENSION_CAPTURE_TOKEN` value in `laravel/.env` and the extension options. Keep the app URL exactly `http://localhost:3000`.
4. Highlight 3-5,000 characters on a web page, right-click, and choose **Save to Idea Store**.

After editing files under `extension/`, return to `chrome://extensions` and reload the extension before testing the change.

## Commands

```powershell
npm run dev
npm test
npm run lint
npm run build
npm run backup
```

`npm test` runs the Next.js reference tests with Vitest and the 19 extension tests with Node's built-in runner.

`npm run backup` creates a timestamped SQLite backup in the git-ignored `backups/` directory and verifies its integrity. Restore instructions live in `docs/OPERATIONS.md`.

Laravel migration recovery commands run from `laravel/`:

```powershell
php artisan notebook:backup
php artisan notebook:restore storage/app/private/backups/notebook-<timestamp>.db --force
```

Restore must run while the app is stopped. It validates the chosen backup and preserves the current database as a verified safety backup before replacement.

## Project Guide

- `docs/inner-voice.html`: stage map
- `docs/build-log.html`: teaching-oriented build history
- `docs/ARCHITECTURE.md`: stable technical decisions
- `docs/OPERATIONS.md`: logs, backups, restore, and rollback
