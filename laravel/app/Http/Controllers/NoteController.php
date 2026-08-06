<?php

namespace App\Http\Controllers;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class NoteController extends Controller
{
    public function index(): View
    {
        return view('welcome', [
            'ideas' => $this->recentIdeas(),
            'selectedIdeaId' => null,
        ]);
    }

    public function show(string $id): View
    {
        $selectedIdea = DB::table('notes')
            ->select(['id', 'title', 'body', 'created_at', 'updated_at'])
            ->where('id', $id)
            ->first();

        abort_if($selectedIdea === null, 404);

        $ideas = $this->recentIdeas()
            ->reject(fn (object $idea): bool => $idea->id === $selectedIdea->id)
            ->prepend($selectedIdea)
            ->values();

        return view('welcome', [
            'ideas' => $ideas,
            'selectedIdeaId' => $selectedIdea->id,
        ]);
    }

    /** @return Collection<int, object> */
    private function recentIdeas(): Collection
    {
        return DB::table('notes')
            ->select(['id', 'title', 'body', 'created_at', 'updated_at'])
            ->orderByDesc('updated_at')
            ->limit(100)
            ->get();
    }
}
