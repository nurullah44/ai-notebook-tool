# Design Brief

## Purpose

This document defines the first visual direction for the AI notebook before implementation starts.

The goal is not to make a final brand system. The goal is to give the project a clear UI/UX direction so the first skeleton does not inherit random taste.

## Product Surface

V1 needs two core screens:

1. Login screen
2. Main notebook screen

The main notebook screen is the priority. It should make capturing a note feel immediate.

## Design Goal

Create a calm, simple, familiar, blue-toned AI notebook for fast text capture and rough-memory lookup.

The product should feel:

- focused
- modern
- quiet
- trustworthy
- personal
- fast to use
- light rather than heavy

## Visual Direction

Preferred direction:

- blue tones, not purple
- light neutral base
- restrained contrast
- clear typography
- icon-first controls where icons are familiar
- minimal explanatory copy
- no decorative gradients
- no antique notebook feeling

Useful references by feel:

- Apple Notes for familiarity and calm
- Linear for clean product hierarchy
- Raycast for focused command-like interaction
- ChatGPT for simple AI interaction patterns

Do not copy these products directly. Use them as mental references for clarity and restraint.

## Layout Principles

- The write-a-note box should be the dominant first action.
- Recent notes should be visible but secondary.
- Search and AI rough-recall should be available without making the page feel busy.
- The UI should use spacing, grouping, and typography before borders or shadows.
- Avoid putting every section in a card.
- Avoid cards inside cards.
- Avoid marketing-page composition.
- Keep the first screen useful, not explanatory.

## Interaction Principles

- Capture first, organize later.
- The user should be able to save a note without choosing a category.
- Titles are optional.
- The app should show clear state changes: saved, saving, searching, no match, weak match.
- AI should show which notes it used.
- Keyboard-friendly flows are preferred where practical.

## Color Direction

Use a blue-centered palette:

- deep blue for primary action and active states
- soft blue-gray for surfaces
- white or near-white for main backgrounds
- neutral gray for borders and secondary text
- avoid purple AI gradients
- avoid green/cream antique palettes

## Typography Direction

Use readable product UI typography.

- Body text around 14-16px
- Clear labels
- No overly decorative fonts
- No huge marketing-style headings inside the app

## Accessibility Direction

- Text must have strong contrast.
- Focus states must be visible.
- Buttons and inputs should be easy to target.
- Important actions should not rely on color alone.

## Design Options To Explore

Before implementation, generate three visual directions:

1. Calm Notes
   Familiar notes app structure, quiet blue accents, simple recent list.

2. Focus Command
   Raycast-like centered capture and command/search flow, keyboard-friendly feel.

3. Advisor Workspace
   Notebook plus AI advisor panel, still restrained and grounded in notes.

## Non-Goals

- Antique notebook look
- Purple AI SaaS gradient look
- Dense dashboard
- Complex knowledge graph
- Rich text editor
- Image-heavy interface
- Decorative illustration-heavy UI
- Marketing landing page

## Current Decision

Use this brief to explore visual options before building the project skeleton.

Do not implement UI until one visual direction is selected.
