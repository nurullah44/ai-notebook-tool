# AI Notebook

A private, founder-only notebook that saves text notes, searches them, and uses AI to recall notes from rough memories.

## Local Setup

1. Copy `.env.example` to `.env.local` and fill the local secrets.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

Open `http://localhost:3000`.

## Local Chrome Extension

During the migration, run Laravel from `laravel/` with `composer dev`; it keeps the existing extension contract available at exactly `http://localhost:3000`. The Next.js reference starts only after `npm run build`, using `npm run start`.

1. Start the chosen local runtime and keep it available at exactly `http://localhost:3000`.
2. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the `extension/` folder.
3. Set one identical `EXTENSION_CAPTURE_TOKEN` value in the active server environment and the extension options: use `laravel/.env` for Laravel or root `.env.local` for the Next.js reference. Keep the app URL exactly `http://localhost:3000`.
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
