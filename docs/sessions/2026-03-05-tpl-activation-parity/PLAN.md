# Session Plan: Tpl Activation Parity

**Date**: 2026-03-05
**Agent**: Codex (GPT-5)
**Goal**: Bring declarative `tpl` docs, public exports, SSR serialization, and client activation behavior into alignment.

## Scope

### In Scope
- Export the documented `tpl` API from `html-core` / `jsgui3-html`.
- Ensure declarative bindings that render during SSR also survive client activation where feasible.
- Add or repair automated tests for public API access and SSR-to-activation behavior.
- Update docs that currently describe misleading or incomplete templating behavior.
- Record the session and any project-specific lessons.

### Out of Scope
- Reworking the broader activation system outside templating-related gaps.
- Refactoring unrelated dev-example server startup behavior.
- Replacing all existing templating documentation with a larger redesign.

## Risks
- `jsgui.html` already names the native `<html>` control, so templating aliases must avoid breaking existing consumers.
- Activation metadata for advanced directives needs to remain SSR-safe and compact.
- Existing activation flows rely on `pre_activate` / `activate`; tests must cover direct DOM reattachment carefully.

## Success Criteria
- [ ] `const { tpl } = require('jsgui3-html')` works.
- [ ] Declarative activation restores the supported directive set with explicit tests.
- [ ] Templating tests pass without relying on ad hoc local scripts.
- [ ] Documentation reflects the actual supported API and activation semantics.
- [ ] Session notes and summary are written.

## Related Sessions
- [2026-02-14-showcase-app](../2026-02-14-showcase-app/PLAN.md)
- [2026-01-17-theme-system](../2026-01-17-theme-system/PLAN.md)
