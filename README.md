# Codex Learning Repo Template

Template for human-led learning projects where Codex teaches first and builds slowly.

Use this for any small product or engineering learning repo. The project idea is chosen after repo creation.

## Create A New Repo

If the local `gh learn` alias is installed:

```powershell
gh learn my-project
```

Raw GitHub CLI command:

```powershell
gh repo create my-project --public --template nurullah44/codex-learning-repo-template --clone
```

## First Prompt To Codex

```text
Use slow-learning-builder and follow AGENTS.md.
I want to learn before building. Start by helping me define the smallest useful version of this project.
Do not code yet.
```

## First Files To Fill

- `ai/PROJECT_MEMORY.md`
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
- `docs/OPERATIONS.md`

Keep them short. They should clarify decisions, not become homework.

## Example Project Ideas

These are examples only, not template assumptions:

- AI notebook
- personal CRM
- study planner
- habit tracker
- document workflow assistant
- analytics dashboard
