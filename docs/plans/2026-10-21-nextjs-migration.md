# Next.js Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the existing Vietnamese CSKH application without losing its scripts, images, backups or Firebase ownership restrictions.

**Architecture:** Next.js App Router hosts a typed React workspace and an authenticated AI route. Firebase modular clients provide authentication, per-record Firestore persistence and Storage images. A resumable migration preserves the legacy state document.

**Tech Stack:** Next.js, React, TypeScript strict, Firebase Web SDK, Firebase Admin, CSS, Vitest, Firebase emulators where available.

## Execution

Completed locally on 2026-10-21. See `docs/verification.md` for the 24 unit/component/API checks, 10 emulator integration checks, production build, runtime HTTP checks and browser/production configuration limits. No production data or hosting was modified.

The user approved the design on 2026-10-21 and requested implementation in this workspace. Execute directly in this session. Preserve the original source under legacy/ outside public. Do not publish or modify production Firebase. No existing commit/worktree baseline exists; keep work in the current working tree.

### Task 1: Preserve and scaffold

Files: legacy/*, package.json, tsconfig.json, next.config.ts, eslint.config.mjs, .gitignore, .env.example, app/layout.tsx, app/page.tsx.

1. Copy the original source/configuration into legacy/; retain documentation.
2. Extract all 13 seed scripts from app.js with stable IDs into lib/domain/seed.json.
3. Add build, start, dev (port 4173), lint, typecheck and test commands. Install dependencies and lock exact resolved versions.
4. Verify the scaffold with TypeScript and production build after the feature files exist.

### Task 2: Typed domain and compatibility

Files: types/index.ts, lib/domain/{catalog,schema,search,templates,backups}.ts, tests/domain.test.ts.

1. Test legacy arrays/full backups, empty datasets, malformed/duplicate records, unknown categories, all seed entries, search without accents, template substitutions, image preservation and idempotent migration planning.
2. Implement normalized Zod schemas; preserve legacy IDs/image/checklist/count fields and enforce bounded input.
3. Implement JSON export with embedded images, per-user local backups capped at 12, daily backup and selected-tab cache.
4. Run npm.cmd test. Expected: all domain tests pass.

### Task 3: Firebase boundary and migration

Files: lib/firebase/{client,repository,images}.ts, hooks/use-workspace.ts, firestore.rules, storage.rules, firebase.json, tests/repository.test.ts.

1. Initialize modular SDK, environment validation and emulator opt-in; no production calls during tests.
2. Use generation-based collection selection in metadata for atomic dataset replacement. Each issue/progress is a document; use revisions for conflict checks and transactions for updates.
3. Migrate legacy state in chunks under a lease; resume by stable IDs, preserve old main.state and mark schema complete only after success. Block writes until complete.
4. Subscribe to snapshots; surface failures, cache last successful dataset per uid, disable offline writes, clear session data on logout.
5. Upload compressed images to owner-scoped Storage, preserve old inline images, embed images for portable export, retain Storage objects for backups.
6. Add emulator rules tests if Java/emulator dependencies are available. Otherwise record the missing runtime explicitly.

### Task 4: Feature-equivalent React workspace

Files: components/{workspace,auth-screen,issue-editor,issue-detail,modal,tools}.tsx, app/globals.css.

1. Implement auth, responsive category/list/detail layout, search and advanced filters.
2. Implement CRUD and checklist with pending/error states, revision conflict feedback and snapshots.
3. Implement multi-image editing/upload/drop/paste/copy, Zalo templates with editable final output, backup/import/export and statistics.
4. Implement mobile search and bottom navigation, semantic labels, accessible dialogs/focus handling, visible focus and 44px controls.
5. Review against vercel-react-best-practices and ui-ux-pro-max. Run typecheck/lint.

### Task 5: Authenticated server AI

Files: lib/firebase/admin.ts, lib/server/diagnose.ts, app/api/diagnose/route.ts, components/tools.tsx, tests/api.test.ts.

1. Verify Firebase ID token and allowed email before reading owner catalogue or using server API key.
2. Enforce body/input/catalogue limits, timeout, in-process per-user rate/concurrency limits and validate provider response IDs.
3. Provide local keyword fallback on unavailable provider/server, and UI action to remove legacy browser API key.
4. Test unauthenticated/forbidden/malformed/oversized requests and provider error handling with mocks. No real paid API calls.

### Task 6: PWA, launchers, docs and acceptance

Files: public/{service-worker.js,manifest.webmanifest,icons/app-icon.svg}, components/pwa.tsx, *.bat, README.md, FIREBASE_SETUP.md, HUONG_DAN_CHAY_APP.txt.

1. Replace old cache with network-first navigation and static-asset caching only; never cache API/auth responses. Offline uses authenticated per-user last-read data only.
2. Update Windows scripts to npm.cmd and document environment variables, Admin/Storage configuration, migration/rollback and server hosting requirements. Remove root-directory hosting deployment configuration.
3. Run npm.cmd test, npm.cmd run typecheck, npm.cmd run lint, npm.cmd run build. Expected: success, no secrets in client bundle.
4. Start local server; verify auth screen, responsive layout and API rejection via browser/HTTP. Use emulator for authenticated flows when available; never mutate production to test.
5. Record exact verification and any external configuration still required in docs/verification.md. Do not claim cloud acceptance without credentials/emulator evidence.
