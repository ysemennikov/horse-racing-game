<!--
SYNC IMPACT REPORT
==================
Version change: (template/unratified) → 1.0.0
Rationale: Initial ratification of project constitution. MAJOR bump from template to establish
the first authoritative principle set.

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Reuse Over Duplication
  - [PRINCIPLE_2_NAME] → II. Type Safety is Non-Negotiable
  - [PRINCIPLE_3_NAME] → III. Modern Vue 3 Composition
  - [PRINCIPLE_4_NAME] → IV. Purposeful Comments
  - [PRINCIPLE_5_NAME] → V. Business-First Naming

Added sections:
  - Technology & Standards (Vue 3, TailwindCSS, TypeScript baseline)
  - Development Workflow (type-check gate, documentation lookup, review expectations)

Removed sections: none (all template placeholders now populated)

Templates / docs reviewed for alignment:
  - .specify/templates/plan-template.md              ✅ Constitution Check gate preserved; no edits required
  - .specify/templates/spec-template.md              ✅ No constitution-specific references; no edits required
  - .specify/templates/tasks-template.md             ✅ No constitution-specific references; no edits required
  - .specify/templates/checklist-template.md         ✅ No constitution-specific references; no edits required
  - CLAUDE.md                                        ✅ Already delegates to plan/constitution; no edits required
  - AGENTS.md                                        ✅ Source of truth for agent guidelines; principles mirror it
  - README.md                                        ✅ No constitution-specific references; no edits required

Follow-up TODOs: none
-->

# Horse Racing Game Constitution

## Core Principles

### I. Reuse Over Duplication

Reusing existing code MUST be preferred over writing new equivalents. Before adding a
component, composable, or function, contributors MUST search the codebase for existing
implementations that can be used, extended, or refactored. Whenever the same logic or
markup appears in two or more places, it MUST be extracted into a shared
component/composable/function so every call site uses the single source of truth.

**Rationale**: Duplication scales linearly with maintenance cost and divergence risk.
Extraction at the second occurrence keeps abstractions grounded in real usage rather
than speculative generality.

### II. Type Safety is Non-Negotiable

All code MUST be type-safe. `any` MUST NOT be used unless no other option exists, and
each occurrence MUST be justified in a comment. Type assertions (`as T`, `as unknown as
T`) MUST be avoided; prefer type guards, narrowing, and proper generics. Every change
MUST leave `npm run type-check` passing — reported errors MUST be fixed, not suppressed.

**Rationale**: TypeScript's value collapses the moment types are bypassed. Clean
inference and narrowing surface real bugs at compile time; `any` and assertions push
them to runtime.

### III. Modern Vue 3 Composition

The project MUST use Vue 3 Composition API with `<script setup>` and modern primitives
(e.g. `defineModel`, `useTemplateRef`, `defineProps`/`defineEmits` with TypeScript
generics). Composables MUST only be invoked at the root of `<script setup>` or at the
root of another composable — never inside conditionals, loops, callbacks, or lifecycle
hooks. When API details are uncertain, current documentation MUST be fetched via
context7 rather than relying on memorized syntax.

**Rationale**: The Composition API and its newer helpers produce clearer, more testable
components. The root-only composable rule preserves Vue's reactive ownership model;
violating it breaks reactivity and ordering guarantees.

### IV. Purposeful Comments

Comments MUST only be written when they explain the non-obvious *why*: a hidden
constraint, a subtle invariant, a workaround with a concrete reason, or structured
annotations (JSDoc, `TODO`, `FIXME`). Comments that restate *what* well-named code
already shows MUST NOT be added. Existing comments MUST NOT be deleted unless they have
become factually wrong or obsolete.

**Rationale**: Redundant comments rot and mislead; load-bearing comments preserve
context that code alone cannot. Preserving existing comments respects prior authors'
judgment about what was non-obvious.

### V. Business-First Naming

File, directory, composable, and variable names MUST describe the domain concept they
represent (e.g. `statuses.ts`, `horse.ts`, `useRaceSimulation.ts`). Generic technical
names — `utils.ts`, `helpers.ts`, `common.ts`, `types.ts`, `enums.ts`, `constants.ts` —
MUST NOT be used as containers for unrelated logic. When no single business concept
applies, the file's scope MUST be narrowed until one does.

**Rationale**: Business-oriented names make the codebase navigable by intent. Generic
buckets accrete unrelated logic and become entropy sinks that obscure the domain model.

## Technology & Standards

The project's technology baseline is fixed and MUST NOT be expanded without an
amendment:

- **Framework**: Vue 3 with `<script setup>` and the Composition API.
- **Styling**: TailwindCSS. Custom CSS MUST be limited to cases Tailwind cannot express.
- **Language**: TypeScript (strict mode assumed; `any` and type assertions discouraged
  per Principle II).
- **Tooling**: Vite for dev/build, Vitest for unit tests, Playwright for E2E, ESLint
  for linting, `vue-tsc` for type-checking.
- **Documentation lookups**: Library/API/CLI documentation MUST be retrieved via
  context7 (preferred over web search or training-data recall), including for
  well-known libraries such as Vue, Tailwind, or Vite.

Adding a new runtime dependency (state library, router, animation engine, etc.) is a
material change and MUST be justified in the feature plan under *Constitution Check*.

## Development Workflow

- **Type-check gate**: Every change MUST pass `npm run type-check` locally before being
  considered complete. Reported errors MUST be fixed at the source; suppressions
  (`// @ts-ignore`, `// @ts-expect-error` without explanation) MUST NOT be used to
  silence failures.
- **Reuse audit**: Before introducing a new component, composable, or utility,
  contributors MUST perform a reuse audit of the existing `src/` tree (especially
  `src/shared/` and `src/features/`) and document in the plan why reuse was not viable
  if a new artifact is created.
- **Naming review**: PR reviewers MUST flag file or symbol names that describe
  mechanics ("helpers", "utils", "service") instead of the business concept.
- **Comment review**: PR reviewers MUST challenge comments that restate the code, and
  MUST NOT request the deletion of existing comments that still carry non-obvious
  context.
- **Composable placement**: PR reviewers MUST verify that `use*` composables are
  invoked only at the root of `<script setup>` or another composable.

## Governance

This constitution supersedes any prior informal conventions. All feature plans,
specifications, and task lists MUST verify compliance with the principles above in
their Constitution Check section; violations MUST be justified in *Complexity Tracking*
or the offending work MUST be revised.

Amendments to this constitution require:

1. A documented rationale describing the problem the amendment solves.
2. Explicit identification of affected principles, sections, and dependent templates.
3. A version bump per semantic-versioning rules:
   - **MAJOR**: Removing a principle, redefining one incompatibly, or tightening
     governance in a way that invalidates in-flight work.
   - **MINOR**: Adding a new principle/section or materially expanding guidance.
   - **PATCH**: Wording, clarification, or typo-level refinements that do not change
     meaning.
4. Synchronized updates to `.specify/templates/*` and any runtime guidance (`CLAUDE.md`,
   `AGENTS.md`, `README.md`) that reference the changed principle.

Runtime development guidance for agents and contributors lives in `AGENTS.md` and
`CLAUDE.md`; those files MUST remain consistent with this constitution and MUST be
updated in the same change that amends it.

**Version**: 1.0.0 | **Ratified**: 2026-04-20 | **Last Amended**: 2026-04-20
