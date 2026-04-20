# Phase 0 Research: Horse Racing Game

All items flagged `NEEDS CLARIFICATION` in the Technical Context were resolved here. Each entry follows: **Decision · Rationale · Alternatives considered**.

## R1. State management library

**Decision**: Vuex 4 (already installed) with one module per feature domain: `roster`, `program`, `race`, `results`. The root store exposes a typed `useStore<RootState>()` wrapper so components never need `as` casts.

**Rationale**:
- The assessment prompt explicitly asks for Vuex.
- Vuex 4 is already a direct dependency (`package.json`). Using it introduces zero new runtime dependencies, satisfying the Constitution's technology baseline clause.
- Splitting by feature keeps state colocated with the feature folder that owns it (aligns with Principle V and Principle I).
- A typed `useStore` wrapper replaces the untyped default `useStore()` from `vuex`, preserving Principle II (no `as` casts in components).

**Alternatives considered**:
- **Pinia**: More ergonomic and TS-native but would require adding a new runtime dependency and contradicts the assessment prompt.
- **Provide/inject + reactive()**: Too ad-hoc for the assessment rubric's "proper state management (Vuex/Pinia modules)" signal.
- **Single monolithic Vuex module**: Simpler but couples domains and violates Principle V's business-first organization.

## R2. Randomness strategy

**Decision**: Define a small `Rng` interface (`{ nextFloat(): number; nextInt(min, max): number; pick<T>(arr: readonly T[]): T; sample<T>(arr: readonly T[], k: number): T[] }`) with two concrete implementations: `defaultRng` (wraps `Math.random`) and `createMulberry32(seed)` (deterministic, 32-bit PRNG). Generators (`horseGenerator`, `programGenerator`) and `useRaceEngine` accept an optional `Rng` parameter, defaulting to `defaultRng`; unit tests pass `createMulberry32(seed)` for reproducibility.

**Rationale**:
- Lets unit tests assert exact outcomes without mocking `Math.random`.
- Keeps production code stochastic (SC-005 wants race-to-race variation).
- Mulberry32 is ~10 lines of code, MIT-public-domain, no dependency needed.
- Respects Principle I: one `Rng` used by every stochastic site.

**Alternatives considered**:
- **Direct `Math.random` with `vi.spyOn(Math, 'random')` in tests**: Works, but global monkey-patching is fragile and leaks across specs.
- **`seedrandom` npm package**: Adds a new runtime dependency for ~20 lines of code we can write ourselves.

## R3. Race animation loop

**Decision**: `useRaceEngine` composable using `requestAnimationFrame`. Each frame, every active horse's position advances by `baseSpeed + condition-weighted factor + per-frame jitter`, normalized so a healthy horse finishes the 1200 m round in ~6–8 s of wall clock (tunable). A horse's finish time is the timestamp when its position ≥ round distance; the round ends when all ten have finished.

**Rationale**:
- `requestAnimationFrame` integrates with the browser's compositor, giving smooth animation synced to display refresh (SC-003 / 60 fps).
- A composable is the idiomatic Vue 3 pattern; it can be tested in isolation by injecting a fake clock and a seeded `Rng`.
- Decoupling simulation from view via a composable lets snapshot tests for `RaceTrack` / `HorseLane` pin purely on markup, not on timing.

**Alternatives considered**:
- **`setInterval` tick**: Coarser timing, fights the compositor, and tends to drift — worse for 60 fps.
- **CSS-only animation (`transition` + final offset)**: Fast to write but reactive position updates (for results rank display or early-finish callouts) would require separate JS state anyway, doubling the source of truth.
- **GSAP or similar animation library**: Introduces a runtime dependency the Constitution forbids without amendment; our needs are simple enough that rAF + CSS `transform: translateX(...)` is sufficient.

## R4. Condition-weighted speed model

**Decision**: Per frame, horse `i` advances `Δ_i = base × (0.6 + 0.4 × (condition_i / 100)) × (1 + jitter)`, where `jitter ~ uniform(-0.15, +0.15)` drawn from the `Rng`. `base` is scaled by `deltaTimeMs / referenceFrameMs` so the simulation is frame-rate-independent. The expected-value speed is monotonic in condition, but the jitter band is wide enough that lower-condition horses sometimes beat higher-condition ones — satisfying SC-005 (top quartile beats bottom quartile *on average*) while preserving race-to-race excitement.

**Rationale**:
- Linear mapping of condition → speed is easy to reason about and unit-test (mean speed comparisons across quartiles are a one-pass statistic).
- The 0.6 floor ensures even a condition-1 horse finishes in a reasonable time (doesn't look stalled, satisfying FR-015).
- Seedable jitter is reproducible in tests.

**Alternatives considered**:
- **Stamina/fatigue curves** (horse slows over distance): Nice flavor, but adds state and complicates finish-order determinism; out of scope for MVP.
- **Pure condition-based determinism**: Would make every race of the same lineup identical — violates the spirit of SC-005 and the "not fully predictable" clause in FR-016.

## R5. Finish-order tie-breaking

**Decision**: A round ends when all horses have `position ≥ distance`. The ranked result is produced by sorting on `(finishTime ascending, condition descending, horseId ascending)`. Because the simulation uses millisecond-resolution `performance.now()` timestamps, true ties are astronomically unlikely in practice, but the secondary and tertiary keys make the ranking totally ordered and reproducible.

**Rationale**:
- Satisfies the spec's edge case: "finishing order is resolved deterministically ... so that the round always produces a complete 1-through-10 ranking with no ties".
- Condition as the first tiebreaker is intuitive ("in-form horse wins the photo finish").
- `horseId` is the stable final tiebreaker — guaranteed total order without any reliance on array input order.

**Alternatives considered**:
- **Random tiebreak via Rng**: Reproducible with a seed but harder to reason about in tests; no domain justification.
- **Finish-line pixel coordinates**: Tied to render state, impossible to unit-test without a DOM.

## R6. Component boundaries

**Decision**: Four top-level panels in `App.vue` — `HorseRoster`, `RaceSchedule`, `RaceArena` (controls + track), `ResultsPanel` — each backed by its own Vuex module and composable. `RaceArena` composes `RaceControls`, `RaceTrack`, and `HorseLane`s. `HorseChip` is reused by `HorseRoster` and `RoundPreview` (DRY, Principle I).

**Rationale**:
- One panel per Vuex module maps cleanly to the four user stories in the spec (roster, schedule, race execution, results).
- Letting `HorseChip` represent a horse everywhere keeps color + name + condition rendering in a single source of truth, satisfying Principle I.
- `RaceArena` as a composed container avoids a god-component.

**Alternatives considered**:
- **Single `RaceScreen.vue` owning everything**: Would duplicate the horse-display fragment across roster/schedule/results.
- **A generic `<EntityCard>` primitive**: Premature abstraction — we have exactly one entity type in this feature.

## R7. Styling approach

**Decision**: TailwindCSS utility classes for layout and theming. Horse colors come from `palette.ts` (20 hand-picked hues) and are applied via inline `style="background: var(--horse-color)"` or `style="color: ..."` bindings on a CSS custom property set per `HorseChip` / `HorseLane`. No custom CSS files beyond the existing `src/app/style.css` Tailwind entrypoint.

**Rationale**:
- Tailwind is the constitution-approved styling baseline.
- Horse colors are dynamic data, so an inline CSS-variable binding is the cleanest way to pass them to Tailwind-styled elements without generating JIT-unfriendly arbitrary-value class names.
- Handpicked palette guarantees "visually distinct" far better than algorithmic HSL sampling (FR-002 / SC verification).

**Alternatives considered**:
- **Dynamic HSL hue = (i × 360/20)**: Visually uneven perceptual spacing; some adjacent horses become hard to tell apart.
- **Per-horse Tailwind class**: Would require a 20-entry safelist in the Tailwind config — extra config surface for little gain.

## R8. Visual regression testing strategy

**Decision**: Use Vitest's built-in snapshot support (`toMatchSnapshot`) against the rendered HTML of `RaceTrack` and `HorseLane` in known states (lane count, progress percentages). No Histoire/Storybook install.

**Rationale**:
- Assessment rubric accepts "Storybook/Histoire stories OR snapshot tests".
- Snapshot tests via Vitest require zero new dependencies (respects Constitution §Technology & Standards).
- They catch visual-markup regressions in the animation-critical components specifically called out by the rubric.

**Alternatives considered**:
- **Histoire**: More comprehensive visual review UX but adds a dev dependency and CI complexity we don't need for the rubric's "minimal" bar.
- **Playwright visual comparisons (`toHaveScreenshot`)**: Flaky against animated DOM; would require freezing time and is overkill at this scope.

## R9. E2E testing approach

**Decision**: Playwright e2e suite with two specs:
- `golden-path.spec.ts`: Load app → assert 20 horses in roster (by `role="listitem"` inside the roster region) → click **Generate** → assert six `role="listitem"`s in the schedule → click **Start** → wait for six `RoundResultCard`s to appear → assert each card's first-place horse matches the horse whose position finished first. Speed is accelerated in E2E via a `?fast=1` URL flag that shortens simulation duration (no production impact when flag is absent).
- `disabled-controls.spec.ts`: Assert **Start** is disabled before Generate; assert **Generate** is disabled while a race is running; re-enabled on completion.

Locators use `getByRole`, `getByLabel`, and data attributes keyed to stable semantic names (e.g., `data-testid="round-result"`) — never raw CSS class paths — to satisfy the rubric's "semantic locators over brittle CSS selectors" criterion.

**Rationale**:
- Golden-path + disabled-state covers US1, US2, US3 and the primary edge cases without exploding the test matrix.
- The `?fast=1` flag keeps the e2e run fast (sub-minute target) without moving business logic into a test-only branch — the flag only scales the simulation time base.

**Alternatives considered**:
- **Exhaustive per-story e2e specs**: High maintenance cost; unit tests already cover most acceptance scenarios at a cheaper price point.
- **No speed flag, full real-time e2e**: Each run would take 6 × ~8 s = ~50 s just for the race, slowing CI.

## R10. CI/CD workflow

**Decision**: Add `.github/workflows/ci.yml` running on every push and PR:
1. `actions/checkout@v4`
2. `actions/setup-node@v4` with `node-version: 22` and `cache: npm`
3. `npm ci`
4. `npm run lint`
5. `npm run type-check`
6. `npm run test:unit -- --run`
7. `npm run build`
8. `npx playwright install --with-deps chromium`
9. `npm run test:e2e -- --project=chromium`

**Rationale**:
- Matches the rubric's "GitHub Actions workflow running lint + test + build on PRs" minimum and exceeds it with type-check and e2e.
- Running e2e only against Chromium in CI keeps wall-clock under ~3 minutes; the Playwright config still supports all three browsers for local runs.
- `npm ci` locks the dependency graph to `package-lock.json`, matching the existing single-package-manager hygiene.

**Alternatives considered**:
- **Only lint + build** (the literal rubric minimum): Would ship weaker than our own unit/e2e suite can verify on every commit.
- **Three-browser e2e in CI**: ~3× wall clock; diminishing returns for a visual-mostly feature.

## R11. File organization of tests

**Decision**: Colocate unit tests inside a `__tests__/` folder within each feature directory (e.g., `src/features/horses/__tests__/horseGenerator.spec.ts`). Keep the existing `src/__tests__/App.spec.ts` for the top-level shell smoke test. Playwright e2e specs stay in the top-level `e2e/` folder.

**Rationale**:
- Matches the existing `src/__tests__/App.spec.ts` convention.
- `__tests__` inside each feature preserves domain locality (Principle V) without requiring a separate top-level `tests/` tree that would duplicate the feature hierarchy.

**Alternatives considered**:
- **Colocated `*.spec.ts` next to the source file**: Works too, but mixes test and production file listings in IDE trees.
- **Top-level `tests/unit/` mirror tree**: Doubles navigation cost and drifts out of sync with feature renames.

## Resolved NEEDS CLARIFICATION items

None remaining. All Technical Context fields in `plan.md` are concrete. Ready for Phase 1.
