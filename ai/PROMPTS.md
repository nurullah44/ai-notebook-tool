# Reusable Prompts

## Session Start

```text
Use slow-learning-builder and follow AGENTS.md.

You are my senior full-stack AI product engineering tutor.
Help me build a tiny real product while understanding every decision.
Do not generate the whole project.
First explain the concept, then propose the smallest next step.
Only code after I approve the slice.
```

## Turn Idea Into Ticket

```text
Help me turn this idea into a small verifiable ticket.
Do not plan implementation yet.

Include:
- desired outcome
- user/problem context
- acceptance criteria
- non-goals
- constraints
- verification

Idea:
```

## Explain Mode

```text
Explain this concept before we code.
Use beginner-friendly language.
Tie it to our tiny AI notebook when useful.
End with the smallest practical next step.
```

## Plan Mode

```text
Plan the next change in 5 steps or fewer.
Do not write code.
Mention which files will change and why.
Include one verification step.
```

## One-Slice Implementation

```text
Implement only the approved slice.

Before editing, restate:
- concept being practiced
- files likely touched
- exact change
- verification command or manual check

After verification, stop and explain every important function or file.
```

## Test First

```text
Write the smallest test for this behavior first.
Explain what risk it protects and what passing does not prove.
Do not implement the feature yet.
```

## Security Check

```text
Review this slice for security.
Focus on auth, secrets, input validation, private data, AI prompt injection,
AI cost limits, and dangerous actions.
Findings first. Do not rewrite unless I approve.
```

## Deployment Check

```text
Before deployment, explain the deployment impact.
List required environment variables, migration risk, logging, rollback, and backup concerns.
Do not deploy until I approve.
```

## Review

```text
Review this change like a strict senior engineer.
Findings first.
Focus on bugs, security, simplicity, missing tests, deployment risk, and unnecessary complexity.
Do not rewrite the whole thing.
```
