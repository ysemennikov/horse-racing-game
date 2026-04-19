## Project Context
We are creating an interactive horse racing game.

## Tech Stack
- Vue 3
- TailwindCSS
- TypeScript

## General Guidelines
- Use context7 to fetch any documentation.
- Prefer to reuse existing code when possible (you can move some generic code to new components/functions/etc.).
- Don't duplicate code. If you see a similar piece of code in different places, create a new component/function/etc.
- Run `type-check` command to ensure type safety. Fix the type errors found by the command.
- Do not add unnecessary comments in the code. Only add comments if they are necessary to understand the code OR if it's jsdoc / todo / etc. Do not delete existing comments unless they are no longer necessary.
- Prefer business names for files over technical (e.g. 'statuses.ts' instead of 'enums.ts'). Avoid technical names like 'utils.ts', 'helpers.ts', 'common.ts', 'types.ts', etc.

## Vue
- Composables should only be used either at the root of `script setup` or at the root of other composables.
- Use modern capabilities of Vue 3 (e.g. defineModel, useTemplateRef, etc.) use context7 to fetch docs about it.

## TypeScript
- Avoid using `any` type as much as possible.
- Avoid using type assertions (`as ***`, `as unknown as ***`) as much as possible.
