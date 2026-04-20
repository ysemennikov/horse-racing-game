# Horse Racing Game

A single-page Vue 3 app: generate a six-round race program from a twenty-horse roster, watch each round animate, and read ranked results round by round.

## Architecture

State lives in a Vuex 4 store split into four namespaced modules (`roster`, `program`, `race`, `results`). Race execution is driven by `runRound` ([src/features/race/raceLoop.ts](src/features/race/raceLoop.ts)) — a `requestAnimationFrame` loop that advances per-horse positions until every horse in the current round crosses the finish line. Finishing order is deterministic (finish-time → condition → id) so there are never visible ties.

See the full design docs:

- [specs/001-horse-racing-game/plan.md](specs/001-horse-racing-game/plan.md)
- [specs/001-horse-racing-game/data-model.md](specs/001-horse-racing-game/data-model.md)
- [specs/001-horse-racing-game/contracts/store.md](specs/001-horse-racing-game/contracts/store.md)
- [specs/001-horse-racing-game/quickstart.md](specs/001-horse-racing-game/quickstart.md)

## Prerequisites

- Node.js `^20.19` or `>=22.12`
- npm (project is npm-locked; do not mix with yarn/pnpm)

## Project Setup

```sh
npm ci
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

Append `?fast=1` to the URL (`http://localhost:5173/?fast=1`) to run the simulation 10× faster — used by CI e2e tests.

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint

```sh
npm run lint
npm run lint:fix
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit             # watch mode
npm run test:unit:ci          # one-shot, used by CI
npm run test:unit -- --run -u # regenerate snapshots intentionally
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# First time only
npx playwright install

# Build before e2e on CI-like setups
npm run build

# Run all browsers
npm run test:e2e

# Chromium only (CI-equivalent)
npm run test:e2e:ci

# Single file
npm run test:e2e -- e2e/golden-path.spec.ts
```

## IDE

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur).
