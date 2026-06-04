# Patterns

Reusable implementation patterns and best practices discovered while working on `jsgui3-html`.

---

## Declarative SSR Metadata Pattern (2026-03-05)

**Problem**: A `tpl` directive works during constructor-time composition but silently degrades after server render when the client only sees static HTML.

**Pattern**:
1. Serialize a compact `data-jsgui-*` attribute during SSR.
2. Restore any serializable model state from the root control.
3. Reattach the directive from DOM metadata during activation.
4. If a directive depends on runtime-only data such as a template function, register that metadata during constructor replay before activation runs.

**Applied To**:
- `bind-style`
- `bind-visible`
- `bind-list`
- `on-*` instance-method handlers

**Why it helps**:
- Keeps SSR and activation behavior aligned.
- Prevents docs from over-promising constructor-only behavior.
- Produces a clear test boundary: SSR metadata plus activation reattachment.
