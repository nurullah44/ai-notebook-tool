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
    ideaObject.addEventListener('click', () => flipIdea(ideaObject));
    ideaObject.addEventListener('keydown', (event) => {
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
