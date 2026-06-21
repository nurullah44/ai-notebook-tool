# Product Definition

## Product Promise

A private, single-user text notebook for fast capture and rough recall.

The user logs in, writes any text note in a large simple capture box, searches past notes, and asks an AI advisor to find the closest notes to a rough idea or memory.

The product is optimized for low-friction ADHD-style capture, not complex organization.

## Target User

One person using the app as a private thinking inbox.

V1 is for the founder's own use only. There is no public signup, no guest access, and no support for multiple users.

They may save:

- messy brain dumps
- copied posts
- rough ideas
- marketing ideas
- personal reflections
- early problem statements
- notes they only partially remember later

## Core Product Problem

The user often remembers the shape of an idea, but not the exact words, title, or location.

The app should make this easier:

> "I roughly remember an idea. Help me find the closest note and explain why it matches."

## V1 Workflow

1. The user logs in.
2. The user lands on a simple capture-first page.
3. The user writes or pastes a text note in a large note box.
4. The user saves the note without needing tags, folders, or formatting decisions.
5. The user can see recent notes.
6. The user can search notes with text search.
7. The user can edit an existing note.
8. The user can ask the AI advisor about a rough memory or idea.
9. The AI suggests the closest note or notes.
10. The AI explains why those notes match and shows which notes it used.

## V1 Features

- Login
- Big write-a-note box
- Text-only notes
- Optional note title
- Create note
- Edit note
- Recent notes
- Search notes
- Rough-memory AI lookup
- AI answers grounded in note sources
- Logs
- Backup path
- 5-10 targeted tests
- README and deployment notes

## V1 Non-Goals

- SaaS
- Multi-tenant accounts
- Public signup
- Guest access
- Teams
- Billing
- Sharing
- Public profiles
- Tags
- Folders
- Rich text editor
- Image upload
- Visual canvas
- Mobile app
- Browser extension
- Voice input
- Autonomous AI actions
- AI taking actions outside the notebook
- Long-term personality simulation

## AI Advisor Behavior

The AI should feel like a wise advisor, but it must stay grounded in saved notes.

Good behavior:

- "This note seems closest because it mentions X, Y, and Z."
- "These are the closest weak matches I found."
- "I did not find a strong match."

Bad behavior:

- pretending to know the user without evidence
- giving broad life advice before finding relevant notes
- hiding which notes were used
- acting as an autonomous agent

The AI should first help the user find relevant notes, then optionally help reason about them.

## Product Rules

- Capture should come before organization.
- The first screen should prioritize writing a note.
- The user should not need to classify a note before saving it.
- Titles should be optional.
- The app should help with rough recall, not only exact search.
- AI responses should cite or reference the notes they used.
- Weak matches should be labeled honestly.
- Private note content should not be casually exposed in logs.

## Future Direction

The later product idea is a private "wise actor" that learns from the user's notes and written history to help solve problems with more personal context.

That is not V1.

V1 should build the foundation for that future by preserving notes cleanly, keeping timestamps, supporting reliable retrieval, and grounding AI answers in actual saved text.

Another possible future direction is allowing other people to use the product. That is also not V1. If the product becomes public, the app will need a deliberate multi-user design with separated data, stronger account flows, rate limits, privacy policy, and cost controls.

## Success Test

V1 works if the user can dump 20 messy notes over a few days, then describe one remembered idea roughly and have the app help find the closest note.

## Decisions Deferred

These are not product decisions yet. They will be handled in stack choice and architecture planning:

- framework
- database
- auth approach
- deployment platform
- search implementation
- AI provider and model
- logging implementation
- backup implementation
- test framework
