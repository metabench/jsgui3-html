# Model-View-ViewModel Engine Review and Roadmap

This document surveys the MVVM infrastructure currently available in **jsgui3-html**, summarizes the gaps preventing it from powering a modern interactive UI engine, and proposes concrete implementation workflows to close those gaps.

---

## 1. Current Building Blocks

### 1.1 Data & View Containers
- `html-core/Data.js` defines the generic `Data` wrapper used by controls to hold a lazily-instantiated `Data_Model`/`Data_Value`, and emits `change` events when the backing model is swapped (`html-core/Data.js:1-33`).
- `html-core/Control_Data.js` extends that wrapper for control data but currently contains no lifecycle logic beyond chaining to `Data` (`html-core/Control_Data.js:1-90`).
- `html-core/Control_View.js` constructs two layers: `Control_View_Data` (which itself extends `Control_Data`) and `Control_View_UI`, plus low-level placeholders for future rendering abstractions (`html-core/Control_View.js:1-154`).
- `html-core/Control_View_UI.js` scaffolds multiple nested models (active/compositional/low-level) but provides no orchestration or DOM integration yet (`html-core/Control_View_UI.js:1-147`).
- `html-core/control_model_factory.js` now exports `ensure_control_models`, a helper that bootstraps `data`, `view`, and `view.ui` for every control, wiring constructor specs into the appropriate data models automatically.

### 1.2 MVVM Control Base Class
- `Data_Model_View_Model_Control` extends `control-enh` and wires a `BindingManager` per control (`html-core/Data_Model_View_Model_Control.js:1-210`).
- It inspects `spec.data`, `spec.view`, and serialized DOM attributes (`data-jsgui-data-model`, `data-jsgui-view-model`) to hydrate models on the server and reconnect them on the client (`html-core/Data_Model_View_Model_Control.js:83-206`).
- Public helpers (`bind`, `computed`, `watch`, `inspectBindings`) wrap the `BindingManager` API, exposing a declarative binding DSL to higher-level controls (`html-core/Data_Model_View_Model_Control.js:214-308`).

### 1.3 Binding Infrastructure
- `ModelBinder` performs two-way property bindings with optional transforms, reverse converters, conditions, and debugging output (`html-core/ModelBinder.js:1-168`).
- `ComputedProperty` and `PropertyWatcher` implement derived values and fine-grained observers, now exposing convenience aliases (`destroy()`, `unwatch()`) and optional multi-property watching (`html-core/ModelBinder.js:172-312`).
- `BindingManager` aggregates binders/watchers per control, exposes helper APIs (`bind_value`, `bind_collection`), adds binding-loop suppression, and provides cleanup plus inspection hooks (`html-core/ModelBinder.js:314-420`).

### 1.4 Mixins & Composition Helpers
- `control_mixins/model_data_view_compositional_representation.js` bootstrap controls with `Control_Data`, `Control_View`, and `Control_Validation`, while also registering mixins stored in the view data model (`control_mixins/model_data_view_compositional_representation.js:1-69`).
- Other mixins (`selectable`, `dragable`, `pressed-state`) demonstrate how behavior updates view/data layers, but they mostly manipulate DOM classes directly and bypass the view models.

### 1.5 Existing Controls Using MVVM
- Controls such as `Text_Field` create both data and view models, keep them in sync manually, and rely on the lower-level text input control for actual DOM binding (`controls/organised/0-core/0-basic/1-compositional/Text_Field.js:200-376`).
- Higher-level controls (e.g., `Form_Field`, `Active_HTML_Document`) rely on the MVVM helpers sporadically, often resorting to ad-hoc event wiring because the View/UI abstraction is not yet complete.

---

## 2. Observed Gaps & Risks

### 2.1 Incomplete Model Lifecycle
- `Control_Data`/`Control_View` do not enforce or document how models should be instantiated, validated, or torn down. Many controls silently assume `this.data` exists and contains a `Data_Object`, leading to runtime errors (see the `Validation_Status_Indicator` bug in `docs/bugs/detailed-fix-plans.md`).
- Server/client hydration currently relies on DOM attributes parsed in `Data_Model_View_Model_Control`, but there is no symmetric serialization API for controls that are not DMVM-based. This makes isomorphic rendering fragile.

### 2.2 View/UI Layers Are Stubs
- `Control_View_UI` establishes placeholders for compositional models but never reconciles them with actual child controls or DOM nodes. Compositions such as a toolbar or layout container therefore bypass this layer and add child controls manually.
- Low-level UI data classes (`Control_View_UI_Low_Level*`) are empty, so there is no structured representation for measurements, CSS states, or animation metadata.

### 2.3 Binding DSL Adoption Is Sparse
- The `bind`/`computed` APIs exist but the majority of controls still wire models manually. Without a convenience declarative syntax and docs, new controls will continue to use ad-hoc event listeners.
- There is no validation around circular bindings, no batching for high-frequency updates, and no instrumentation to surface binding graphs in diagnostics.

### 2.4 Lack of Engine-Level State Flows
- No centralized state store coordinates multiple controls. Each control owns its models, so cross-control synchronization (e.g., selection in a List driving detail view content) must be coded per use case.
- History/undo, optimistic updates, offline buffering, and derived caches—all staples of powerful UI engines—are absent.

### 2.5 Testing & Tooling Gaps
- The test suite lacks coverage for MVVM hydration, binding loops, and cross-context serialization. Most documented failures (see `docs/bugs/control-rendering-bugs.md`) stem from missing initialization logic that tests could have caught.
- There is no inspector to visualize data/view/view-models at runtime, which makes debugging binding issues difficult.

---

## 3. Target Capabilities for a Powerful Interactive Engine

1. **Deterministic Model Initialization**
   - Every control should declare what models it owns (data, view, UI layers) and how they are created, serialized, and hydrated.
   - Context-level registries should provide model factories so servers can emit deterministic IDs and clients can rehydrate without custom code.

2. **Composable Binding Pipelines**
   - Declarative bindings should support chaining (data → view → DOM), transformations, throttling, validation, and conflict resolution.
   - Binding graphs must be introspectable for diagnostics and devtools.

3. **State Orchestration**
   - Controls need opt-in participation in shared application models (for layout, themes, selection, drag/drop sessions, etc.).
   - MVVM layers should plug into history/undo stacks and persistence adapters (REST, GraphQL, realtime).

4. **UI Composition Metadata**
   - `Control_View_UI` must describe compositions declaratively (slots, templates, responsive rules) so engines can render, diff, and recycle subtrees.
   - Layout/animation engines should consume UI models rather than raw DOM manipulations.

5. **Testing & Observability**
   - Snapshot and behavioral tests should assert both rendered HTML and the associated model graph.
   - Tooling should expose inspectors (CLI dumps, devtools panels) that print bindings, computed properties, and pending updates.

---

## 4. Implementation Roadmap & Workflows

### Phase 1 – Foundation Hardening
1. **Model Contracts & Serialization**
   - Document required fields for `this.data`, `this.view`, and `this.view.ui`.
   - Implement helper factories (e.g., `create_control_models(spec)`) that every control can call inside constructors, guaranteeing consistent structures.
   - Workflow:
     1. Add construction helpers under `html-core/model-factory.js`.
     2. Refactor `Data_Model_View_Model_Control` and mixins to call the helper instead of ad-hoc checks.
     3. Add serialization utilities that set `data-jsgui-*` attributes automatically before server render.
     4. Write hydration tests in `test/mvvm/data-binding.test.js`.

2. **Control View/UI Completion**
   - Flesh out `Control_View_UI_Compositional` to store named slots, current layout, and activation metadata.
   - Add APIs such as `this.view.ui.define_slot('title', { accepts: ['Control'], multiple: false })`.
   - Workflow:
     1. Extend `Control_View_UI.js` with slot registration + events.
     2. Update sample controls (e.g., `Panel`, `Window`) to define slots and place child controls through the API.
     3. Provide DOM reconciliation helpers so slots render consistently on server and client.

3. **Binding DSL Adoption**
   - Create higher-level helpers, e.g., `this.bind_value('value')`, `this.bind_collection('items', ...)`.
   - Provide documentation + recipes in `docs/mvvm_engine_review.md` (this file) and `MVVM.md`.
   - Workflow:
     1. Extend `BindingManager` with shortcuts.
     2. Refactor `Text_Field` and other controls to use the DSL instead of manual event wiring.
     3. Back the refactor with targeted tests (`test/rendering.test.js`).

### Phase 2 – Engine Capabilities
1. **Shared State Modules**
   - Introduce a `Control_State_Store` (per context) that exposes observable models for themes, focus, routing, etc.
   - Controls subscribe via MVVM bindings instead of direct DOM queries.
   - Workflow:
     1. Implement store API (likely wrapping `Data_Object`/`Collection`).
     2. Inject store into contexts (`page-context.js`) so controls can access `this.context.state`.
     3. Add sample controls (e.g., `Window_Manager`) that coordinate multiple windows through the shared store.

2. **History & Persistence Hooks**
   - Provide mixins that wrap `BindingManager` updates in undoable transactions (`history.begin()`, `history.commit()`).
   - Add persistence adapters so data model changes emit actions (REST calls, WebSocket messages) with optimistic rollback support.
   - Workflow:
     1. Implement a `History_Manager` module that records model diffs.
     2. Add API on `Data_Model_View_Model_Control` (`this.with_history(fn)`).
     3. Create integration tests verifying undo/redo and persistence callbacks.

3. **UI Composition Engine**
   - Build a reconciler that reads `Control_View_UI` compositions and mounts/unmounts child controls declaratively.
   - Support dynamic templates (tabs, lists) with virtualization hooks.
   - Workflow:
     1. Define a JSON schema for compositions (containers, slots, constraints).
     2. Implement diff logic (similar to React’s reconciliation but tailored to controls).
     3. Update layout controls to emit compositions instead of manually instantiating child controls.

### Phase 3 – Advanced Features
1. **Reactive Resource Pipelines**
   - Integrate data fetching with MVVM (e.g., `this.bind_resource('users', '/api/users')`), caching responses inside data models.
2. **DevTools & Diagnostics**
   - Build CLI/GUI inspectors that display control trees, model graphs, bindings, pending computations.
3. **Performance Tooling**
   - Instrument binding updates and DOM diffs to surface slow components, ideally integrating with the testing harness.

---

## 5. Documentation & Workflow Guidance

When implementing MVVM-powered controls going forward:
1. **Create Models Early**  
   - In constructors, call a shared helper to create `this.data`, `this.view`, `this.view.data`, and `this.view.ui` before any DOM composition.
2. **Declare Bindings, Don’t Wire Manually**  
   - Use `this.bind`/`this.computed`/`this.watch` for interactions between models; reserve manual listeners for DOM events after `activate()`.
3. **Guard Server/Client Differences**  
   - Only read `this.dom.el` when it exists; rely on models for initial state. Pair every DOM mutation with a model update.
4. **Serialize Models Explicitly**  
   - Before server render completes, set `data-jsgui-*` attributes so hydration will reuse the same IDs.
5. **Test Both HTML and Model Graphs**  
   - Rendering tests should assert that initial models contain the expected values (leveraging `inspectBindings()` for verification).

---

## 6. MVVM Testing Methodologies

### 6.1 Pure MVVM Isolation (No DOM/Control Dependencies)
- **Focus:** `Data_Object`, `ModelBinder`, `ComputedProperty`, `BindingManager`.
- **Harness:** Create models directly from `lang-tools` with faux contexts (simple POJOs for `context.map_controls`) and interact only with their APIs. The existing `test/mvvm/data-binding.test.js` and `test/mvvm/transformations.test.js` provide templates—extend them with new cases before touching the HTML layer.
- **Methodology:**
  1. Instantiate bare models (`new Data_Object({ ... })`) and register change listeners or spies (via `sinon`).
  2. Compose bindings through `new ModelBinder(...)` or `binding_manager.bind(...)` and assert synchronous invariants (initial sync) plus asynchronous propagation (using promises or fake timers).
  3. Exercise failure modes (circular bindings, invalid transforms) by asserting emitted warnings/exceptions without spinning up controls.
  4. Persist models through serialization utilities once they exist, verifying that rehydration reproduces IDs and events.
- **Advantages:** Fast (<10ms) unit tests, zero reliance on `Control`, perfect for regression coverage of binding logic.

### 6.2 Headless Control Simulation (Active Models, No HTML Rendering)
- **Focus:** `Data_Model_View_Model_Control` and mixins operating with active event loops but without DOM nodes.
- **Harness:**
  - Build a lightweight mock control by subclassing `Data_Model_View_Model_Control` and overriding `compose` to operate on models only (no DOM). Provide a mock `context` that satisfies lookups for `map_controls`, `mixins`, and `resources`.
  - Simulate lifecycle by calling `pre_activate()`, `activate()`, and manual event emitters that mimic DOM interactions (e.g., call `control.raise('input', { value })`).
- **Methodology:**
  1. Compose child pseudo-controls with stubbed `data`/`view` objects so `this.add()` is never invoked; rely on `BindingManager` to propagate state.
  2. Trigger "user" interactions by mutating `view.data.model` or raising events the way DOM would—observe resulting mutations in `data.model` or context stores.
  3. Assert that slot definitions, computed properties, and watchers fire in the intended order; capture asynchronous flows by awaiting microtasks or using fake timers.
  4. Rehydrate simulated controls by serializing their models (attach `data-jsgui-*` attributes manually) and instantiating clones to ensure hydration parity.
- **Advantages:** Exercises activation paths, mixin wiring, and binding graphs without relying on HTML serialization or jsdom.

### 6.3 Scenario Testing Without HTML Rendering
- Compose small MVVM systems (e.g., master-detail pair) entirely through models:
  1. Build shared application models (selection, sorting) as `Data_Object`s.
  2. Instantiate two mock controls binding to shared models via `BindingManager`.
  3. Mutate one control’s view model and assert that another control’s data model responds accordingly.
- Store scenario fixtures as JSON to drive parameterized tests—this makes it easy to add new edge cases while keeping the code stable.

### 6.4 Workflows for Continuous MVVM Development
1. **Layered Test Matrix**
   - **Level A:** Pure data/binding unit tests (fast, deterministic).
   - **Level B:** Headless control simulations verifying lifecycle + activation.
   - **Level C:** Rendering/integration tests (jsdom/server-render) only when necessary.
   - Require new MVVM features to add cases across Level A and B before touching Level C.
2. **Regression Harness**
   - Use `BindingManager.inspect()` snapshots as golden data. Serialize them in JSON fixtures checked into `test/mvvm/__snapshots__` and diff during CI to catch binding graph changes.
   - Provide helper utilities to normalize IDs/time-dependent fields so tests remain flexible while the engine evolves.
3. **Mutation Testing Hooks**
   - Introduce optional mutation toggles (e.g., environment flags that reorder binding registration) to ensure tests fail when ordering assumptions are broken.
4. **Developer Workflow**
   - When implementing MVVM changes:
     1. Write/extend isolation tests validating the new behavior.
     2. Create or update a headless scenario test to exercise the lifecycle.
     3. Only then adjust rendering/integration specs if UI output changes.
     4. Document the new coverage in commit summaries to keep future contributors aware of the regression nets.

These methodologies keep MVVM verification fast and deterministic, protect against regressions during rapid refactors, and avoid the brittleness of HTML snapshot tests until the view/UI layer requires it.

### Appendix: Immediate Action Checklist
- [ ] Publish helper APIs for guaranteed data/view creation.
- [ ] Document slot-based view composition and adopt it in layout controls.
- [ ] Convert at least three core controls (Text_Field, Window, Panel) to use declarative bindings.
- [ ] Add MVVM-focused tests covering hydration, binding, and serialization scenarios.
- [ ] Prototype a shared context state store and wire it into an example (e.g., window manager).

Delivering the above steps will transition jsgui3-html from ad-hoc MVVM usage to a cohesive engine capable of powering complex interactive applications with confidence.
