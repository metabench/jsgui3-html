# Codex Agent Operating Guide

This file augments `AGENTS.md` with Codex-specific expectations so automated contributions stay aligned with the jsgui3-html MVVM/MVC patterns.

## Core References
- **Project conventions:** always reread `AGENTS.md` before editing (snake_case variables, Camel_Case classes, kebab-case CSS).
- **MVVM architecture:** consult `MVVM.md` and `docs/mvvm_engine_review.md` for current design, gaps, and roadmap items.
- **Data binding internals:** familiarize yourself with `html-core/Data_Model_View_Model_Control.js`, `html-core/ModelBinder.js`, and mixins such as `control_mixins/model_data_view_compositional_representation.js`.
- **Testing playbooks:** use `docs/mvvm_engine_review.md §6` plus `test/mvvm/*.test.js` for isolation strategies.

## Working Principles
1. **Stay MVVM-aware**
   - Prefer `Data_Model_View_Model_Control` when building or modifying controls that bind to data.
   - Avoid ad-hoc DOM mutations; mirror state through `data.model` / `view.data.model` first.
   - When touching bindings, update or add isolation tests before DOM/rendering tests.
2. **Respect MVC/MVVM separation**
   - Constructors: build models and view composition; keep client-only logic inside `activate()`.
   - Bindings: use `BindingManager` helpers (`bind`, `computed`, `watch`) to synchronize models, and record them via `inspectBindings()` for debugging.
3. **Testing workflow**
   - Run targeted MVVM tests (`npm test -- mvvm` or `npx mocha test/mvvm/*.test.js`) after modifying bindings or models.
   - For control-level changes, add headless tests (see `docs/mvvm_engine_review.md §6.2`) before resorting to full rendering suites.
   - Capture regression scenarios as JSON fixtures or binder snapshots when feasible.
4. **Documentation discipline**
   - Update `docs/mvvm_engine_review.md` or `MVVM.md` whenever introducing new MVVM features, helpers, or workflows.
   - Reference affected sections directly (e.g., “see docs/mvvm_engine_review.md:##.##”) inside commit summaries or pull requests to help future automation stay informed.
5. **Tooling awareness**
   - The OpenAI Codex agent should keep an eye on future versions of the `agents-md` specification (source link currently returns 404—recheck periodically).
   - If the upstream spec is unavailable, fall back to the local guidance in this repository and announce the missing upstream reference in summaries.

Following this playbook keeps Codex-driven edits coherent with the project’s MVVM-first direction and ensures automated contributions maintain (or expand) the existing data-binding guarantees.
