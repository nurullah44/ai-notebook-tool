const hiddenIdeas = Array.from(document.querySelectorAll('[data-idea-hidden]'));
const loadMarker = document.querySelector('[data-load-marker]');

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
