# Working Notes

Session: Example Health Fixes

---

## 2026-03-07 Initial Audit

**Context**: User asked to fix the example surface after an example-health audit found multiple failures.

**Findings**:
- `dev-examples/*` that did start were serving `/js/js.js` with only the fallback "Bundling failed" stub.
- Direct reproduction showed the shared failure is in `jsgui3-server`'s `JSGUI3_HTML_Control_Optimizer`, where local module resolution can return a directory path that is later passed to `readFile()`, causing `EISDIR`.
- Example-local failures were also confirmed in counter, layout-controls, form-editor-features, and wysiwyg-form-builder.

**Decisions**:
- Fix the shared bundler first so example verification reflects real client bundles.
- Track this work in a new session because it spans a different problem area than tpl activation parity.

**Next Steps**:
- Patch the optimizer to return files only.
- Re-run a minimal bundler repro before moving on to example-local fixes.

---

## 2026-03-07 Repair Pass

**Shared fix**:
- Patched `jsgui3-server` bundler resolution so `src_path_client_js` builds no longer fail with `EISDIR`.

**Example repairs**:
- Reworked `counter`, `layout-controls`, `form_editor_features`, `data-controls`, and `missing-controls` demos so SSR activation recovers their interactive paths.
- Fixed `Pagination` SSR rendering so button labels render as real text instead of placeholder tokens.
- Added hydration-safe control wiring to picker demos:
  - `Color_Picker` now exposes its canvases, sliders, inputs, palette, and preview nodes via `data-jsgui-ctrl`.
  - `DateTime_Picker` now composes with explicit controls instead of emitting `[object Object]` from nested template fragments.
- Added explicit browser bootstrap to demos that were still shipping static SSR pages:
  - `dev-examples/binding/showcase_app/client.js`
  - `dev-examples/rich-text-editor/client.js`
- Repaired `UserForm` hydration by giving it a stable `user_form` type, reconnecting child refs on activation, and adding DOM sync for validation/error rendering.
- Replaced `examples/ex_data-transform-resource.js` placeholder comments with a runnable transformation-resource example.

**Verification highlights**:
- `test/e2e/missing-controls.test.js`: passing
- `test/core/missing_controls.test.js`: passing
- `test/e2e/picker_controls_e2e.test.js` (standalone): 39 passed, 0 failed
- Browser smoke checks passed for:
  - `showcase_app`
  - `rich-text-editor`
  - `user-form`
  - `progressive`
- Root example scripts now all execute cleanly, including `ex_data-transform-resource.js`.

**Residual issues not addressed in this pass**:
- Example/dev server stderr is still noisy because of long-standing case-sensitivity warnings in legacy `require(...)` paths.
- Demo servers still return `404` for `/favicon.ico`, which is harmless but noisy during smoke runs.

---

## 2026-03-07 Final Verification Sweep

**Additional repair**:
- `dev-examples/wysiwyg-form-builder/client.js` still had two activation-time defects after the main repair pass:
  - hydrated `FormBuilder` refs were not rewired to live DOM nodes
  - `Data_Object#get('fields')` returned a `Data_Value`, so the demo was trying to call array methods on a wrapped value
- Fixed `FormBuilder` by tagging/wiring its SSR refs, normalizing model reads, and using DOM-safe toolbar handling for preview/edit mode.
- Added stable type names to shared controls used by the demo:
  - `controls/organised/1-standard/5-ui/Toolbar.js`
  - `controls/organised/1-standard/1-editor/Property_Editor.js`

**Final verification**:
- Full startup sweep across all `dev-examples/*/server.js` entries passed:
  - each root page returned `200`
  - each `/js/js.js` bundle returned `200`
  - no demo served the fallback `Bundling failed` stub
- Full standalone `examples/*.js` sweep passed.
- Browser smoke passed for:
  - `data-controls` filter + grid selection
  - `layout-controls` stepper + drawer
  - `wysiwyg-form-builder` add field + preview mode
- Regression checks passed for:
  - `test/e2e/form_editor_features.test.js`
  - `test/e2e/property-grid.test.js`

**Close-out**:
- The example surface is now in working order at the startup/smoke/E2E level covered in this session.
- Remaining noise is non-blocking:
  - case-sensitive `require(...)` warnings from legacy paths
  - `404` for `/favicon.ico`

---

<!-- Add new entries above this line -->
