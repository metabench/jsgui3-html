# MVVM / MVC / Data Binding Implementation Checklist

Dense reference for agents implementing or extending the MVVM/MVC stack in **jsgui3-html**. Follow section order during planning; treat each checkbox as a task to confirm or update.

---

## 1. Repository & Context Prep
- [ ] **Read `AGENTS.md`** to refresh naming, file layout, and control conventions.
- [ ] **Review architecture docs** (`MVVM.md`, `docs/mvvm_engine_review.md`, `jsgui3-html Controls Analysis and Roadmap.md`) before modifying MVVM/MVC code.
- [ ] **Confirm context helpers**: ensure the working context (Page_Context) exposes `map_controls`, `mixins`, and planned shared stores before wiring new models.
- [ ] **Document scope**: create/update session notes (e.g., under `docs/sessions/`) summarizing intent, affected controls, and planned tests.

## 2. Core Model Infrastructure
- [ ] **Control_Data lifecycle** (`html-core/Control_Data.js`): implement / verify constructors accept `context`, enforce `Data_Model` instances, and emit `change` events when swapping models. Add helper utilities for consistent creation (`create_control_models` TODO).
- [ ] **Control_View scaffolding** (`html-core/Control_View.js`): ensure view data models are instantiated consistently and that UI substructures (`Control_View_UI`, low-level data) exist before composition.
- [ ] **Activation attributes**: confirm controls set `data-jsgui-data-model` / `data-jsgui-view-model` attributes before server render; update serialization helpers if missing.
- [ ] **Model factories**: design or adopt shared factories that create `data`, `view`, and `view.ui` objects in constructors; reference them from mixins and `Data_Model_View_Model_Control`.

## 3. Binding & Computation Layer
- [ ] **ModelBinder coverage** (`html-core/ModelBinder.js`): verify two-way bindings, transforms, reverse transforms, conditional updates, and cleanup behaviors via isolation tests (`test/mvvm/data-binding.test.js`); extend tests when features change.
- [ ] **BindingManager helpers**: expose convenience methods (`bind_value`, `bind_collection`, etc.) for common patterns, ensuring they register with `inspectBindings()` for diagnostics.
- [ ] **ComputedProperty & PropertyWatcher**: confirm dependencies, immediate execution, and teardown logic. Add unit tests for new dependency patterns or debug logging.
- [ ] **Circular binding safeguards**: add detection/logging when two bindings create loops; document expected behavior.

## 4. Control Composition (MVC/MVVM Integration)
- [ ] **Data_Model_View_Model_Control** (`html-core/Data_Model_View_Model_Control.js`):
  - [ ] Guarantee `this.data`, `this.view`, `this.view.data`, and `this.view.ui` exist even without `spec.data`/`spec.view`.
  - [ ] Rehydrate models from `context.map_controls` when DOM attributes exist; test both server and client branches.
  - [ ] Expose `bind`, `computed`, `watch`, and `inspectBindings` in public APIs; update docs/examples when signatures change.
- [ ] **Mixins** (e.g., `control_mixins/model_data_view_compositional_representation.js`):
  - [ ] Ensure mixins do not overwrite existing `data`/`view` objects; they should augment via helper APIs.
  - [ ] When mixins listen to `view.data.model.mixins`, confirm they safely register/unregister in activate/deactivate.
- [ ] **MVC layering**: when implementing controllers/views, maintain server-safe constructors and client-only `activate()` logic, guarding DOM references.

## 5. View/UI Composition & Layout
- [ ] **Control_View_UI completion** (`html-core/Control_View_UI.js`):
  - [ ] Implement slot registration, active/compositional model selection, and event emission when slots change.
  - [ ] Populate low-level data structures (`Control_View_UI_Low_Level*`) with concrete measurements/animation state when needed.
- [ ] **Declarative composition schema**: define JSON structure for layout/slot metadata consumed by layout controls (panels, toolbars, windows). Ensure schema aligns with documentation.
- [ ] **Reconciler hooks**: prototype differentiation between declarative composition vs. imperative `add()` calls; prefer declarative approach for new controls.

## 6. Cross-Control State & Persistence
- [ ] **Shared state store**: introduce/integrate a context-level `Control_State_Store` for themes, selection, routing, etc. Ensure controls bind via MVVM rather than reading DOM state.
- [ ] **History / undo stack**: wrap binding updates in transaction helpers (`history.begin/commit/rollback`); add tests verifying undo/redo on data models.
- [ ] **Persistence adapters**: design adapter pattern for REST/WebSocket/GraphQL interactions so MVVM updates can flow to external services with optimistic updates.

## 7. Testing Workflows
- [ ] **Level A – Isolation tests**: update `test/mvvm/data-binding.test.js`, `test/mvvm/transformations.test.js`, or new suites to cover any new binding/model capabilities. Use fake timers or promises to assert async propagation.
- [ ] **Level B – Headless control simulations**: create mock controls (subclassing `Data_Model_View_Model_Control`) that operate without DOMs; assert lifecycles, mixin wiring, and binding graphs.
- [ ] **Level C – Rendering/integration tests**: only after Level A/B pass, add/adjust jsdom or server rendering tests (`test/rendering.test.js`, `test/diagnostic-bugs.test.js`) to reflect UI changes.
- [ ] **Snapshot harness**: capture `BindingManager.inspect()` results in JSON fixtures (e.g., `test/mvvm/__snapshots__/`) to detect binding graph regressions. Normalize IDs/timestamps to keep tests stable.
- [ ] **Mutation/ordering tests**: add optional toggles to shuffle binding registration order and verify results remain deterministic.

## 8. Documentation & Dev Workflow
- [ ] **Update docs**: whenever MVVM/MVC/binding behavior changes, amend `docs/mvvm_engine_review.md`, `MVVM.md`, and relevant README files; reference specific sections/line numbers.
- [ ] **Session notes**: log open questions, design decisions, and follow-ups in `docs/sessions/` with timestamps for later agents.
- [ ] **Release checklist**: include MVVM regression test command(s), doc updates, and snapshot refresh steps in pull request descriptions.
- [ ] **Agent guidance**: keep `agents/codex_agent.md` current when workflows or references change.

## 9. Implementation Workflow Summary
1. **Plan**: review architecture docs, write session goals, and identify test gaps.
2. **Prototype**: modify models/bindings in isolation; ensure tests exist at Level A.
3. **Integrate**: wire controls/mixins using declarative bindings; add Level B tests.
4. **Render**: confirm UI/DOM output only after MVVM layers pass; update Level C tests.
5. **Document**: update docs + agent guides; record session summary.
6. **Verify**: run the MVVM test matrix plus any affected suites; capture snapshots.

Use this checklist iteratively—tick sections as you implement, and add new entries when the framework grows. This keeps MVVM/MVC/data-binding efforts coordinated across agents and prevents regressions as the engine becomes more powerful.
