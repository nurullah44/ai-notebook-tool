const hiddenIdeas = Array.from(document.querySelectorAll('[data-idea-hidden]'));
const loadMarker = document.querySelector('[data-load-marker]');
const ideaObjects = document.querySelectorAll('.ideaObject');

function flipIdea(ideaObject) {
    const ideaSlot = ideaObject.closest('.ideaSlot');

    if (!ideaSlot) {
        return;
    }

    const isFlipped = ideaSlot.classList.toggle('isFlipped');
    ideaObject.setAttribute('aria-pressed', String(isFlipped));
}

ideaObjects.forEach((ideaObject) => {
    ideaObject.addEventListener('click', (event) => {
        if (event.target.closest('[data-card-action]')) {
            return;
        }

        flipIdea(ideaObject);
    });
    ideaObject.addEventListener('keydown', (event) => {
        if (event.target.closest('[data-card-action]')) {
            return;
        }

        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        flipIdea(ideaObject);
    });
});

function revealNextIdeas() {
    hiddenIdeas.splice(0, 3).forEach((idea) => {
        idea.hidden = false;
        idea.removeAttribute('data-idea-hidden');
    });

    if (loadMarker && hiddenIdeas.length === 0) {
        loadMarker.textContent = 'You reached the current beginning.';
    }
}

function revealNearBottom() {
    const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;

    if (nearBottom && hiddenIdeas.length > 0) {
        revealNextIdeas();
    }
}

window.addEventListener('scroll', revealNearBottom, { passive: true });

const searchOverlay = document.querySelector('[data-search]');
const searchStage = document.querySelector('[data-search-stage]');
const searchForm = document.querySelector('[data-search-form]');
const searchInput = document.querySelector('[data-search-input]');
const searchSubmit = document.querySelector('[data-search-submit]');
const keywordIcon = document.querySelector('[data-keyword-icon]');
const aiIcon = document.querySelector('[data-ai-icon]');
const modeAiIcon = document.querySelector('[data-mode-ai-icon]');
const modeKeywordIcon = document.querySelector('[data-mode-keyword-icon]');
const modeButton = document.querySelector('[data-search-mode]');
const modeLabel = document.querySelector('[data-mode-label]');
const searchLabel = document.querySelector('[data-search-label]');
const searchResults = document.querySelector('[data-search-results]');

function openSearch() {
    if (!searchOverlay || !searchInput) {
        return;
    }

    searchOverlay.hidden = false;
    searchInput.focus();
}

function closeSearch() {
    if (!searchOverlay || !searchInput || !searchResults) {
        return;
    }

    searchOverlay.hidden = true;
    searchInput.value = '';
    searchResults.replaceChildren();
}

function setSearchMode(mode) {
    if (!searchOverlay || !searchForm || !searchInput || !searchSubmit || !keywordIcon || !aiIcon || !modeAiIcon || !modeKeywordIcon || !modeLabel || !searchLabel || !searchResults) {
        return;
    }

    const isAi = mode === 'ai';
    searchOverlay.dataset.mode = mode;
    searchForm.classList.toggle('aiMode', isAi);
    searchInput.placeholder = isAi ? 'Describe the idea you half remember...' : 'Search exact words in your ideas...';
    searchSubmit.setAttribute('aria-label', isAi ? 'Run AI search' : 'Run keyword search');
    keywordIcon.toggleAttribute('hidden', isAi);
    aiIcon.toggleAttribute('hidden', !isAi);
    modeAiIcon.toggleAttribute('hidden', isAi);
    modeKeywordIcon.toggleAttribute('hidden', !isAi);
    modeLabel.textContent = isAi ? 'Keyword' : 'Ask AI';
    searchLabel.textContent = isAi ? 'AI finds the three closest meanings' : 'Keyword search checks exact title and text';
    searchResults.replaceChildren();
}

function renderSearchMessage(message, isError = false) {
    if (!searchResults) {
        return;
    }

    const paragraph = document.createElement('p');
    paragraph.className = 'searchMessage';
    paragraph.textContent = message;

    if (isError) {
        paragraph.setAttribute('role', 'alert');
    }

    searchResults.replaceChildren(paragraph);
}

function createResultArrow() {
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace, 'svg');
    const path = document.createElementNS(namespace, 'path');
    svg.setAttribute('viewBox', '0 0 256 256');
    svg.setAttribute('aria-hidden', 'true');
    path.setAttribute('d', 'M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z');
    svg.append(path);

    return svg;
}

function renderRecallMatches(matches) {
    if (!searchResults) {
        return;
    }

    const links = matches.slice(0, 3).map((match) => {
        const link = document.createElement('a');
        const reason = document.createElement('span');
        const title = document.createElement('strong');
        link.href = `/notes/${encodeURIComponent(match.noteId)}`;
        reason.textContent = match.reason;
        title.textContent = match.title;
        link.append(reason, title, createResultArrow());

        return link;
    });

    searchResults.replaceChildren(...links);
}

document.querySelector('[data-open-search]')?.addEventListener('click', openSearch);
document.querySelector('[data-close-search]')?.addEventListener('click', closeSearch);
modeButton?.addEventListener('click', () => {
    setSearchMode(searchOverlay?.dataset.mode === 'ai' ? 'keyword' : 'ai');
});

searchForm?.addEventListener('submit', async (event) => {
    if (searchOverlay?.dataset.mode !== 'ai') {
        return;
    }

    event.preventDefault();
    const question = searchInput?.value.trim() ?? '';

    if (question === '') {
        return;
    }

    renderSearchMessage('Searching your ideas...');

    try {
        const response = await fetch('/api/ai/recall', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
            body: JSON.stringify({ question }),
        });
        const payload = await response.json();

        if (!response.ok) {
            throw new Error(typeof payload.error === 'string' ? payload.error : 'AI search failed.');
        }

        if (!Array.isArray(payload.matches)) {
            throw new Error('AI search returned an invalid result.');
        }

        if (payload.matches.length === 0) {
            renderSearchMessage(typeof payload.answer === 'string' ? payload.answer : 'No matching notes found yet.');
            return;
        }

        renderRecallMatches(payload.matches);
    } catch (error) {
        renderSearchMessage(error instanceof Error ? error.message : 'AI search failed.', true);
    }
});

searchOverlay?.addEventListener('click', (event) => {
    if (event.target === searchOverlay) {
        closeSearch();
    }
});

searchStage?.addEventListener('click', (event) => event.stopPropagation());

const composer = document.querySelector('[data-composer]');
const composerForm = document.querySelector('[data-composer-form]');
const composerTitle = document.querySelector('[data-composer-title]');
const composerSave = document.querySelector('[data-composer-save]');
const composerSaveLabel = document.querySelector('[data-composer-save-label]');
const titleInput = document.querySelector('[data-title-input]');
const bodyInput = document.querySelector('[data-body-input]');
const wordCount = document.querySelector('[data-word-count]');

function updateWordCount() {
    if (!bodyInput || !wordCount) {
        return;
    }

    const words = bodyInput.value.trim() === '' ? 0 : bodyInput.value.trim().split(/\s+/).length;
    wordCount.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
}

function openCreateComposer() {
    if (!composer || !composerForm || !composerTitle || !composerSave || !composerSaveLabel || !titleInput || !bodyInput) {
        return;
    }

    composer.dataset.purpose = 'create';
    composer.dataset.cancelUrl = '';
    composerForm.action = '/api/notes';
    composerTitle.textContent = 'New idea';
    composerSaveLabel.textContent = 'Keep idea';
    titleInput.value = '';
    bodyInput.value = '';
    composer.hidden = false;
    updateWordCount();
    titleInput.focus();
}

function closeComposer() {
    if (!composer || !composerForm || !titleInput || !bodyInput) {
        return;
    }

    if (composer.dataset.purpose === 'edit' && composer.dataset.cancelUrl) {
        window.location.replace(composer.dataset.cancelUrl);
        return;
    }

    composer.hidden = true;
    composerForm.reset();
    updateWordCount();
}

document.querySelector('[data-open-create]')?.addEventListener('click', openCreateComposer);
document.querySelector('[data-close-composer]')?.addEventListener('click', closeComposer);
bodyInput?.addEventListener('input', updateWordCount);

composer?.addEventListener('click', (event) => {
    if (event.target === composer) {
        closeComposer();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && searchOverlay && !searchOverlay.hidden) {
        closeSearch();
        return;
    }

    if (event.key === 'Escape' && composer && !composer.hidden) {
        closeComposer();
    }
});

document.querySelectorAll('[data-delete]').forEach((deleteButton) => {
    deleteButton.addEventListener('click', (event) => {
        if (!window.confirm('Delete this idea?')) {
            event.preventDefault();
        }
    });
});

updateWordCount();
