# Working Notes

Session: Tpl Activation Parity

---

## 2026-03-05 Audit

**Context**: User asked for a deep implementation audit and requested that the relevant templating and activation gaps be fixed.

**Findings**:
- Docs advertise `jsgui.tpl` and `const { tpl } = require('jsgui3-html')`, but `html-core` only exports `parse` and `parse_mount`.
- Activation currently restores `bind-text`, `bind-value`, `bind-class`, and `on-*`, but not `bind-style`, `bind-visible`, or `bind-list`.
- The existing `test/core/template_binding.test.js` suite is stale because it imports `tpl` from `html-core`, which is currently undefined.
- `tmp/test-tpl-hydration.js` verifies SSR serialization only; it does not actually exercise browser activation despite its header comment.

**Decisions**:
- Add `tpl` to the public export surface and document it as the canonical API.
- Extend SSR metadata serialization and `_activate_tpl_bindings()` for the advanced directives that can be reattached from DOM metadata.
- Convert activation checks into durable automated tests instead of leaving them in `tmp/`.

**Next Steps**:
- Patch export surface and activation logic.
- Add targeted tests for export shape and SSR-to-activation parity.
- Update docs and lessons based on the final implementation.

---

## 2026-03-05 Implementation

**Context**: Core fixes landed and the targeted regression suite was rerun.

**Findings**:
- `html-core` now exports `tpl` and `template` from the root namespace without repurposing the existing `html` control symbol.
- SSR metadata now covers `bind-style`, `bind-visible`, and `bind-list`, and activation restores those directives.
- Bound instance methods such as `this.save_profile.bind(this)` now serialize for activation.
- The stale `template_binding` suite now passes and includes a direct SSR-to-activation regression.

**Decisions**:
- Keep `tpl` as the canonical public API and update docs instead of changing `jsgui.html`, which already names the native `<html>` control class.
- Use DOM-based bind-list rerendering during activation so direct reattachment tests do not require a prebuilt child control tree.

**Next Steps**:
- Finalize the session summary and capture final verification results.

---

## 2026-03-05 Documentation Pass

**Context**: User requested full documentation coverage plus an SVG describing the new templating and activation behavior.

**Findings**:
- `html-core/README.md` needed a direct `tpl` section because the main internal methods live under `Data_Model_View_Model_Control`.
- The declarative templating book needed an explicit SSR-to-activation support matrix and public API clarification.
- The repo referenced `docs/agi/PATTERNS.md`, but the file did not exist yet.

**Decisions**:
- Document `tpl` as the canonical public API and leave `jsgui.html` documented only as the native `<html>` control symbol.
- Add the SVG to the declarative templating book so it sits next to the feature documentation.
- Create `docs/agi/PATTERNS.md` with the SSR metadata / activation pattern.

**Next Steps**:
- Run final verification and close the session summary with the documentation work included.

---
