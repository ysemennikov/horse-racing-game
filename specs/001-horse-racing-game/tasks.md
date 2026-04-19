---

description: "Task list for Horse Racing Game feature implementation (branch 001-horse-racing-game)"
---

# Tasks: Horse Racing Game

**Input**: Design documents from `/specs/001-horse-racing-game/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/store.md](./contracts/store.md), [quickstart.md](./quickstart.md)

**Tests**: Tests are REQUIRED for this feature — the feature brief calls out Unit Tests and E2E Tests as explicit technical expectations, and the assessment rubric weighs testing heavily. Unit tests (Vitest + `@vue/test-utils`) and end-to-end tests (Playwright) are colocated per feature and under `e2e/`, respectively. Snapshot tests cover visual regression on animation-critical components.

**Organization**: Tasks are grouped by user story (from `spec.md`) so each story can be implemented, tested, and demoed independently. The stories are:

- **US1 (P1, MVP)** — Generate a race program and watch all six rounds complete → results stream in.
- **US2 (P2)** — Inspect the roster of available horses.
- **US3 (P2)** — Inspect the generated race schedule before starting.
- **US4 (P3)** — Regenerate the program for a fresh draw.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task belongs to (US1, US2, US3, US4)
- Paths are project-relative from the repo root (`/Users/ysemennikov/Documents/work/horse-racing-game/`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lock the baseline toolchain and repository hygiene so every subsequent phase starts from a clean, typed project.

- [ ] T001 Verify the local toolchain passes on a fresh `npm ci`: run `npm ci && npm run lint && npm run type-check && npm run test:unit -- --run` from the repo root and confirm all four commands exit 0 against the current `main`-equivalent state of branch `001-horse-racing-game`; capture any failures as follow-up tasks before continuing.
- [ ] T002 [P] Extend `.gitignore` so Playwright artifacts, Vitest caches, and Vite build output never get committed — add `playwright-report/`, `test-results/`, `.vitest/`, `coverage/`, `dist/`, and `node_modules/` (preserve any entries already present).
- [ ] T003 [P] Add the Tailwind entry directives to `src/app/style.css` (`@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`) and ensure `src/app/main.ts` imports `./style.css`.
- [ ] T004 [P] Update `index.html` to include a descriptive `<title>Horse Racing Game</title>` and an `<div id="app" class="min-h-screen bg-slate-50 text-slate-900">` root element matching what `main.ts` mounts.
- [ ] T005 Add npm scripts that CI will depend on (edit `package.json`): ensure `"test:unit:ci": "vitest run"` and `"test:e2e:ci": "playwright test --project=chromium"` exist (add them if missing); leave existing scripts untouched.

**Checkpoint**: Lint, type-check, and unit tests pass against an empty-but-typed project; `.gitignore` and Tailwind entrypoint are correct.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stand up the store skeleton, horse data layer, and shared UI primitives every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Shared primitives

- [ ] T006 [P] Create `src/shared/random.ts` exporting the `Rng` interface (`nextFloat`, `nextInt`, `pick`, `sample`), a `defaultRng` backed by `Math.random`, and a `createMulberry32(seed: number): Rng` implementation; no external deps.
- [ ] T007 [P] Create `src/shared/__tests__/random.spec.ts` with Vitest cases: same-seed mulberry32 produces identical sequences; `nextInt` stays within bounds; `sample(array, k)` returns `k` distinct elements drawn from the input.
- [ ] T008 [P] Create `src/shared/ui/PrimaryButton.vue` — a typed `<script setup lang="ts">` button with `defineProps<{ label: string; disabled?: boolean }>()` and `defineEmits<{ click: [] }>()`; Tailwind-only styling.
- [ ] T009 [P] Create `src/shared/ui/Panel.vue` — a titled container (`<Panel title="...">`) rendering a header plus a slot; Tailwind-only styling.
- [ ] T010 [P] Create `src/shared/ui/__tests__/PrimaryButton.spec.ts` asserting `click` is emitted when enabled, suppressed when `disabled`, and that the `label` renders in the DOM.

### Horse data layer

- [ ] T011 [P] Create `src/features/horses/horse.ts` defining the branded `HorseId` type and the `Horse` interface `{ id; name; color; condition }` (exactly matching `data-model.md`).
- [ ] T012 [P] Create `src/features/horses/palette.ts` exporting `PALETTE: readonly string[]` of 20 hand-picked, visually distinct CSS colors; include a short non-obvious-why comment on why curated not algorithmic.
- [ ] T013 [US-foundation] Create `src/features/horses/horseGenerator.ts` exporting `createRoster(rng?: Rng): readonly Horse[]` that produces exactly 20 horses, assigning each a palette color (distinct), name `Horse #01`..`Horse #20`, and integer `condition` in `[1, 100]`.
- [ ] T014 [P] Create `src/features/horses/__tests__/horseGenerator.spec.ts` — with a seeded mulberry32, assert exactly 20 horses, all colors distinct, every condition is an integer in `[1, 100]`, and determinism across two same-seed runs.
- [ ] T015 [P] Update `src/features/horses/index.ts` to re-export `horse.ts`, `horseGenerator.ts`, and `palette.ts` (public surface of the feature).

### Store skeleton

- [ ] T016 Create `src/store/roster.ts` exporting a typed Vuex module with `RosterState`, `SET_ROSTER` mutation, `bootstrap` action (calls `createRoster`, commits, flips `ready`), and getters `allHorses` / `horseById` — shape matches [contracts/store.md](./contracts/store.md).
- [ ] T017 Create `src/store/index.ts` exporting `RootState`, the `createStore({ modules: { roster } })` instance, and a typed `useStore(): Store<RootState>` wrapper that components import (no `as` casts anywhere).
- [ ] T018 Wire the store in `src/app/main.ts`: `createApp(App).use(store).mount('#app')`, then dispatch `roster/bootstrap` before or during mount so the roster is ready on first render.
- [ ] T019 [P] Create `src/store/__tests__/roster.spec.ts` — unit test the `roster` module directly (via `createStore`), asserting `bootstrap` populates 20 horses, is idempotent, and `horseById` resolves known ids.

### App shell

- [ ] T020 Replace the stub `src/app/App.vue` with a Tailwind grid shell that has four named `<slot>`-backed regions via child components — `<HorseRosterSlot />`, `<ScheduleSlot />`, `<RaceArenaSlot />`, `<ResultsSlot />` — each rendered as an empty `Panel` for now; no business logic yet. This shell will be populated across phases 3–5. Use semantic landmarks (`<main>`, `<section aria-label="...">`) so e2e tests can use role-based locators.

**Checkpoint**: The app boots, Tailwind styles apply, the store is wired, 20 horses exist in `state.roster.horses` (verifiable via Vue DevTools), and the four panel regions render as empty panels. Every user story can now be started.

---

## Phase 3: User Story 1 — Generate program, Start, run six rounds, stream results (Priority: P1) 🎯 MVP

**Goal**: Deliver the core loop from `spec.md` US1: click **Generate** → a six-round program exists → click **Start** → each round animates in sequence → each round's ranked result appears in the results panel as it ends → the sixth result marks the program complete.

**Independent Test**: With US2 and US3 panels still empty, a user can click Generate, click Start, and watch all six rounds run to completion with six ranked results appearing in the results panel. Verified by `e2e/golden-path.spec.ts`.

### Data models and generators (US1)

- [ ] T021 [P] [US1] Create `src/features/schedule/rounds.ts` exporting `ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const` and a tuple type `RoundIndex = 0 | 1 | 2 | 3 | 4 | 5`.
- [ ] T022 [P] [US1] Create `src/features/schedule/program.ts` defining branded `ProgramId` and `RoundId`, the `Round` interface (`id`, `index`, `distanceMeters`, `lineup`, `status`), and the `RaceProgram` interface (`id`, `createdAt`, `rounds` as a readonly six-tuple) — exactly matching `data-model.md`.
- [ ] T023 [US1] Create `src/features/schedule/programGenerator.ts` exporting `generateProgram(roster: readonly Horse[], rng?: Rng): RaceProgram` that samples 10 distinct horses per round from the 20-horse roster, assigns the correct distance by index, and assigns stable `RoundId`s.
- [ ] T024 [P] [US1] Create `src/features/schedule/__tests__/programGenerator.spec.ts` — seeded mulberry32, run 100 generations, assert every program has 6 rounds with exact `[1200..2200]` distances, every lineup has exactly 10 distinct horses drawn from the roster, and generator is deterministic under the same seed (covers SC-002).
- [ ] T025 [P] [US1] Update `src/features/schedule/index.ts` to re-export `rounds.ts`, `program.ts`, and `programGenerator.ts`.

### Results data model (US1)

- [ ] T026 [P] [US1] Create `src/features/results/roundResult.ts` defining the `Placement` and `RoundResult` interfaces per `data-model.md` (positions `1..10`, typed tuples where practical).
- [ ] T027 [P] [US1] Create `src/features/results/index.ts` re-exporting `roundResult.ts`.

### Race engine core (US1)

- [ ] T028 [P] [US1] Create `src/features/race/finishOrder.ts` exporting `computeFinishOrder(roundId: RoundId, roundIndex: RoundIndex, distanceMeters: number, finishTimes: ReadonlyMap<HorseId, number>, horsesById: (id: HorseId) => Horse): RoundResult` that sorts by `(finishTimeMs asc, condition desc, horseId asc)` and assigns positions 1..10.
- [ ] T029 [P] [US1] Create `src/features/race/__tests__/finishOrder.spec.ts` — assert a 10-horse round always yields positions `1..10` with no duplicates; assert tie resolution prefers higher condition, then lower `horseId`; assert stable output under permuted input (covers SC-007).
- [ ] T030 [US1] Create `src/features/race/useRaceEngine.ts` — a composable taking `(round: Round, horsesById, rng, options?: { speedFactor?: number })` and exposing reactive `positions` (`Record<HorseId, number>`), `finishTimes`, `isRunning`, `start()`, `stop()`, and a `done` promise. Implementation uses `requestAnimationFrame` for advancement per the per-frame formula in [research.md](./research.md) §R4 (`Δ = base × (0.6 + 0.4 × condition/100) × (1 + jitter)`, jitter uniform in `[-0.15, +0.15]`, frame-rate scaled by `deltaMs`). MUST be invoked only at the root of `<script setup>` or another composable (Principle III).
- [ ] T031 [P] [US1] Create `src/features/race/__tests__/useRaceEngine.spec.ts` — drive the composable with a fake clock (via `vi.useFakeTimers()` and a stubbed `requestAnimationFrame`), a seeded `Rng`, and assert: every horse eventually reaches `distanceMeters`; positions are monotonically non-decreasing; across 100 seeded rounds, mean finishing rank of top-quartile condition < mean rank of bottom-quartile condition (covers SC-005); the `done` promise resolves only after all horses finish.

### Store modules (US1)

- [ ] T032 [US1] Create `src/store/program.ts` implementing the `program` Vuex module from [contracts/store.md](./contracts/store.md): state `{ current: RaceProgram | null }`, mutation `SET_PROGRAM`, action `generate` (guards against `race/isRunning`, dispatches `results/reset` and `race/reset`), action `clear`, getters `hasProgram` / `rounds` / `roundAt`.
- [ ] T033 [US1] Create `src/store/results.ts` implementing the `results` Vuex module: state `{ roundResults: readonly RoundResult[] }`, mutation `APPEND` / `RESET`, action `append` (validates positions form a permutation of `1..10`), action `reset`, getters `completedRounds` / `resultForRound` / `isProgramComplete`.
- [ ] T034 [US1] Create `src/store/race.ts` implementing the `race` Vuex module: state `{ phase, activeRoundIndex, horsePositions, horseFinishTimes }`, mutations (`SET_PHASE`, `SET_ACTIVE_ROUND`, `SET_POSITIONS`, `RECORD_FINISH`, `CLEAR_ROUND_STATE`), actions (`start`, `reset`, `advanceFrame`, `finishRound`) per contract, and getters (`isRunning`, `canStart`, `activeRound`, `positionOf`). The `start` action drives rounds sequentially using `useRaceEngine`; on each round's completion it invokes `computeFinishOrder`, dispatches `results/append`, advances the round index, and triggers the next round until `activeRoundIndex === 5`, at which point it sets `phase = 'finished'`.
- [ ] T035 [US1] Wire the new modules into `src/store/index.ts` (extend `RootState`, `createStore({ modules: { roster, program, race, results } })`).
- [ ] T036 [P] [US1] Create `src/store/__tests__/program.spec.ts` — assert `generate` produces a valid `RaceProgram`, clears `results.roundResults`, resets race state, and is rejected while `race/isRunning` is true.
- [ ] T037 [P] [US1] Create `src/store/__tests__/race.spec.ts` — drive the `race` module with a fake engine (stub `useRaceEngine`), assert phase transitions `idle → ready → running → between-rounds → running → … → finished`, assert `canStart` reflects prerequisites, and assert `finishRound` dispatches `results/append` with the correct payload.
- [ ] T038 [P] [US1] Create `src/store/__tests__/results.spec.ts` — assert `append` enforces the positions-are-a-permutation invariant and `reset` clears the list; assert `isProgramComplete` flips only at exactly six appended results.

### UI — race controls, track, arena (US1)

- [ ] T039 [US1] Create `src/features/race/components/RaceControls.vue` — wires the Vuex store: `Generate` button (disabled when `race/isRunning`), `Start` button (disabled unless `race/canStart`). On click, dispatches `program/generate` / `race/start` respectively. Uses `PrimaryButton` from `shared/ui`.
- [ ] T040 [P] [US1] Create `src/features/race/components/HorseLane.vue` — renders one horse lane: a horizontal strip with a horse marker positioned via `translateX` computed from `positionOf(horseId) / distanceMeters`, colored by the horse's `color` bound to a CSS custom property. Props: `horse: Horse`, `distanceMeters: number`.
- [ ] T041 [US1] Create `src/features/race/components/RaceTrack.vue` — accepts `round: Round`, reads `positionOf` from the store, renders one `HorseLane` per horse in the round's lineup, plus a visible finish line on the right edge.
- [ ] T042 [US1] Create `src/features/race/components/RaceArena.vue` — composes `RaceControls` on top, then shows `RaceTrack` for the `activeRound` when `phase` is `running` or `between-rounds`, otherwise a neutral "Press Generate, then Start" placeholder. Expose `data-testid="race-arena"` on the root for e2e.
- [ ] T043 [P] [US1] Create `src/features/race/__tests__/RaceControls.spec.ts` — mount with a test store, assert button enabled/disabled states across phase transitions and dispatch calls on click.
- [ ] T044 [P] [US1] Create `src/features/race/__tests__/HorseLane.spec.ts` — assert the rendered marker's `style.transform` reflects the injected position, and the color custom property is bound to the horse color.

### UI — results panel (US1)

- [ ] T045 [P] [US1] Create `src/features/results/components/RoundResultCard.vue` — accepts `result: RoundResult`, renders the round number, distance, and a numbered list (1..10) showing horse color + name for each placement. Uses a reusable row element (extracted inside the component) so positions render consistently.
- [ ] T046 [US1] Create `src/features/results/components/ResultsPanel.vue` — reads `completedRounds` from the store, renders them in order via `RoundResultCard`, scrollable when content overflows. Expose `data-testid="results-panel"` on the root and `data-testid="round-result"` on each card for e2e.
- [ ] T047 [P] [US1] Create `src/features/results/__tests__/ResultsPanel.spec.ts` — mount with a test store seeded with 0, 3, and 6 completed rounds; assert render order matches `roundIndex` and all placements render.

### Integration (US1)

- [ ] T048 [US1] Replace the placeholder `<RaceArenaSlot />` and `<ResultsSlot />` in `src/app/App.vue` with real `<RaceArena />` and `<ResultsPanel />` components. Leave the roster and schedule slots as empty panels for now (US2/US3 will fill them).
- [ ] T049 [US1] Wire the `?fast=1` URL flag into `useRaceEngine` (read `window.location.search` once at module load; when `fast=1`, multiply `baseSpeed` by 10). Document the flag with a one-line comment explaining why (CI e2e speed). This is the only URL-flag handling in the app.

### E2E (US1)

- [ ] T050 [P] [US1] Create `e2e/golden-path.spec.ts` — `page.goto('/?fast=1')` → click `getByRole('button', { name: /generate/i })` → click `getByRole('button', { name: /start/i })` → `expect(page.getByTestId('round-result')).toHaveCount(6)` (default timeout is enough at 10× speed) → assert the first `round-result` card references the round whose first-place horse in the store matches the DOM, by comparing semantic text (not CSS classes).

**Checkpoint**: US1 MVP done. A user can run the full six-round program from a fresh load without touching the yet-unbuilt roster / schedule panels. All US1 unit tests and the golden-path e2e pass. Satisfies SC-001, SC-002, SC-003, SC-004, SC-005, SC-007.

---

## Phase 4: User Story 2 — Inspect the roster of available horses (Priority: P2)

**Goal**: Render the 20-horse roster with unique colors and condition scores so users can anticipate performance before generating a program.

**Independent Test**: Load the app (without generating). The roster panel shows 20 horses; every color is visually distinct; every condition is an integer in `[1, 100]`. Matches `spec.md` US2.

### UI (US2)

- [ ] T051 [P] [US2] Create `src/features/horses/components/HorseChip.vue` — a reusable presentational component that renders a horse: colored swatch (driven by a CSS custom property bound to `horse.color`), name, and condition badge. Props: `horse: Horse`, optional `compact?: boolean`. Used here and reused in US3 (schedule) and US1 (results).
- [ ] T052 [US2] Create `src/features/horses/components/HorseRoster.vue` — reads `allHorses` from the store and renders a `HorseChip` per horse inside a `Panel` titled "Horses"; sets `data-testid="horse-roster"` on the root and `role="listitem"` on each chip wrapper so Playwright can count them semantically.
- [ ] T053 [P] [US2] Create `src/features/horses/__tests__/HorseChip.spec.ts` — assert the rendered element's `--horse-color` custom property matches the input horse color; assert the condition text renders within `[1, 100]`.
- [ ] T054 [P] [US2] Create `src/features/horses/__tests__/HorseRoster.spec.ts` — mount with a test store after `roster/bootstrap`; assert exactly 20 `role="listitem"` entries; assert pairwise-distinct horse colors.

### Integration (US2)

- [ ] T055 [US2] Replace the placeholder `<HorseRosterSlot />` in `src/app/App.vue` with `<HorseRoster />`.
- [ ] T056 [P] [US2] Extend `e2e/golden-path.spec.ts` (or create `e2e/roster.spec.ts` if the golden path is already too dense) to assert that, on first load, `page.getByTestId('horse-roster').getByRole('listitem')` has count 20 and that 20 distinct computed background-color values are present (read via `evaluateAll`).

**Checkpoint**: Users see the roster at all times; US1 still works end-to-end.

---

## Phase 5: User Story 3 — Inspect the generated race schedule before starting (Priority: P2)

**Goal**: After Generate, show the full six-round schedule (round number, distance, 10 horses per round) without forcing the user to start the race.

**Independent Test**: Click Generate; without clicking Start, the schedule panel shows six rounds numbered 1..6 with distances 1200..2200 m and 10-horse lineups drawn from the roster. Matches `spec.md` US3.

### UI (US3)

- [ ] T057 [P] [US3] Create `src/features/schedule/components/RoundPreview.vue` — props `round: Round`; renders the round number, distance, and a list of `HorseChip` for each horse in `lineup` (reuses the US2 `HorseChip`). Sets `role="listitem"` on the wrapper.
- [ ] T058 [US3] Create `src/features/schedule/components/RaceSchedule.vue` — reads `rounds` from the store; when the program is absent, shows a placeholder ("Click Generate"); when present, renders six `RoundPreview`s inside a `Panel` titled "Schedule". Sets `data-testid="race-schedule"` on the root.
- [ ] T059 [P] [US3] Create `src/features/schedule/__tests__/RoundPreview.spec.ts` — assert the round's number, distance, and 10 horse chips render; assert chips use the same `HorseChip` component.
- [ ] T060 [P] [US3] Create `src/features/schedule/__tests__/RaceSchedule.spec.ts` — mount with a test store; assert placeholder renders when `program.current === null`; after dispatching `program/generate`, assert six `role="listitem"`s render with the exact distances `[1200, 1400, 1600, 1800, 2000, 2200]`.

### Integration (US3)

- [ ] T061 [US3] Replace the placeholder `<ScheduleSlot />` in `src/app/App.vue` with `<RaceSchedule />`.
- [ ] T062 [P] [US3] Add a Playwright scenario to the golden path (or a new `e2e/schedule.spec.ts`) that, after clicking Generate, asserts `page.getByTestId('race-schedule').getByRole('listitem')` has count 6 and that the visible distance texts match `1200, 1400, 1600, 1800, 2000, 2200` in order.

**Checkpoint**: Users can preview the schedule before starting; US1 and US2 unaffected.

---

## Phase 6: User Story 4 — Regenerate the program for a fresh draw (Priority: P3)

**Goal**: Clicking Generate again replaces the current schedule with a new random one AND clears previously displayed results; Generate is unavailable while a race is running (FR-010). Covers the spec's US4 + the Generate-clicked-mid-race and Start-without-schedule edge cases.

**Independent Test**: Generate; click Generate a second time; lineups change and results clear. Try clicking Generate while a race runs; the button is disabled. Matches `spec.md` US4 and Edge Cases.

### Logic refinement (US4)

- [ ] T063 [US4] Re-verify `src/store/program.ts` guards against dispatch while `race/isRunning`; if the US1 implementation in T032 did not throw on a forbidden `generate`, change the behavior to throw a typed `RaceInProgressError` and have `RaceControls.vue` simply rely on the disabled button (no try/catch in the component). Do not introduce a second code path.
- [ ] T064 [P] [US4] Add a test case to `src/store/__tests__/program.spec.ts` asserting that `generate` dispatched mid-race throws `RaceInProgressError` and leaves the existing `current` program untouched.
- [ ] T065 [P] [US4] Add a unit test in `src/features/race/__tests__/RaceControls.spec.ts` asserting that during `phase === 'running'` the Generate button is rendered with the `disabled` attribute and emits no `click` on clicks.

### E2E (US4)

- [ ] T066 [P] [US4] Create `e2e/disabled-controls.spec.ts` with two scenarios: (a) before Generate, the Start button is `disabled`; (b) during a race (use `?fast=1` and assert the Generate button is `disabled` after clicking Start and before six results have appeared); after the sixth result, Generate is enabled again. Use `getByRole` locators, not CSS selectors.

**Checkpoint**: Edge cases around control state are enforced and regression-tested.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Ship-ready polish: visual regression, CI, docs, accessibility, performance, and final gates.

- [ ] T067 [P] Create `src/features/race/__tests__/RaceTrack.snapshot.spec.ts` — mount `RaceTrack` with a deterministic round and injected positions for `0%`, `50%`, `100%` progress states; assert `toMatchSnapshot()` for the rendered HTML.
- [ ] T068 [P] Create `src/features/race/__tests__/HorseLane.snapshot.spec.ts` — mount `HorseLane` at three progress values and assert `toMatchSnapshot()`; document intentional regeneration via `npm run test:unit -- --run -u` in a one-line file-level comment.
- [ ] T069 Create `.github/workflows/ci.yml` per [research.md](./research.md) §R10: checkout → setup-node 22 (npm cache) → `npm ci` → `npm run lint` → `npm run type-check` → `npm run test:unit:ci` → `npm run build` → `npx playwright install --with-deps chromium` → `npm run test:e2e:ci`. Trigger on `push` and `pull_request` to any branch.
- [ ] T070 [P] Update `README.md` so the run/test/build sections reference the real scripts and add a "Architecture" section that links to [plan.md](specs/001-horse-racing-game/plan.md) and [data-model.md](specs/001-horse-racing-game/data-model.md); keep existing sections untouched where still accurate.
- [ ] T071 [P] Accessibility sweep: verify `App.vue` has a single `<main>`, each panel is a `<section>` with a visible heading (or `aria-label`), the `Generate` / `Start` buttons are reachable via keyboard, and focus states are visible. Fix any violations inline in the affected component.
- [ ] T072 [P] Performance verification against SC-003: profile a full program run in Chrome DevTools; confirm no stalls > 150 ms during a round. If stalls appear, optimize the hot path (likely the per-frame `SET_POSITIONS` mutation) by batching updates rather than committing per horse.
- [ ] T073 Run the full quickstart validation locally: `npm ci && npm run lint && npm run type-check && npm run test:unit -- --run && npm run build && npx playwright install --with-deps chromium && npm run test:e2e -- --project=chromium`. Capture any failures as follow-up tasks; do not declare the feature complete until all six commands exit 0.
- [ ] T074 Re-check [plan.md](./plan.md) Constitution Check against the final code: grep for `any`, `as unknown`, `as const` misuse, and `// @ts-ignore` / `// @ts-expect-error`; document any justified exceptions inline with a `why` comment, or remove them.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1. BLOCKS every user story.
- **Phase 3 (US1, P1 MVP)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2 only; does not depend on US1.
- **Phase 5 (US3)**: Depends on Phase 2; requires US1's data plumbing (`program/generate` and the program module) but not US1's UI — realistically completed after US1 in a sequential schedule.
- **Phase 6 (US4)**: Depends on US1 (refines its controls and engine guards).
- **Phase 7 (Polish)**: Depends on all user stories that are in scope for the release.

### User-story dependencies

- **US1**: Pure dependency on Phase 2. This is the MVP.
- **US2**: Pure dependency on Phase 2. Can run in parallel with US1 because the only shared file is `App.vue` (touched only at integration tasks T048 / T055 / T061, which need serialization).
- **US3**: Depends on Phase 2 + the `program` module and `programGenerator` introduced in US1 (T021–T025, T032). Reuses `HorseChip` from US2.
- **US4**: Depends on US1 (refines `RaceControls` and `program/generate`).

### Within each user story

- Tests ride alongside their implementation tasks and must pass before the next phase starts.
- Models (`horse.ts`, `program.ts`, `roundResult.ts`) before generators; generators before store modules; store modules before UI; UI before integration (`App.vue` wiring); integration before e2e.
- Integration tasks that touch `src/app/App.vue` (T048, T055, T061) are serialization points — they cannot run in parallel with each other.

### Parallel opportunities

- **Phase 1**: T002, T003, T004 parallelize cleanly (different files).
- **Phase 2 primitives**: T006–T015 split across shared primitives, horse data, and tests — most are `[P]` and parallelize.
- **Phase 3 (US1)**: T021/T022/T026/T028 (type files) parallelize; T024, T029 (pure unit tests on pure modules) parallelize; T036/T037/T038 (store tests once modules exist) parallelize; T040/T045 (independent components) parallelize.
- **Phase 4/5/6 tests** are mostly `[P]` against distinct files.
- **Phase 7**: snapshots, README, accessibility, and performance tasks are independent.

---

## Parallel Example: User Story 1 (after Phase 2 checkpoint)

```bash
# Launch these four pure-type/interface tasks together (no dependencies on each other):
Task: "T021 [P] [US1] src/features/schedule/rounds.ts"
Task: "T022 [P] [US1] src/features/schedule/program.ts"
Task: "T026 [P] [US1] src/features/results/roundResult.ts"
Task: "T028 [P] [US1] src/features/race/finishOrder.ts"

# After T023 (programGenerator) and T030 (useRaceEngine) land, these tests parallelize:
Task: "T024 [P] [US1] programGenerator.spec.ts"
Task: "T029 [P] [US1] finishOrder.spec.ts"
Task: "T031 [P] [US1] useRaceEngine.spec.ts"

# After the store modules (T032–T035) land, these parallelize:
Task: "T036 [P] [US1] program.spec.ts"
Task: "T037 [P] [US1] race.spec.ts"
Task: "T038 [P] [US1] results.spec.ts"

# Independent UI components parallelize:
Task: "T040 [P] [US1] HorseLane.vue"
Task: "T045 [P] [US1] RoundResultCard.vue"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1 Setup.
2. Phase 2 Foundational (blocks everything).
3. Phase 3 US1 end-to-end.
4. **STOP and VALIDATE**: `e2e/golden-path.spec.ts` passes; six round results render; the demo is compelling on its own.
5. Commit incrementally along the way (one commit per logical task-group), keeping git history incremental — the assessment explicitly flags single-dump commits.

### Incremental delivery

1. MVP: Phase 1 → Phase 2 → US1 → demoable MVP.
2. Add US2 (roster panel) → re-demo.
3. Add US3 (schedule preview) → re-demo.
4. Add US4 (regenerate guardrails + disabled-state e2e) → re-demo.
5. Polish phase ships visual regression, CI, docs, and gates.

### Parallel team strategy

With more than one developer:

1. Team completes Phase 1 + Phase 2 together.
2. Once Phase 2 is done and the `App.vue` shell exists:
   - Dev A → US1 (biggest chunk, covers the race engine).
   - Dev B → US2 (roster panel); coordinates with Dev A on `HorseChip` placement since US1's `RoundResultCard` and US3's `RoundPreview` reuse it — implement `HorseChip` in US2 first as a shared primitive.
   - Dev C → Phase 7 infrastructure (CI, snapshot scaffolding) in parallel without blocking US1/US2.
3. US3 and US4 follow US1 sequentially (they build on its data and controls).

---

## Notes

- `[P]` tasks touch different files and have no incomplete dependencies.
- `[Story]` labels map tasks to user stories for traceability in PR titles and commit messages.
- Keep commits incremental and meaningful — one logical task or small group per commit. The assessment rubric treats a single "Task Completed" dump as a negative signal.
- Every task must leave `npm run type-check` passing. Do not suppress type errors.
- Do not add new runtime dependencies without a constitution amendment (Vuex is already installed; Tailwind is already installed; `@vue/test-utils` and Playwright are already installed).
- Snapshot tests exist to catch visual regressions on animation-critical components; intentional updates use `npm run test:unit -- --run -u`.
- E2E locators MUST use `getByRole`, `getByLabel`, or `getByTestId` with semantic names — never brittle CSS class paths.

---

## Summary

- **Total tasks**: 74 (T001–T074)
- **Per-phase counts**:
  - Phase 1 (Setup): 5
  - Phase 2 (Foundational): 15
  - Phase 3 (US1, MVP): 30
  - Phase 4 (US2): 6
  - Phase 5 (US3): 6
  - Phase 6 (US4): 4
  - Phase 7 (Polish): 8
- **Tests included**: 20 unit/snapshot test tasks + 3 e2e spec tasks (some extended, not created fresh)
- **Parallel opportunities**: ~34 tasks marked `[P]` across phases.
- **Suggested MVP scope**: Phases 1 + 2 + 3 (US1 only) — delivers the demonstrable core loop by itself.
- **Format validation**: Every task above follows `- [ ] Tnnn [P?] [Story?] Description with exact file path`.
