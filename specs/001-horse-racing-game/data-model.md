# Data Model: Horse Racing Game

All data lives in the Vuex store for the session; nothing is persisted. Identifiers use branded-string types in TypeScript to prevent accidental cross-mixing (a `RoundId` cannot be passed where a `HorseId` is expected).

## Entities

### Horse

Represents a racer. Created once at app bootstrap and never mutated afterwards.

| Field | Type | Rules |
|---|---|---|
| `id` | `HorseId` (`string & { __brand: 'HorseId' }`) | Stable identity across roster, schedule, race, results. Source of final tie-break. |
| `name` | `string` | Non-empty, human-readable. Uniqueness not required (but convention: `Horse #01` … `Horse #20`). |
| `color` | `string` (CSS color) | Unique within the roster. Drawn from the curated `PALETTE` (length 20). |
| `condition` | `number` | Integer in `[1, 100]`. Fixed for the session. |

**Validation (enforced in `horseGenerator`)**:
- Roster size is exactly 20.
- `color` values across the roster are distinct.
- `condition` is a whole number in `[1, 100]`.

### RaceProgram

Ordered set of six rounds generated together.

| Field | Type | Rules |
|---|---|---|
| `id` | `ProgramId` (branded string) | Changes every time `program/generate` runs (so subscribers can re-key views). |
| `createdAt` | `number` (ms since epoch) | Informational; used only for ordering when debugging. |
| `rounds` | `readonly [Round, Round, Round, Round, Round, Round]` | Exactly six rounds, in race order. |

### Round

A single race within a program.

| Field | Type | Rules |
|---|---|---|
| `id` | `RoundId` (branded string) | Unique within the program. |
| `index` | `0 \| 1 \| 2 \| 3 \| 4 \| 5` | Position in the program. |
| `distanceMeters` | `1200 \| 1400 \| 1600 \| 1800 \| 2000 \| 2200` | Must equal `ROUND_DISTANCES[index]`. |
| `lineup` | `readonly HorseId[]` (length 10) | Ten distinct horses sampled from the roster; order is the starting-lane order. |
| `status` | `'pending' \| 'running' \| 'complete'` | State machine (see below). |

**Validation (enforced in `programGenerator`)**:
- `rounds.length === 6`, and for each round `i`: `rounds[i].index === i` and `rounds[i].distanceMeters === ROUND_DISTANCES[i]`.
- `lineup.length === 10` and all IDs distinct.
- Every `HorseId` in every `lineup` exists in the roster.

### RoundResult

Ranked finishing order produced when a round ends.

| Field | Type | Rules |
|---|---|---|
| `roundId` | `RoundId` | Back-reference to the round. |
| `roundIndex` | `0..5` | Duplicated for convenient rendering. |
| `distanceMeters` | `1200..2200` | Duplicated so results render without re-joining. |
| `placements` | `readonly Placement[]` (length 10) | Sorted by `position` ascending; positions are 1..10 with no gaps or duplicates. |

### Placement

One row of a `RoundResult`.

| Field | Type | Rules |
|---|---|---|
| `position` | `1..10` | Unique within the round. |
| `horseId` | `HorseId` | Must appear in the parent round's `lineup`. |
| `finishTimeMs` | `number` | Monotonic within the round (sort key). |

### RaceState (runtime, per active round)

Volatile state owned by the `race` Vuex module while a round animates.

| Field | Type | Rules |
|---|---|---|
| `phase` | `'idle' \| 'ready' \| 'running' \| 'between-rounds' \| 'finished'` | State machine (see below). |
| `activeRoundIndex` | `number \| null` | `null` when `phase === 'idle' \| 'ready' \| 'finished'`. |
| `horsePositions` | `Record<HorseId, number>` | Meters traveled by each horse in the active round; reset when a round starts. |
| `horseFinishTimes` | `Record<HorseId, number>` | Populated as horses cross the line; empty when round starts. |

## State machines

### RaceState.phase

```text
idle ──(roster bootstrapped)──▶ idle
idle ──(program/generate)─────▶ ready
ready ──(program/generate)────▶ ready         // regenerate before start
ready ──(race/start)──────────▶ running       // begins round 0
running ──(round ends, k < 5)─▶ between-rounds
between-rounds ──(next frame)▶ running        // begins round k+1
running ──(round ends, k = 5)▶ finished
finished ──(program/generate)▶ ready          // new program allowed
```

Transitions explicitly forbidden:
- `ready → running` is the ONLY entry into `running` (Start is disabled elsewhere).
- `running → ready` is forbidden; Generate is disabled while running (FR-010).

### Round.status

```text
pending ──(round starts)──▶ running ──(all horses finished)──▶ complete
```

Once `complete`, a round is immutable.

## Invariants

- `horseRoster.length === 20` from bootstrap onward.
- All horse `color` values in the roster are pairwise distinct.
- For every generated program: `program.rounds.map(r => r.distanceMeters)` equals `[1200, 1400, 1600, 1800, 2000, 2200]`.
- Every `Round.lineup` is a 10-element subset of roster IDs with no repeats within that round.
- `RoundResult.placements` is a bijection onto `{1..10}`: positions are unique and cover the full range.
- `RaceState.activeRoundIndex` matches the index of the round whose `status === 'running'` (or is `null`).
- `results.roundResults[i].roundIndex === i` for all `i` — results accumulate in strict program order.

## Identifier conventions

Branded string types are produced by helper constructors (not exported as factories, to prevent misuse):

```ts
export type HorseId = string & { readonly __brand: 'HorseId' };
export type RoundId = string & { readonly __brand: 'RoundId' };
export type ProgramId = string & { readonly __brand: 'ProgramId' };
```

Construction is gated inside the generators (`horseGenerator.ts`, `programGenerator.ts`). No component may synthesize an ID.
