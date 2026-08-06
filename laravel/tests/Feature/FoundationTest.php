<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class FoundationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('database.connections.sqlite.database', ':memory:');
        DB::purge('sqlite');
        DB::reconnect('sqlite');
    }

    public function test_foundation_page_and_static_css_are_available(): void
    {
        $this->artisan('migrate')->assertSuccessful();

        $this->withSession(['founder_authenticated' => true])
            ->get('/')
            ->assertOk()
            ->assertSee('Ideas worth returning to.');

        $this->assertFileExists(public_path('css/app.css'));
        $this->assertFileExists(public_path('js/app.js'));
    }

    public function test_fresh_database_receives_the_compatible_notes_schema(): void
    {
        $this->artisan('migrate')->assertSuccessful();

        $columns = collect(DB::select("PRAGMA table_info('notes')"))->keyBy('name');
        $indexes = collect(DB::select("PRAGMA index_list('notes')"))->pluck('name');

        $this->assertSame(['id', 'title', 'body', 'created_at', 'updated_at'], $columns->keys()->all());
        $this->assertSame(['TEXT', 'TEXT', 'TEXT', 'TEXT', 'TEXT'], $columns->pluck('type')->all());
        $this->assertContains('idx_notes_updated_at', $indexes->all());
    }

    public function test_migration_preserves_an_existing_notes_table_and_record(): void
    {
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

        $record = [
            'id' => 'existing-note-id',
            'title' => 'Existing idea',
            'body' => 'Must remain unchanged.',
            'created_at' => '2026-08-01T10:00:00.000Z',
            'updated_at' => '2026-08-01T10:00:00.000Z',
        ];
        DB::table('notes')->insert($record);

        $this->artisan('migrate')->assertSuccessful();

        $this->assertSame($record, (array) DB::table('notes')->first());
    }
}
