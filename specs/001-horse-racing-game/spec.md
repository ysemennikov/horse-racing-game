# Feature Specification: Horse Racing Game

**Feature Branch**: `001-horse-racing-game`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "Interactive horse racing game that generates a list of horses, builds a 6-round race schedule, animates horses running each round, and reports results round by round."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate a race program and watch all six rounds complete (Priority: P1)

A racing fan opens the game, generates a full race program of six rounds drawn from the available horses, presses Start, and watches each round animate in sequence while finishing positions appear in the results panel as soon as each round ends.

**Why this priority**: This is the core loop of the product. Without it there is no game — everything else (roster browsing, schedule inspection, restarts) is secondary to a user being able to generate, run, and read the results of a complete program.

**Independent Test**: A user can generate a program, click Start, and without any further input observe all six rounds run to completion one after the other, with each round's ranked finishing order appearing in the results panel as that round ends. Success is verified by a final results panel containing six ranked round summaries.

**Acceptance Scenarios**:

1. **Given** the game is loaded with a roster of horses, **When** the user clicks Generate, **Then** a race program containing exactly six rounds is displayed, each round listing ten participating horses and its distance.
2. **Given** a race program has been generated, **When** the user clicks Start, **Then** the first round begins animating and horses visibly move from the starting line toward the finish line.
3. **Given** a round is in progress, **When** every horse in that round has crossed the finish line, **Then** a ranked result for that round (1st through 10th) is appended to the results panel before the next round starts.
4. **Given** the final (sixth) round has just finished, **When** its result is recorded, **Then** the program is marked complete and the results panel shows six ranked round summaries in order.

---

### User Story 2 - Inspect the roster of available horses (Priority: P2)

Before or after generating a program, the user can see the full roster of horses available in the game, including each horse's identifying color and its condition score, so they can anticipate which horses may perform well.

**Why this priority**: Seeing the roster gives the race meaning — users want to recognize "their" horse by color and form an expectation about its form from its condition score. The core race loop works without this view, but the experience is substantially richer with it.

**Independent Test**: A user opens the game and, without generating or starting a race, can view a list of all horses showing a distinct color per horse and a visible condition score per horse. Success is verified by counting entries and confirming color uniqueness and score range.

**Acceptance Scenarios**:

1. **Given** the game has loaded, **When** the user views the horse roster, **Then** exactly twenty horses are listed.
2. **Given** the roster is visible, **When** the user compares any two horses, **Then** their colors are visually distinguishable from each other.
3. **Given** the roster is visible, **When** the user reads any horse's condition, **Then** the displayed score is a whole number between 1 and 100 inclusive.

---

### User Story 3 - Inspect the generated race schedule before starting (Priority: P2)

After generating a program, the user can review the full six-round schedule — including which horses are in each round and each round's distance — before committing to watch the race.

**Why this priority**: Letting the user preview the schedule builds anticipation, helps them decide whether to restart for a different draw, and makes the subsequent races comprehensible. It is independently valuable but not required to run a race.

**Independent Test**: A user generates a program and, without pressing Start, can see all six rounds laid out with their distances and participating horses. Success is verified by inspecting each of the six rounds in the schedule and confirming each lists its distance and its participants.

**Acceptance Scenarios**:

1. **Given** the user has clicked Generate, **When** the schedule panel is displayed, **Then** it shows six rounds numbered 1 through 6 in order.
2. **Given** the schedule is displayed, **When** the user reads the distance for each round, **Then** the distances are 1200, 1400, 1600, 1800, 2000, and 2200 meters in that order.
3. **Given** the schedule is displayed, **When** the user inspects any round's lineup, **Then** it lists exactly ten distinct horses drawn from the roster.

---

### User Story 4 - Regenerate the program for a fresh draw (Priority: P3)

The user can click Generate again to discard the current schedule and produce a new random one, so they can try different horse combinations.

**Why this priority**: A nice-to-have for replay value. The core experience works with a single generate-and-run cycle; quick regeneration is a refinement.

**Independent Test**: A user generates a program, clicks Generate again, and observes a different schedule (different lineups in at least one round). Success is verified by comparing lineups before and after regeneration.

**Acceptance Scenarios**:

1. **Given** a program has been generated and no race is running, **When** the user clicks Generate again, **Then** a new six-round program replaces the previous one and previously displayed results are cleared.
2. **Given** a race is currently running, **When** the user clicks Generate, **Then** the ongoing race is not disrupted mid-round (see Edge Cases for the exact rule applied).

---

### Edge Cases

- **Start clicked without a schedule**: The Start control is unavailable (disabled or otherwise not actionable) until a schedule has been generated, so clicking it without a schedule has no effect.
- **Generate clicked while a race is running**: The game prevents regeneration while a race is in progress; the control is unavailable until the current program completes, so in-progress rounds are never corrupted or cut off silently.
- **Two horses finish on the same tick**: When multiple horses would cross the finish line simultaneously, finishing order is resolved deterministically (for example, by condition score and then by horse id) so that the round always produces a complete 1-through-10 ranking with no ties in the displayed results.
- **Window resized mid-race**: The track rescales responsively; animated horses continue to move and finishing order is preserved. No horse visibly jumps backward or teleports.
- **User navigates away or reloads**: In-progress race state is not required to be persisted. On reload the user sees the initial roster and no schedule, and can generate a fresh program.
- **Results panel overflow**: As results accumulate, the panel remains scrollable so all six round results are reachable without losing earlier ones.

## Requirements *(mandatory)*

### Functional Requirements

#### Roster

- **FR-001**: The game MUST provide a fixed roster of exactly 20 horses available for racing.
- **FR-002**: Each horse MUST have a color that is visually distinct from every other horse in the roster.
- **FR-003**: Each horse MUST have a condition score, which is a whole number between 1 and 100 inclusive, assigned at the start of the game.
- **FR-004**: Each horse MUST have a stable identity (name or number) by which it is shown in the roster, in schedules, and in results.

#### Program generation

- **FR-005**: The game MUST expose a Generate control that, when activated, produces a race program consisting of exactly 6 rounds.
- **FR-006**: Each round MUST have a fixed distance, assigned by round number in this exact sequence: Round 1 = 1200 m, Round 2 = 1400 m, Round 3 = 1600 m, Round 4 = 1800 m, Round 5 = 2000 m, Round 6 = 2200 m.
- **FR-007**: For each round, the game MUST randomly select exactly 10 distinct horses from the 20-horse roster to participate.
- **FR-008**: The selection of horses for each round MUST be independent of other rounds; a given horse may appear in zero, one, or multiple rounds across a single program.
- **FR-009**: Generating a program MUST clear any previously generated schedule and any previously displayed round results.
- **FR-010**: The Generate control MUST be unavailable while a race is in progress, so the active program cannot be replaced mid-run.

#### Schedule display

- **FR-011**: After generation, the game MUST display the full schedule showing each round's number, distance, and participating horses.

#### Race execution

- **FR-012**: The game MUST expose a Start control that begins the race from Round 1.
- **FR-013**: The Start control MUST be unavailable until a program has been generated.
- **FR-014**: When Start is activated, the game MUST run the rounds sequentially — one round at a time, in order from Round 1 to Round 6 — with each round beginning only after the previous one has produced a result.
- **FR-015**: During a round, every participating horse MUST visibly move along the track from a starting line toward a finish line; horses MUST NOT appear static while the round is in progress.
- **FR-016**: A horse's relative speed in a round MUST be influenced by its condition score such that, on average across many rounds, higher-condition horses finish higher than lower-condition horses, while still allowing individual-race variation so outcomes are not fully predictable.
- **FR-017**: A round ends only when every participating horse has crossed the finish line.

#### Results

- **FR-018**: As each round concludes, the game MUST append that round's ranked finishing order (positions 1 through 10, each associated with the finishing horse) to the results area.
- **FR-019**: Previously completed rounds' results MUST remain visible throughout the rest of the program; a new round's result does not replace earlier results.
- **FR-020**: The results panel MUST present rounds in the order they were run (Round 1 first, Round 6 last).
- **FR-021**: When the sixth round's result is recorded, the game MUST indicate that the program is complete and re-enable the Generate control for a new program.

### Key Entities

- **Horse**: A racer in the game. Attributes: identity (name or number), color (unique within the roster), condition score (1–100). Participates in zero or more rounds of a program.
- **Race Program**: An ordered set of six rounds generated together. Created by the Generate action; consumed by the Start action; replaced when Generate is activated again.
- **Round**: A single race within a program. Attributes: round number (1–6), distance (determined by round number), lineup (exactly 10 horses drawn from the roster), status (pending, running, complete), and on completion a ranked result.
- **Round Result**: The ranked finishing order of the ten horses in a round, positions 1 through 10, produced when the round ends. Results accumulate across the program and are displayed in round order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From a fresh load, a user can produce a race program in under 2 seconds after clicking Generate.
- **SC-002**: Every generated program contains exactly 6 rounds with the required distances (1200, 1400, 1600, 1800, 2000, 2200 m), and every round contains exactly 10 distinct horses drawn from the 20-horse roster, verified across 100 consecutive program generations.
- **SC-003**: During any round, horse positions update smoothly enough that a user perceives continuous motion (no perceptible stalls longer than ~150 ms) on a typical modern desktop browser.
- **SC-004**: Each round's ranked result appears in the results panel within 1 second of that round's last horse finishing, and before the next round begins.
- **SC-005**: Across 100 simulated rounds, the average finishing position of horses in the top condition quartile is meaningfully better (lower-numbered) than that of horses in the bottom condition quartile, confirming that condition influences outcomes while leaving room for variation.
- **SC-006**: A first-time user can complete one full cycle (see roster → Generate → review schedule → Start → read all six results) without instructions in under 3 minutes.
- **SC-007**: Across 100 consecutive program generations, 100% of rounds produce a complete ranking of 10 positions with no duplicate or missing positions.

## Assumptions

- The game runs in a modern desktop web browser; mobile layouts are a nice-to-have but not a scoped requirement for this iteration.
- The game is single-player and runs entirely in the browser; no account, persistence, leaderboard, or server component is in scope.
- "Unique color per horse" means 20 visually distinguishable colors chosen from a curated palette rather than arbitrary HSL sampling.
- "Horses visibly move" refers to animation of horse elements along a horizontal track lane per round; specific visual fidelity (sprites vs. simple shapes) is an implementation detail left for planning.
- Condition scores are generated once per game session at load time and remain fixed for the duration of that session; they do not evolve round to round.
- Results are ephemeral; there is no requirement to persist past programs across page reloads.
- Localization, accessibility beyond sensible defaults, and sound are out of scope for this iteration unless raised in a later spec revision.
- The user interface exposes three primary controls in a consistent location: the roster view, the Generate button, and the Start button, alongside the schedule and results panels.
