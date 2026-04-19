# Software Developer Assessment Project

In this project, we would like you to create an interactive horse racing game.

## Requirements

1. **Technology:** You may use VueJs
2. **Generate Horse List:** The horse list should contain between 1 to 20 horses, randomly generated.
3. **Generate Race Schedule:** Upon clicking the Generate button, a race schedule must be created consisting of 6 rounds.
4. **Start the Race:** When the Start button is clicked, the races should begin, running one round at a time.
5. **Display Race Results:** The results for each race should appear in the Results field, shown sequentially as each race concludes.
6. **Animated Horse Movement:** The horses should visibly move during each race.
7. **Coding Style:** Please structure your code in a way that demonstrates clean and maintainable practices, as if for a large-scale project.

## Rules and Conditions

1. The game should have a total of 20 horses available for racing.
2. Each horse should be represented with a unique color.
3. Each horse's condition score should range from 1 to 100.
4. Each race should consist of 6 rounds.
5. For each round, select 10 random horses from the available 20.
6. **Round Specifications:** The rounds must occur at different lengths in the following sequence:
   - Round 1: 1200 meters
   - Round 2: 1400 meters
   - Round 3: 1600 meters
   - Round 4: 1800 meters
   - Round 5: 2000 meters
   - Round 6: 2200 meters

## Technical Expectations

1. **Vuex Store:** Implement state management to handle and manage the game's data.
2. **Component-Based Design:** Use Vue components to organize the structure of your code effectively.
3. **Unit Test**
4. **E2E Test**

## Additional Notes

1. This project is an opportunity to show your approach to component structure, code organization, and how you would handle state management within a complex feature. Aim to write code that is clear, organized, and adaptable for future scaling.
2. You are encouraged to ask questions at any time if you encounter uncertainties.

## What We Will Be Assessing

| Area | Criteria |
|------|----------|
| **Code Quality & Architecture** | Clean component structure, proper state management (Vuex/Pinia modules), TypeScript strictness, no duplicated logic or copy-paste utilities. |
| **Project Hygiene** | Proper .gitignore, single package manager, no committed artifacts (test results, cache folders, build outputs), no duplicate config files. |
| **Testing** | Unit tests with meaningful assertions, E2E tests that actually run against the real UI, semantic locators over brittle CSS selectors. |
| **CI/CD** | At minimum a GitHub Actions workflow running lint + test + build on PRs. Absence is a significant negative signal. |
| **AI Workflow** | Evidence of structured AI-assisted development — CLAUDE.md, .cursorrules, or equivalent config files. A large single-commit dump with no iteration history is a red flag. |
| **Git History** | Incremental, meaningful commits that tell a story. A single "first commit" or "Task Completed" commit is not acceptable. |
| **Correctness** | The core product must work. A visual result that contradicts the data output, or tests referencing UI elements that don't exist, are immediate disqualifiers. |
| **Visual Testing** | At least minimal Storybook/Histoire stories or snapshot tests — especially important for animation or 3D-heavy projects. |

Good luck!
