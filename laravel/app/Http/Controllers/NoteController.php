<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\View\View;

class NoteController extends Controller
{
    public function index(Request $request): View
    {
        return view('welcome', [
            'ideas' => $this->recentIdeas(),
            'selectedIdeaId' => null,
            'editorMode' => $request->query('error') === 'empty-note' ? 'create' : null,
            'editorIdea' => null,
            'editorError' => $request->query('error') === 'empty-note',
        ]);
    }

    public function show(Request $request, string $id): View
    {
        $selectedIdea = DB::table('notes')
            ->select(['id', 'title', 'body', 'created_at', 'updated_at'])
            ->where('id', $id)
            ->first();

        abort_if($selectedIdea === null, 404);
        $selectedIdea->updated_at_label = $this->updatedAtLabel($selectedIdea->updated_at);

        $ideas = $this->recentIdeas()
            ->reject(fn (object $idea): bool => $idea->id === $selectedIdea->id)
            ->prepend($selectedIdea)
            ->values();

        return view('welcome', [
            'ideas' => $ideas,
            'selectedIdeaId' => $selectedIdea->id,
            'editorMode' => $request->query('mode') === 'edit' ? 'edit' : null,
            'editorIdea' => $selectedIdea,
            'editorError' => $request->query('mode') === 'edit'
                && $request->query('error') === 'empty-note',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $titleInput = $request->input('title');
        $bodyInput = $request->input('body');
        $title = is_string($titleInput) ? trim($titleInput) : '';
        $body = is_string($bodyInput) ? trim($bodyInput) : '';

        if ($body === '') {
            Log::warning('notes.create_rejected', ['reason' => 'empty_body']);

            return redirect('/?error=empty-note');
        }

        $id = (string) Str::uuid();
        $timestamp = now('UTC')->toISOString();

        DB::table('notes')->insert([
            'id' => $id,
            'title' => $title,
            'body' => $body,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        Log::info('notes.created', ['noteId' => $id]);

        return redirect('/notes/'.$id);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $titleInput = $request->input('title');
        $bodyInput = $request->input('body');
        $title = is_string($titleInput) ? trim($titleInput) : '';
        $body = is_string($bodyInput) ? trim($bodyInput) : '';

        if ($body === '') {
            Log::warning('notes.update_rejected', [
                'noteId' => $id,
                'reason' => 'empty_body',
            ]);

            return redirect('/notes/'.$id.'?mode=edit&error=empty-note');
        }

        $updated = DB::table('notes')
            ->where('id', $id)
            ->update([
                'title' => $title,
                'body' => $body,
                'updated_at' => now('UTC')->toISOString(),
            ]);

        if ($updated === 0) {
            Log::warning('notes.update_missing', ['noteId' => $id]);

            return redirect('/');
        }

        Log::info('notes.updated', ['noteId' => $id]);

        return redirect('/notes/'.$id);
    }

    public function destroy(string $id): RedirectResponse
    {
        $deleted = DB::table('notes')->where('id', $id)->delete();

        if ($deleted === 0) {
            Log::warning('notes.delete_missing', ['noteId' => $id]);
        } else {
            Log::info('notes.deleted', ['noteId' => $id]);
        }

        return redirect('/');
    }

    /** @return Collection<int, object> */
    private function recentIdeas(): Collection
    {
        return DB::table('notes')
            ->select(['id', 'title', 'body', 'created_at', 'updated_at'])
            ->orderByDesc('updated_at')
            ->limit(100)
            ->get()
            ->map(function (object $idea): object {
                $idea->updated_at_label = $this->updatedAtLabel($idea->updated_at);

                return $idea;
            });
    }

    private function updatedAtLabel(string $isoDate): string
    {
        $diffMinutes = max(0, (int) floor((now('UTC')->getTimestamp() - Carbon::parse($isoDate)->getTimestamp()) / 60));

        if ($diffMinutes < 1) {
            return 'Just now';
        }

        if ($diffMinutes < 60) {
            return $diffMinutes.'m ago';
        }

        $diffHours = (int) floor($diffMinutes / 60);

        if ($diffHours < 24) {
            return $diffHours.'h ago';
        }

        $diffDays = (int) floor($diffHours / 24);

        return $diffDays === 1 ? 'Yesterday' : $diffDays.' days ago';
    }
}
