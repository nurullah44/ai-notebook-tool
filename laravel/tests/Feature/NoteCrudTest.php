<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class NoteCrudTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('database.connections.sqlite.database', ':memory:');
        DB::purge('sqlite');
        DB::reconnect('sqlite');
        $this->artisan('migrate')->assertSuccessful();
        Log::spy();
    }

    public function test_authenticated_user_can_create_a_trimmed_idea(): void
    {
        $response = $this->withSession(['founder_authenticated' => true])
            ->post('/api/notes', [
                'title' => '  New idea  ',
                'body' => '  Useful explanation.  ',
            ]);

        $idea = DB::table('notes')->sole();

        $response->assertRedirect('/notes/'.$idea->id);
        $this->assertSame('New idea', $idea->title);
        $this->assertSame('Useful explanation.', $idea->body);
        $this->assertSame($idea->created_at, $idea->updated_at);
    }

    public function test_blank_create_is_rejected_without_writing(): void
    {
        $this->withSession(['founder_authenticated' => true])
            ->post('/api/notes', ['title' => 'Optional', 'body' => '   '])
            ->assertRedirect('/?error=empty-note');

        $this->assertSame(0, DB::table('notes')->count());
    }

    public function test_edit_mode_renders_the_saved_idea_in_the_update_form(): void
    {
        DB::table('notes')->insert($this->note());

        $this->withSession(['founder_authenticated' => true])
            ->get('/notes/saved-idea?mode=edit')
            ->assertOk()
            ->assertSee('Edit idea')
            ->assertSee('action="/api/notes/saved-idea"', false)
            ->assertSee('value="Saved title"', false)
            ->assertSee('Saved body');
    }

    public function test_authenticated_user_can_update_a_trimmed_idea(): void
    {
        DB::table('notes')->insert($this->note());

        $this->withSession(['founder_authenticated' => true])
            ->post('/api/notes/saved-idea', [
                'title' => '  Updated title  ',
                'body' => '  Updated body  ',
            ])
            ->assertRedirect('/notes/saved-idea');

        $idea = DB::table('notes')->where('id', 'saved-idea')->sole();

        $this->assertSame('Updated title', $idea->title);
        $this->assertSame('Updated body', $idea->body);
        $this->assertSame('2026-08-01T10:00:00.000Z', $idea->created_at);
        $this->assertNotSame($idea->created_at, $idea->updated_at);
    }

    public function test_blank_update_preserves_the_saved_idea(): void
    {
        $original = $this->note();
        DB::table('notes')->insert($original);

        $this->withSession(['founder_authenticated' => true])
            ->post('/api/notes/saved-idea', ['title' => 'Changed', 'body' => '   '])
            ->assertRedirect('/notes/saved-idea?mode=edit&error=empty-note');

        $this->assertSame($original, (array) DB::table('notes')->where('id', 'saved-idea')->sole());
    }

    public function test_update_of_a_missing_idea_returns_home(): void
    {
        $this->withSession(['founder_authenticated' => true])
            ->post('/api/notes/missing-idea', ['title' => 'Title', 'body' => 'Body'])
            ->assertRedirect('/');
    }

    public function test_authenticated_user_can_delete_an_idea(): void
    {
        DB::table('notes')->insert($this->note());

        $this->withSession(['founder_authenticated' => true])
            ->post('/api/notes/saved-idea/delete')
            ->assertRedirect('/');

        $this->assertSame(0, DB::table('notes')->count());
    }

    public function test_guest_cannot_mutate_ideas(): void
    {
        DB::table('notes')->insert($this->note());

        $this->post('/api/notes', ['body' => 'New'])->assertRedirect('/login');
        $this->post('/api/notes/saved-idea', ['body' => 'Changed'])->assertRedirect('/login');
        $this->post('/api/notes/saved-idea/delete')->assertRedirect('/login');

        $this->assertSame($this->note(), (array) DB::table('notes')->where('id', 'saved-idea')->sole());
    }

    public function test_unknown_mode_keeps_the_direct_note_in_read_mode(): void
    {
        DB::table('notes')->insert($this->note());

        $this->withSession(['founder_authenticated' => true])
            ->get('/notes/saved-idea?mode=anything')
            ->assertOk()
            ->assertDontSee('Edit idea');
    }

    /** @return array{id: string, title: string, body: string, created_at: string, updated_at: string} */
    private function note(): array
    {
        return [
            'id' => 'saved-idea',
            'title' => 'Saved title',
            'body' => 'Saved body',
            'created_at' => '2026-08-01T10:00:00.000Z',
            'updated_at' => '2026-08-01T10:00:00.000Z',
        ];
    }
}
