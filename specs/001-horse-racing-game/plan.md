# Implementation Plan: Horse Racing Game

**Branch**: `001-horse-racing-game` | **Date**: 2026-04-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-horse-racing-game/spec.md`

## Summary

Build a single-page Vue 3 web app that lets the user generate a six-round race program drawn from a fixed 20-horse roster, watch each round animate with condition-weighted random motion, and read ranked results round by round. State lives in a Vuex 4 store split into feature modules (`roster`, `program`, `race`, `results`). Race execution is driven by a `useRaceEngine` composable running a `requestAnimationFrame` loop that advances per-horse positions until all ten horses in the current round cross the finish line; finishing order is deterministic (position → condition → id) to prevent visible ties. Results stream into a scrollable panel as each round completes. Project hygiene (strict TypeScript, colocated unit tests, Playwright e2e, Vitest snapshot tests for visual regression, GitHub Actions CI running lint + type-check + test + build) is part of scope so the assessment rubric is satisfied.

## Technical Context

**Language/Version**: TypeScript (strict), Node `^20.19 || >=22.12`, Vue 3.5
**Primary Dependencies**: Vue 3, Vuex 4, TailwindCSS 4, Vite 8 (already in `package.json`; no new runtime dependencies introduced)
**Storage**: N/A — all state lives in the Vuex store for the session; no persistence, no backend
**Testing**: Vitest 4 (unit + snapshot), `@vue/test-utils`, Playwright 1.59 (e2e), `vue-tsc` (type-check gate)
**Target Platform**: Modern evergreen desktop browsers (Chromium, Firefox, WebKit — matching the existing Playwright project matrix)
**Project Type**: Single-page Vue web application (frontend-only SPA)
**Performance Goals**: 60 fps horse animation on a typical laptop; program generation < 2 s (SC-001); results surface within 1 s of round end (SC-004); no stalls > 150 ms mid-race (SC-003)
**Constraints**: No new runtime dependencies beyond those already installed (Constitution §Technology & Standards); strict typing with no `any` and no type assertions outside justified edge cases (Principle II); `<script setup>` + Composition API only (Principle III); business-first filenames (Principle V); composables invoked only at root of `<script setup>` or another composable (Principle III).
**Scale/Scope**: 20 horses, 6 rounds, 10 horses per round; ~15–20 Vue components, 4 Vuex modules, ~8–12 composables/helpers, ~30–50 unit tests, 1 e2e golden-path spec with a few variants.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Reuse Over Duplication | PASS | `useRaceEngine`, `randomInt` helper, `PillButton`/`Panel` in `shared/ui`, and a single `palette.ts` are the only shared primitives; every duplication candidate (round row, result row, horse chip) is extracted as a component. Existing `src/features/{horses,schedule}` scaffolding is reused — not replaced. |
| II. Type Safety is Non-Negotiable | PASS | All modules export typed interfaces (`Horse`, `Round`, `RaceProgram`, `RoundResult`, store state per module). No `any`. No type assertions — the Vuex store is typed via a custom `useStore<RootState>()` wrapper (documented in research). Every change runs under `npm run type-check`. |
| III. Modern Vue 3 Composition | PASS | All components are `<script setup lang="ts">`. Composables (`useRaceEngine`, `useRoster`, `useProgram`, `useResults`) are invoked only at the root of `<script setup>` or another composable. `defineModel` / `useTemplateRef` used where appropriate (track measurement). |
| IV. Purposeful Comments | PASS | Plan artifacts describe intent; source comments are reserved for non-obvious invariants (e.g., the finish-order tie-break, the rAF-vs-setInterval decision). No restated-code comments. |
| V. Business-First Naming | PASS | File names are domain-oriented: `horse.ts`, `program.ts`, `roster.ts`, `rounds.ts`, `finishOrder.ts`, `useRaceEngine.ts`, `palette.ts`. No `utils.ts`, `helpers.ts`, `common.ts`, `types.ts`, `constants.ts`, `enums.ts`. |

**Added runtime dependencies**: none. **Added dev dependencies**: none at plan time — `@vue/test-utils` and Playwright are already installed; visual regression uses Vitest's built-in snapshot support. A GitHub Actions CI workflow is added under `.github/workflows/ci.yml` (no npm dependency needed).

**Gate result**: PASS. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-horse-racing-game/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── store.md         # Vuex store public contract (state, getters, actions, mutations)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                          # Application shell (exists)
│   ├── App.vue                   # Layout: roster panel | schedule panel | race track | results panel
│   ├── main.ts                   # createApp + store.install + mount
│   └── style.css                 # Tailwind entrypoint
│
├── features/
│   ├── horses/                   # Roster domain (dir exists; populated here)
│   │   ├── components/
│   │   │   ├── HorseRoster.vue         # Lists all 20 horses
│   │   │   └── HorseChip.vue           # One horse: color swatch + name + condition
│   │   ├── __tests__/
│   │   │   ├── HorseRoster.spec.ts
│   │   │   └── horseGenerator.spec.ts
│   │   ├── horse.ts                    # Horse interface
│   │   ├── horseGenerator.ts           # createRoster(count=20, rng)
│   │   ├── palette.ts                  # 20 visually distinct colors
│   │   └── index.ts                    # public re-exports
│   │
│   ├── schedule/                 # Program/rounds domain (dir exists; populated here)
│   │   ├── components/
│   │   │   ├── RaceSchedule.vue        # Six rounds preview
│   │   │   └── RoundPreview.vue        # One round: number, distance, lineup
│   │   ├── __tests__/
│   │   │   ├── RaceSchedule.spec.ts
│   │   │   └── programGenerator.spec.ts
│   │   ├── program.ts                  # RaceProgram, Round interfaces
│   │   ├── rounds.ts                   # ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200]
│   │   ├── programGenerator.ts         # generateProgram(roster, rng)
│   │   └── index.ts
│   │
│   ├── race/                     # Live race execution & animation (NEW)
│   │   ├── components/
│   │   │   ├── RaceArena.vue           # Current round + track + controls
│   │   │   ├── RaceTrack.vue           # Track surface with lanes & finish line
│   │   │   ├── HorseLane.vue           # Single lane: background, horse marker, position
│   │   │   └── RaceControls.vue        # Generate & Start buttons with disabled-state logic
│   │   ├── __tests__/
│   │   │   ├── useRaceEngine.spec.ts
│   │   │   ├── finishOrder.spec.ts
│   │   │   ├── RaceTrack.snapshot.spec.ts     # Vitest snapshot (visual regression)
│   │   │   └── HorseLane.snapshot.spec.ts
│   │   ├── useRaceEngine.ts            # rAF-driven simulation composable
│   │   ├── finishOrder.ts              # Deterministic ranking (position → condition → id)
│   │   └── index.ts
│   │
│   └── results/                  # Round result display (NEW)
│       ├── components/
│       │   ├── ResultsPanel.vue        # Scrollable list of completed rounds
│       │   └── RoundResultCard.vue     # One round's 1..10 ranking
│       ├── __tests__/
│       │   └── ResultsPanel.spec.ts
│       ├── roundResult.ts              # RoundResult interface
│       └── index.ts
│
├── store/                        # Vuex 4 root store + modules (NEW)
│   ├── index.ts                  # createStore, RootState, useStore<RootState>() wrapper
│   ├── roster.ts                 # state: horses[]; mutation: SET_ROSTER; action: bootstrap
│   ├── program.ts                # state: currentProgram; mutations/actions: generate, clear
│   ├── race.ts                   # state: phase, activeRoundIndex, positions; actions: start, advance, finishRound
│   └── results.ts                # state: roundResults[]; mutations/actions: append, reset
│
├── shared/
│   ├── ui/                       # Presentational primitives (dir exists; populated here)
│   │   ├── PrimaryButton.vue
│   │   ├── Panel.vue
│   │   └── __tests__/PrimaryButton.spec.ts
│   └── random.ts                 # Rng interface + createMulberry32(seed) + defaultRng
│
└── __tests__/                    # Existing cross-cutting tests (kept)
    └── App.spec.ts               # Smoke test for App shell

e2e/
├── tsconfig.json
├── golden-path.spec.ts           # Generate → Start → six rounds run → six results → semantic locators (role/name)
└── disabled-controls.spec.ts     # Start disabled before Generate; Generate disabled mid-race

.github/
└── workflows/
    └── ci.yml                    # lint + type-check + test:unit + build + test:e2e on PR/main

docs/
└── assessment.md                 # Existing assessment brief (kept)
```

**Structure Decision**: Single-project Vue SPA rooted at `src/`. We keep the existing `src/app/`, `src/features/`, `src/shared/` layout and add two new feature folders (`race`, `results`) plus a `src/store/` directory for Vuex modules. Tests colocate under a `__tests__/` subdirectory inside each feature (matching the pre-existing `src/__tests__/App.spec.ts` convention). Playwright e2e tests live in the existing `e2e/` folder. CI lives in `.github/workflows/ci.yml`. This structure satisfies Principle V (business-first) and Principle I (each feature owns its domain; shared primitives live in `src/shared/`).

## Complexity Tracking

> Constitution Check passed with no violations. Table intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
