# Workspace UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the toolbar, search, process/Zalo area and loading/error feedback requested and approved in chat.

**Architecture:** Preserve the existing controller, Firebase persistence and category/list structure. Extract presentational toolbar/search/status/disclosure components and reshape issue detail; keep dialogs and actions wired to their existing callbacks.

**Tech Stack:** React, Next.js, TypeScript, CSS, Lucide, Vitest/Testing Library.

## Design direction

Quiet support workspace, with emphasis on the customer message and the next troubleshooting step. Base #F5F7FA, surface #FFFFFF, text #18263D, secondary #526176, action #2457D6, warning #A65B12. Keep current system font for this scoped change; message preview uses readable proportional type at 15–16px/1.65 instead of monospace. Left alignment throughout. Toolbar: brand / global search / AI + tools disclosure. Detail: process with progress / customer message with primary copy, then escalation, notes and images. Avoid introducing another navigation rail, dashboard or decorative cards.

## Tasks

1. Create `components/action-menu.tsx` and `components/workspace-toolbar.tsx`. Group existing data/account actions into a native disclosure with visible labels, outside-click/Escape dismissal and focus restoration. Promote search into header, keep a separate named input in mobile search overlay, provide clear-query action and Ctrl/Cmd+K shortcut that respects open dialogs.
2. Create `components/workspace-feedback.tsx`. Derive loading/saving/offline/error/success states consistently; use a spinner instead of green success while loading. Show a useful error summary and retry with technical details collapsed. Render static skeletons while waiting; no excessive animation.
3. Update `components/issue-detail.tsx`: process count/progress and next unfinished step; one primary desktop copy control in reply area, a secondary compose action and mobile copy. Keep edit visible and move deletion into a labeled action disclosure. Preserve text/copy/checkbox/image callbacks.
4. Integrate components into `components/workspace.tsx`; refine `app/globals.css` with scoped selectors and update service-worker cache version. Keep responsive layouts at 375/760/1100/1500 widths; avoid clipping popovers and search focus overlays.
5. Add meaningful tests for global search, tool disclosure dismissal/actions, status precedence, error details, checklist progress and Zalo copy/compose/delete wiring. Run unit/component tests, lint, typecheck and production build. Check browser if available; otherwise explicitly record the visual verification gap. Restart only the task-owned local server.

No Firebase mutation, deployment, schema or business logic change is needed for this UI work. Execute directly in the current workspace as requested by the user; no additional approval needed.

## Completion

## Follow-up authorized in chat

The user requested completion of the remaining UI recommendations. Implement a category rail on desktop (compact horizontal/picker navigation on smaller screens), denser issue rows with only relevant metadata, collapsed internal notes and lazily mounted image galleries, and four mobile destinations: scripts, search, AI and tools. Share tools actions between the header disclosure and mobile dialog. Self-host Be Vietnam Pro with Vietnamese subsets; align spacing, contrast, focus and reduced-motion handling. Preserve all existing data actions, confirmation flows, filters and Zalo composition. Add interaction tests for category selection, navigation and disclosure behavior, then rerun test/lint/typecheck/build and restart the owned local server. No Firebase or schema changes.

Implemented all five tasks. The updated toolbar, cross-category search and keyboard shortcut, error/status precedence, technical-error disclosure, checklist progress and reply copy/compose callbacks pass 7 new component tests. The full local suite has 37 passing tests; 10 emulator checks remain opt-in. Typecheck, lint and production build pass. Browser inventory is empty, so responsive styles were reviewed in source and interactions tested in jsdom; no real-browser visual verification is claimed. Service-worker cache updated to v2-3.
