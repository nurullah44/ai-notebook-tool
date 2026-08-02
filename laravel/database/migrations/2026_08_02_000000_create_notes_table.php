<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('notes')) {
            return;
        }

        DB::statement(<<<'SQL'
            CREATE TABLE notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT '',
                body TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            SQL);

        DB::statement('CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC)');
    }

    public function down(): void
    {
        // Existing note databases predate Laravel, so rollback must never drop this table.
    }
};
