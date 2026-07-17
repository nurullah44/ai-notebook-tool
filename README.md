# AI Notebook

A private, founder-only notebook that saves text notes, searches them, and uses AI to recall notes from rough memories.

## Local Setup

1. Copy `.env.example` to `.env.local` and fill the local secrets.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

Open `http://localhost:3000`.

## Local Chrome Extension

1. Start the app with `npm run dev` and keep it available at exactly `http://localhost:3000`.
2. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the `extension/` folder.
3. Open the extension options. Set the app URL to exactly `http://localhost:3000` and copy the `EXTENSION_CAPTURE_TOKEN` value from the ignored `.env.local` file into the capture-token field.
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

`npm run backup` creates a timestamped SQLite backup in the git-ignored `backups/` directory and verifies its integrity. Restore instructions live in `docs/OPERATIONS.md`.

## Project Guide

- `docs/inner-voice.html`: stage map
- `docs/build-log.html`: teaching-oriented build history
- `docs/ARCHITECTURE.md`: stable technical decisions
- `docs/OPERATIONS.md`: logs, backups, restore, and rollback
