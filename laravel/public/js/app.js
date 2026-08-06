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

const composer = document.querySelector('[data-composer]');
const composerForm = document.querySelector('[data-composer-form]');
const composerTitle = document.querySelector('[data-composer-title]');
const composerSave = document.querySelector('[data-composer-save]');
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
    if (!composer || !composerForm || !composerTitle || !composerSave || !titleInput || !bodyInput) {
        return;
    }

    composer.dataset.purpose = 'create';
    composer.dataset.cancelUrl = '';
    composerForm.action = '/api/notes';
    composerTitle.textContent = 'New idea';
    composerSave.textContent = 'Keep idea';
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
        window.location.assign(composer.dataset.cancelUrl);
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
