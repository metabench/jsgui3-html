# Session Plan: Docs Viewer Grid Activation

**Date**: 2026-07-25
**Agent**: Codex
**Goal**: Determine whether an additive, JSON-safe Data Grid reattachment
contract can reduce the docs viewer's opening DOM cost without weakening SSR,
activation, accessibility, or stable APIs.

## Scope

### In Scope

- Reproduce `Data_Grid` and `Data_Table` state loss in a fresh client context.
- Research existing model-state, virtual-window, selection, and activation
  mechanisms before proposing framework code.
- Prototype only an opt-in, serializable state path with explicit bounds.
- Prove same-instance rendering, SSR reattachment, browser interaction, and
  compatibility before any docs-viewer adoption.
- Correct eager deprecated-alias warnings if a narrow compatible fix is
  independently provable.

### Out of Scope

- Breaking constructor or export changes.
- Serialization of functions, adapters, promises, or async data sources.
- Replacing the docs viewer's jsgui3 `Panel` and `Data_Grid`.
- Broad data-binding redesign.

## Risks

- Re-rendering during activation could duplicate or orphan controls.
- Embedded row data could expose non-public data or grow without bounds.
- Virtual rendering could make rows undiscoverable or misreport ARIA indices.
- Registry warning changes could weaken backward-compatible aliases.

## Success Criteria

- [x] A deterministic experiment records current behavior.
- [x] Any promoted state is explicit, JSON-safe, bounded, and opt-in.
- [x] SSR DOM is preserved through initial activation.
- [x] Filtering, sorting, paging/windowing, selection, and keyboard behavior
      pass in a fresh browser context without duplicate nodes or events.
- [x] Existing focused and full relevant suites remain green.
- [x] Findings and deferred risks are recorded before handoff.
