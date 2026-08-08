# Idea Store Laravel Runtime

This directory contains the primary local Idea Store runtime. The Next.js app at the repository root remains installed but passive.

## Requirements

- PHP 8.5 with `curl`, `dom`, `fileinfo`, `libxml`, `mbstring`, `openssl`, `pdo_sqlite`, `sqlite3`, `xml`, `xmlwriter`, and `zip`
- Composer 2

## First Setup

```powershell
cd laravel
composer setup
```

Set `SQLITE_DB_PATH` in `.env` to the physical notebook database. Before promoting an existing notebook, stop Next.js, run the readiness check, and create a verified backup. Automated tests remain isolated from this path.

## Run Locally

```powershell
cd laravel
php artisan notebook:ready
php artisan notebook:backup
composer start
```

Open `http://localhost:3000`.

`composer start` runs `notebook:ready` before serving Laravel. Use `composer dev` only when intentionally bypassing the local-primary readiness gate during development.

For a future HTTPS deployment, set production environment values and run:

```powershell
php artisan notebook:ready --production
```

This checks production configuration but does not deploy or replace a real web server/process manager.

The unpacked extension already permits exactly `http://localhost:3000/*`, so keeping Laravel on port 3000 preserves the extension contract without changing its production files. In the extension options, keep the app URL as `http://localhost:3000` and use the same `EXTENSION_CAPTURE_TOKEN` configured in this Laravel runtime.

## Test

```powershell
cd laravel
composer test
```

Ordinary PHPUnit tests force SQLite to `:memory:`; recovery/readiness tests use generated temporary files. Automated tests cannot write to the configured notebook database.
