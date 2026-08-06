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
        </main>
    </body>
</html>
