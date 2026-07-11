# AI Notebook

A private, founder-only notebook that saves text notes, searches them, and uses AI to recall notes from rough memories.

## Local Setup

1. Copy `.env.example` to `.env.local` and fill the local secrets.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

Open `http://localhost:3000`.

## Commands

```powershell
npm run dev
npm run lint
npm run build
npm run backup
```

`npm run backup` creates a timestamped SQLite backup in the git-ignored `backups/` directory and verifies its integrity. Restore instructions live in `docs/OPERATIONS.md`.

## Project Guide

- `docs/inner-voice.html`: stage map
- `docs/build-log.html`: teaching-oriented build history
- `docs/ARCHITECTURE.md`: stable technical decisions
- `docs/OPERATIONS.md`: logs, backups, restore, and rollback
