<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Idea Store</title>
        <link rel="stylesheet" href="{{ asset('css/app.css') }}">
        <script src="{{ asset('js/app.js') }}" defer></script>
    </head>
    <body>
        <main class="page">
            <header class="header">
                <a class="brand" href="/" aria-label="Idea Store home">
                    <span>IS</span>
                    <strong>Idea Store</strong>
                </a>

                <div class="headerMeta">
                    <span>{{ $ideas->count() }} {{ $ideas->count() === 1 ? 'idea' : 'ideas' }}</span>
                    <form action="/api/logout" method="post">
                        @csrf
                        <button type="submit">Log out</button>
                    </form>
                </div>
            </header>

            <section class="collectionHeader">
                <span>Living collection</span>
                <h1>Ideas worth returning to.</h1>
            </section>

            <section class="collection" aria-label="Ideas">
                @forelse ($ideas as $index => $idea)
                    @php($isSelected = $selectedIdeaId === $idea->id)
                    <article
                        class="ideaSlot{{ $isSelected ? ' isFlipped' : '' }}"
                        @if ($index >= 3) hidden data-idea-hidden @endif
                    >
                        <div
                            class="ideaObject"
                            role="button"
                            tabindex="0"
                            aria-label="Flip idea: {{ $idea->title ?: 'Untitled idea' }}"
                            aria-pressed="{{ $isSelected ? 'true' : 'false' }}"
                        >
                            <span class="ideaFace ideaFront">
                                <span class="objectNumber">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</span>
                                <strong>{{ $idea->title ?: 'Untitled idea' }}</strong>
                                <span class="flipHint">Turn over</span>
                            </span>
                            <span class="ideaFace ideaBack">
                                <span class="ideaMeta"><span>Your idea</span></span>
                                <small>Idea</small>
                                <p>{{ $idea->body }}</p>
                                <span class="ideaActions" data-card-action>
                                    <a href="/notes/{{ urlencode($idea->id) }}?mode=edit">Edit</a>
                                    <form action="/api/notes/{{ urlencode($idea->id) }}/delete" method="post">
                                        @csrf
                                        <button type="submit" data-delete>Delete</button>
                                    </form>
                                </span>
                                <span class="flipHint">Return to title</span>
                            </span>
                        </div>
                    </article>
                @empty
                    <p class="emptyCollection">Your first idea is waiting.</p>
                @endforelse

                @if ($ideas->count() > 3)
                    <div class="loadMarker" data-load-marker>
                        <span>Scroll for the next three</span>
                    </div>
                @endif
            </section>

            <button class="createButton" type="button" data-open-create aria-label="Create an idea">+</button>

            <div
                class="overlay editorWorld"
                data-composer
                data-purpose="{{ $editorMode ?? 'create' }}"
                data-cancel-url="{{ $editorMode === 'edit' ? '/notes/'.urlencode($editorIdea->id) : '' }}"
                @if ($editorMode === null) hidden @endif
            >
                <form
                    class="composer"
                    action="{{ $editorMode === 'edit' ? '/api/notes/'.urlencode($editorIdea->id) : '/api/notes' }}"
                    method="post"
                    data-composer-form
                >
                    @csrf
                    <header class="composerHeader">
                        <span data-composer-title>{{ $editorMode === 'edit' ? 'Edit idea' : 'New idea' }}</span>
                        <div>
                            <button class="editorCancel" type="button" data-close-composer>Cancel</button>
                            <button class="editorSave" type="submit" data-composer-save>{{ $editorMode === 'edit' ? 'Save idea' : 'Keep idea' }}</button>
                        </div>
                    </header>

                    @if ($editorError)
                        <p class="formError" role="alert">Write something before saving.</p>
                    @endif

                    <div class="writingSurface">
                        <input
                            name="title"
                            value="{{ $editorMode === 'edit' ? $editorIdea->title : '' }}"
                            placeholder="Idea title"
                            data-title-input
                        >
                        <textarea name="body" placeholder="Explain the idea..." required data-body-input>{{ $editorMode === 'edit' ? $editorIdea->body : '' }}</textarea>
                        <footer class="editorFooter">
                            <span>Plain text</span>
                            <span data-word-count>0 words</span>
                        </footer>
                    </div>
                </form>
            </div>
        </main>
    </body>
</html>
