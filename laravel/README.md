# Idea Store Laravel Runtime

This directory contains the side-by-side Laravel migration target. The Next.js app at the repository root remains the behavior reference until cutover.

## Requirements

- PHP 8.5 with `curl`, `dom`, `fileinfo`, `libxml`, `mbstring`, `openssl`, `pdo_sqlite`, `sqlite3`, `xml`, `xmlwriter`, and `zip`
- Composer 2

## First Setup

```powershell
cd laravel
composer setup
```

Set `SQLITE_DB_PATH` in `.env` to a copied SQLite database during migration work. Never test migrations against the original notebook database.

## Run Locally

```powershell
cd laravel
composer dev
```

Open `http://localhost:3000`.

The unpacked extension already permits exactly `http://localhost:3000/*`, so keeping Laravel on port 3000 preserves the extension contract without changing its production files. In the extension options, keep the app URL as `http://localhost:3000` and use the same `EXTENSION_CAPTURE_TOKEN` configured in this Laravel runtime.

## Test

```powershell
cd laravel
composer test
```

PHPUnit forces SQLite to `:memory:` so automated tests cannot write to the configured notebook database.
