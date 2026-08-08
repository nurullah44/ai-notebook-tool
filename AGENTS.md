# Agent Instructions

This repository uses Matt Pocock's engineering workflow. Use `ask-matt` when the right flow is unclear.

Start from the assigned GitHub issue and the context pointers below. Expand into the codebase only as the task requires.

## Repository guardrails

- Laravel is the active runtime. Treat Next.js as retired unless the human explicitly reopens that decision.
- Deployment is deferred until the human explicitly resumes it.
- Treat the configured SQLite database as live user data. Tests use an isolated database.
- Browser verification uses only the user-provided Chrome integration. Do not install or invoke Playwright.
- When required context or tooling is unavailable, stop and report the gap.
- Preserve unrelated and untracked user files.
- Work on a feature branch. Push to `main` only with explicit approval.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

The default Matt Pocock triage-label vocabulary is used. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository. See `docs/agents/domain.md`.
