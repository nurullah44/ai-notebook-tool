# Idea Store Laravel Runtime

This directory contains the side-by-side Laravel migration target. The Next.js app at the repository root remains the behavior reference until cutover.

## Requirements

- PHP 8.5 with `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_sqlite`, `sqlite3`, and `zip`
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

Open `http://localhost:8000`.

## Test

```powershell
cd laravel
composer test
```

PHPUnit forces SQLite to `:memory:` so automated tests cannot write to the configured notebook database.
