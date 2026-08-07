<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
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

                <button class="searchLauncher" type="button" data-open-search>
                    <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>
                    <span>Search your ideas</span>
                    <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z"/></svg>
                </button>

                <div class="headerMeta">
                    <span>{{ $ideas->count() }} ideas</span>
                    <form action="/api/logout" method="post">
                        @csrf
                        <button type="submit" aria-label="Log out">
                            <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z"/></svg>
                        </button>
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
                        style="--delay: {{ ($index % 3) * 70 }}ms"
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
                                <span class="flipHint">
                                    <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"/></svg>
                                    Turn over
                                </span>
                            </span>
                            <span class="ideaFace ideaBack">
                                <span class="ideaMeta"><span>Your idea</span><span>{{ $idea->updated_at_label }}</span></span>
                                <small>Idea</small>
                                <p>{{ $idea->body }}</p>
                                <span class="ideaActions" data-card-action>
                                    <a href="/notes/{{ urlencode($idea->id) }}?mode=edit" aria-label="Edit {{ $idea->title ?: 'Untitled idea' }}">
                                        <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/></svg>
                                    </a>
                                    <form action="/api/notes/{{ urlencode($idea->id) }}/delete" method="post">
                                        @csrf
                                        <button type="submit" data-delete aria-label="Delete {{ $idea->title ?: 'Untitled idea' }}">
                                            <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/></svg>
                                        </button>
                                    </form>
                                </span>
                                <span class="flipHint">
                                    <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"/></svg>
                                    Return to title
                                </span>
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

            <button class="createButton" type="button" data-open-create aria-label="Create an idea">
                <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z"/></svg>
            </button>

            <div class="overlay searchOverlay" data-search data-mode="keyword" @if ($searchQuery === '') hidden @endif>
                <button class="closeOverlay" type="button" data-close-search aria-label="Close search">
                    <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>
                </button>
                <div class="searchStage" data-search-stage>
                    <form class="expandedSearch" action="/" method="get" data-search-form>
                        <button class="searchSubmit" type="submit" data-search-submit aria-label="Run keyword search">
                            <svg data-keyword-icon viewBox="0 0 256 256" aria-hidden="true"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>
                            <svg data-ai-icon viewBox="0 0 256 256" aria-hidden="true" hidden><path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z"/></svg>
                        </button>
                        <input name="q" value="{{ $searchQuery }}" placeholder="Search exact words in your ideas..." data-search-input @if ($searchQuery !== '') autofocus @endif>
                        <button type="button" class="modeButton" data-search-mode>
                            <svg data-mode-ai-icon viewBox="0 0 256 256" aria-hidden="true"><path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144Z"/></svg>
                            <svg data-mode-keyword-icon viewBox="0 0 256 256" aria-hidden="true" hidden><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>
                            <span data-mode-label>Ask AI</span>
                        </button>
                    </form>
                    <p class="searchModeLabel" data-search-label>Keyword search checks exact title and text</p>
                    <div class="searchResults" data-search-results>
                        @if ($searchQuery !== '')
                            @forelse ($ideas->take(3) as $idea)
                                <a href="/notes/{{ urlencode($idea->id) }}">
                                    <span>Exact match</span>
                                    <strong>{{ $idea->title ?: 'Untitled idea' }}</strong>
                                    <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>
                                </a>
                            @empty
                                <p class="searchMessage">No matching idea found.</p>
                            @endforelse
                        @endif
                    </div>
                </div>
            </div>

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
                            <button class="editorSave" type="submit" data-composer-save>
                                <span data-composer-save-label>{{ $editorMode === 'edit' ? 'Save idea' : 'Keep idea' }}</span>
                                <svg viewBox="0 0 256 256" aria-hidden="true"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>
                            </button>
                        </div>
                    </header>

                    @if ($editorError)
                        <p class="formError" role="alert">Write an explanation before saving.</p>
                    @endif

                    <div class="writingSurface">
                        <input
                            name="title"
                            value="{{ $editorMode === 'edit' ? $editorIdea->title : '' }}"
                            placeholder="Idea title"
                            data-title-input
                            @if ($editorMode !== null) autofocus @endif
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
