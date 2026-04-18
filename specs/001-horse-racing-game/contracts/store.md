# Contract: Vuex Store Public API

The Vuex store is the UI contract of this feature: every Vue component reads state and dispatches actions through it; no feature module bypasses it. This document specifies the public shape that components may rely on. Breaking changes to this contract require a plan amendment.

## Root

```ts
// src/store/index.ts
export interface RootState {
  roster: RosterState;
  program: ProgramState;
  race: RaceState;
  results: ResultsState;
}

export const store: Store<RootState>; // created with createStore({...})
export function useStore(): Store<RootState>; // typed wrapper used by components
```

All components MUST import `useStore` from `@/store`, not from `vuex` directly (Principle II: avoids `as` casts).

---

## Module: `roster`

State owned once at bootstrap. No user action mutates it post-bootstrap.

### State

```ts
interface RosterState {
  horses: readonly Horse[]; // length 20 after bootstrap
  ready: boolean; // true after bootstrap completes
}
```

### Getters

| Getter | Returns | Purpose |
|---|---|---|
| `allHorses` | `readonly Horse[]` | Full roster, stable order. |
| `horseById(id)` | `(id: HorseId) => Horse \| undefined` | Lookup used by schedule and results views. |

### Actions

| Action | Payload | Effect |
|---|---|---|
| `roster/bootstrap` | `{ rng?: Rng }` | Calls `createRoster(20, rng)`, commits `roster/SET_ROSTER`, flips `ready` to `true`. Idempotent: no-op if `ready === true`. |

### Mutations (internal — components MUST NOT commit directly)

| Mutation | Payload |
|---|---|
| `roster/SET_ROSTER` | `{ horses: readonly Horse[] }` |

---

## Module: `program`

State for the currently-generated schedule.

### State

```ts
interface ProgramState {
  current: RaceProgram | null;
}
```

### Getters

| Getter | Returns | Purpose |
|---|---|---|
| `hasProgram` | `boolean` | Drives `Start` button enablement. |
| `rounds` | `readonly Round[]` | Six rounds when present; empty when `current === null`. |
| `roundAt(index)` | `(index: number) => Round \| undefined` | Used by `RaceArena`. |

### Actions

| Action | Payload | Guard | Effect |
|---|---|---|---|
| `program/generate` | `{ rng?: Rng }` | Rejected when `race/isRunning === true` (FR-010). | Calls `generateProgram(rosterState.horses, rng)`, commits `SET_PROGRAM`, also dispatches `results/reset` (FR-009) and `race/reset`. |
| `program/clear` | none | none | Commits `SET_PROGRAM` with `null`. Used for teardown in tests. |

### Mutations (internal)

| Mutation | Payload |
|---|---|
| `program/SET_PROGRAM` | `RaceProgram \| null` |

---

## Module: `race`

State for live race execution.

### State

```ts
interface RaceState {
  phase: 'idle' | 'ready' | 'running' | 'between-rounds' | 'finished';
  activeRoundIndex: number | null;
  horsePositions: Record<HorseId, number>; // meters, resets per round
  horseFinishTimes: Record<HorseId, number>; // ms since round start, accumulates
}
```

### Getters

| Getter | Returns | Purpose |
|---|---|---|
| `isRunning` | `boolean` | True when `phase === 'running' \| 'between-rounds'`. Controls Generate disabled-state. |
| `canStart` | `boolean` | True when `phase === 'ready'` AND `program/hasProgram === true`. Controls Start disabled-state. |
| `activeRound` | `Round \| null` | Convenience for `RaceArena`. |
| `positionOf(horseId)` | `(id: HorseId) => number` | Used by `HorseLane` for `translateX`. |

### Actions

| Action | Payload | Guard | Effect |
|---|---|---|---|
| `race/start` | none | Rejected unless `canStart === true`. | Sets `activeRoundIndex = 0`, transitions phase to `running`, spawns the rAF loop via `useRaceEngine`. |
| `race/reset` | none | Only when NOT `running \| between-rounds`. | Clears positions, resets phase to `ready` (if a program is present) or `idle`. |
| `race/advanceFrame` | `{ deltaMs: number; rng: Rng }` | Only when `phase === 'running'`. | Updates `horsePositions`. If all ten horses' positions ≥ round distance, dispatches `race/finishRound`. |
| `race/finishRound` | none | Only when `phase === 'running'`. | Computes the `RoundResult` via `computeFinishOrder(...)`, dispatches `results/append`, then: if `activeRoundIndex < 5`, advances to next round (phase → `between-rounds` briefly, then `running`); if `activeRoundIndex === 5`, phase → `finished`. |

### Mutations (internal)

| Mutation | Payload |
|---|---|
| `race/SET_PHASE` | `RacePhase` |
| `race/SET_ACTIVE_ROUND` | `number \| null` |
| `race/SET_POSITIONS` | `Record<HorseId, number>` |
| `race/RECORD_FINISH` | `{ horseId: HorseId; timeMs: number }` |
| `race/CLEAR_ROUND_STATE` | none |

---

## Module: `results`

Accumulates completed round results.

### State

```ts
interface ResultsState {
  roundResults: readonly RoundResult[]; // in program order, length grows 0 → 6
}
```

### Getters

| Getter | Returns | Purpose |
|---|---|---|
| `completedRounds` | `readonly RoundResult[]` | Rendered by `ResultsPanel`. |
| `resultForRound(index)` | `(i: number) => RoundResult \| undefined` | Used by `RoundResultCard`. |
| `isProgramComplete` | `boolean` | True when `roundResults.length === 6`. |

### Actions

| Action | Payload | Effect |
|---|---|---|
| `results/append` | `RoundResult` | Validates `placements.length === 10` and positions are a permutation of `1..10`; commits `APPEND`. |
| `results/reset` | none | Commits `RESET`. Dispatched by `program/generate`. |

### Mutations (internal)

| Mutation | Payload |
|---|---|
| `results/APPEND` | `RoundResult` |
| `results/RESET` | none |

---

## Cross-module invariants

- `race/start` requires `program/hasProgram === true` AND `roster/ready === true`.
- `program/generate` is disallowed while `race/isRunning === true` (throws, not silent no-op; UI disables the button).
- When `results/isProgramComplete` flips to `true`, `race/phase` must be `finished`.
- Every `results/append` payload's `roundIndex` must equal `results.roundResults.length` at dispatch time (strict append order).

## Extension points (future, non-contract)

The following are NOT part of the contract for this iteration but are where growth is expected:
- Per-horse statistics across programs (would add a `history` module).
- Persistent settings (a `settings` module backed by `localStorage`).
- Spectator mode / replay (would extend `race` with a recording field).
