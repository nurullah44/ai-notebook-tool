<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class NoteReadTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('database.connections.sqlite.database', ':memory:');
        DB::purge('sqlite');
        DB::reconnect('sqlite');

        $this->artisan('migrate')->assertSuccessful();
    }

    public function test_authenticated_user_sees_newest_ideas_first(): void
    {
        DB::table('notes')->insert([
            $this->note('older-idea', 'Older idea', 'First body', '2026-08-01T10:00:00.000Z'),
            $this->note('newer-idea', 'Newer idea', 'Second body', '2026-08-02T10:00:00.000Z'),
        ]);

        $this->withSession(['founder_authenticated' => true])
            ->get('/')
            ->assertOk()
            ->assertSeeInOrder(['Newer idea', 'Older idea']);
    }

    public function test_guest_cannot_open_a_direct_idea_url(): void
    {
        $this->get('/notes/private-idea')
            ->assertRedirect('/login');
    }

    public function test_authenticated_user_can_open_an_idea_directly(): void
    {
        DB::table('notes')->insert(
            $this->note('selected-idea', 'Selected idea', 'Selected body', '2026-08-02T10:00:00.000Z'),
        );

        $this->withSession(['founder_authenticated' => true])
            ->get('/notes/selected-idea')
            ->assertOk()
            ->assertSee('Selected idea')
            ->assertSee('Selected body')
            ->assertSee('isFlipped', false)
            ->assertSee('role="button"', false)
            ->assertSee('tabindex="0"', false);
    }

    public function test_missing_direct_idea_returns_not_found(): void
    {
        $this->withSession(['founder_authenticated' => true])
            ->get('/notes/missing-idea')
            ->assertNotFound();
    }

    public function test_empty_collection_explains_what_happens_next(): void
    {
        $this->withSession(['founder_authenticated' => true])
            ->get('/')
            ->assertOk()
            ->assertSee('Your first idea is waiting.');
    }

    /** @return array{id: string, title: string, body: string, created_at: string, updated_at: string} */
    private function note(string $id, string $title, string $body, string $timestamp): array
    {
        return [
            'id' => $id,
            'title' => $title,
            'body' => $body,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ];
    }
}
