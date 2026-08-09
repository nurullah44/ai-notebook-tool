# AI Notebook

A private, founder-only notebook that saves text notes, searches them, and uses AI to recall notes from rough memories.

## Local Setup

Laravel is the only active application runtime. It uses the original notebook at `data/notebook.db`.

1. Enter `laravel/` and run `composer setup`.
2. Configure `laravel/.env`, including a physical `SQLITE_DB_PATH`, `AUTH_PASSWORD`, and `EXTENSION_CAPTURE_TOKEN`.
3. Run `php artisan notebook:ready`.
4. If the database already contains notes, run `php artisan notebook:backup` before promoting Laravel.
5. Start Laravel with `composer start`.

Open `http://localhost:4318`, or double-click `Idea Store.lnk` on the desktop. The shortcut starts Laravel only when needed and then opens Chrome.

`composer start` runs the secret-safe readiness gate before serving. It is the local-primary command, not a production web server. Future deployment must first pass `php artisan notebook:ready --production` and use an HTTPS-capable production server stack.

## Retired Next.js Archive

The retired implementation is outside this project at `../idea-store-nextjs-archive`. It has no shared live database. If comparison is ever needed, work inside that archive and build before starting:

```powershell
npm ci
npm run build
npm run start
```

## Local Chrome Extension

Run Laravel from `laravel/` with `composer start`; it keeps the extension contract available at exactly `http://localhost:4318`.

1. Start Laravel and keep it available at exactly `http://localhost:4318`.
2. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the `extension/` folder.
3. Set one identical `EXTENSION_CAPTURE_TOKEN` value in `laravel/.env` and the extension options. Keep the app URL exactly `http://localhost:4318`.
4. Highlight 3-5,000 characters on a web page, right-click, and choose **Save to Idea Store**.

After editing files under `extension/`, return to `chrome://extensions` and reload the extension before testing the change.

## Commands

Laravel commands run from `laravel/`; extension tests run from the project root:

```powershell
composer start
composer test
php artisan notebook:backup
php artisan notebook:restore storage/app/private/backups/notebook-<timestamp>.db --force
node --test extension/background.test.js extension/capture.test.js extension/options.test.js
```

Restore must run while the app is stopped. It validates the chosen backup and preserves the current database as a verified safety backup before replacement.

## Project Guide

- `docs/inner-voice.html`: stage map
- `docs/build-log.html`: teaching-oriented build history
- `docs/ARCHITECTURE.md`: stable technical decisions
- `docs/OPERATIONS.md`: logs, backups, restore, and rollback
