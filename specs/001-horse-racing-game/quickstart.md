# Quickstart: Horse Racing Game

End-to-end developer walkthrough: environment setup, running the app, running tests, and producing a production build. Aligned with the existing `README.md` scripts and adds the commands this plan introduces.

## Prerequisites

- Node.js `^20.19` or `>=22.12` (see `package.json → engines`).
- A single package manager: **npm**. Do not mix with yarn/pnpm.
- A Chromium-based browser for local dev; Playwright installs its own browser binaries for e2e.

## Install

```sh
npm ci
```

Use `npm ci` (not `npm install`) so the lockfile is the source of truth — keeps the project hygiene criterion "single package manager" clean.

## Run the app in development

```sh
npm run dev
```

Opens Vite on `http://localhost:5173`. Expected UI on load:
1. **Horse roster panel** showing 20 horses with unique colors and condition scores (FR-001–004).
2. **Schedule panel** empty with a **Generate** button enabled.
3. **Race arena** empty with a **Start** button disabled (FR-013).
4. **Results panel** empty.

### Manual smoke test (matches SC-006)

1. Click **Generate** → schedule panel fills with six numbered rounds (1200 m … 2200 m). Each round lists ten horses. (FR-005–008, FR-011)
2. Click **Start** → Round 1 horses begin animating toward the finish line (FR-012, FR-014–016).
3. When Round 1 ends, a ranked result (1..10) appears in the results panel before Round 2 begins (FR-017–020).
4. Rounds 2..6 run sequentially.
5. After Round 6 completes, the **Generate** button re-enables (FR-021); clicking it clears results and produces a new schedule (FR-009).

### URL flags

- `?fast=1` — speeds the simulation base rate up by 10×. Used by e2e tests; invisible to normal users.

## Type-check

```sh
npm run type-check
```

Must pass with zero errors — this is the Constitution's Type-Safety gate (Principle II).

## Lint

```sh
npm run lint
npm run lint:fix    # auto-fix where possible
```

## Unit tests

```sh
npm run test:unit                    # watch mode (Vitest default)
npm run test:unit -- --run           # CI-friendly one-shot
npm run test:unit -- --coverage      # with coverage
```

Coverage targets for this feature:
- `src/features/horses/horseGenerator.ts`: 100% branch
- `src/features/schedule/programGenerator.ts`: 100% branch
- `src/features/race/useRaceEngine.ts`: > 90%
- `src/features/race/finishOrder.ts`: 100% branch
- Store modules: every action and getter exercised at least once.

Snapshot tests (Vitest `toMatchSnapshot`) live in:
- `src/features/race/__tests__/RaceTrack.snapshot.spec.ts`
- `src/features/race/__tests__/HorseLane.snapshot.spec.ts`

Regenerate snapshots intentionally with `npm run test:unit -- --run -u`.

## E2E tests

First time only:
```sh
npx playwright install --with-deps
```

Run:
```sh
npm run build                                   # e2e against preview mimics CI
npm run test:e2e                                 # all browsers
npm run test:e2e -- --project=chromium           # CI-matching run
npm run test:e2e -- e2e/golden-path.spec.ts      # single file
```

The Playwright `webServer` config auto-starts `npm run dev` (local) or `npm run preview` (CI, from `package.json` scripts).

## Production build

```sh
npm run build            # runs type-check + build-only in parallel
npm run preview          # serves the built app on :4173 for verification
```

CI runs `npm run build` on every PR; absence of a build step is flagged by the assessment rubric.

## CI workflow

The workflow at `.github/workflows/ci.yml` runs on every push and pull request:
1. `npm ci`
2. `npm run lint`
3. `npm run type-check`
4. `npm run test:unit -- --run`
5. `npm run build`
6. `npx playwright install --with-deps chromium`
7. `npm run test:e2e -- --project=chromium`

All steps must pass before merge.

## Verification against the spec's success criteria

| Success criterion | How to verify locally |
|---|---|
| SC-001 (program generated < 2 s) | Manual: click Generate repeatedly in dev; schedule updates immediately (<<2 s). |
| SC-002 (exactly six rounds, ten horses each, correct distances) | Unit test `programGenerator.spec.ts` runs 100 generations and asserts structure. |
| SC-003 (smooth animation, no stalls > 150 ms) | Manual: observe race in dev; profile in DevTools Performance tab if unsure. |
| SC-004 (result appears < 1 s after last horse finishes) | Unit test for `race/finishRound` asserts result is dispatched synchronously on finish. |
| SC-005 (top-quartile horses outperform bottom-quartile on average) | Unit test `useRaceEngine.spec.ts` runs 100 simulated rounds with a seeded Rng and asserts the mean-position gap. |
| SC-006 (first-time user completes full cycle < 3 min without instructions) | Manual UX check; covered indirectly by e2e `golden-path.spec.ts`. |
| SC-007 (100% complete 1..10 ranking across 100 generations) | Unit test `finishOrder.spec.ts` + `programGenerator.spec.ts`. |

## Troubleshooting

- **`npm run type-check` fails after pulling**: re-run `npm ci` (lockfile change).
- **Playwright cannot find a browser**: `npx playwright install --with-deps`.
- **Snapshot failure after UI tweak**: review the diff, and if intentional: `npm run test:unit -- --run -u`.
- **E2E too slow**: confirm the spec uses `?fast=1` and that the simulation honors it.
