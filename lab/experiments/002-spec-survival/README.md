# 002 — spec survival across SSR reattachment

> **Date:** 2026-08-01
> **Versions:** jsgui3-html 0.0.189 (`acd3032`)
> **Evidence grade:** measured — runs, asserts, and fails if the contract changes
> **Status:** current

## What it shows

The client rebuilds every control from a spec of exactly four fields:

```js
// html-core/html-core.js:141-146
const ctrl_spec = {
    'context': context,
    '__type_name': type,
    'id': jsgui_id,
    'el': el
}
```

That is the whole reattachment contract. A control whose constructor reads any *other* spec
field gets `undefined` for it on the client, silently. Nothing warns, and the markup usually
still looks right — because the markup was rendered on the server, where the fields were
present.

Run it:

```bash
node lab/experiments/002-spec-survival/check.js
```

Output:

```
--- server ---
  spec.greeting seen   : "Hello from the server"
  spec.mode seen       : "expanded"
--- client (reattached) ---
  spec.greeting seen   : undefined
  spec.mode seen       : undefined
  markup still shows it: true
```

## Why it matters

This is not a niche case. As of 2026-08-01 there are **129 `if (spec.X)` branches across 57
files** under `controls/` that sit outside any `!spec.el` guard, and 1,738 non-core `spec.*`
reads across 174 files. The dominant idiom is to read spec unconditionally and guard only
composition:

```js
// Data_Table.js — ~29 unguarded spec reads above this line
if (!spec.el) { this.compose(); }
```

So on the client those reads evaluate to `undefined` and their branches never fire. For
example `Data_Table.js:272`'s `if (spec.data_source)` means the async data-source mixin is
never applied after reattachment.

## The escape hatch

Four controls rebuild their own spec from the DOM before using it, and are therefore immune:
`Data_Table`, `Date_Picker`, `Text_Input`, `Textarea`. The pattern:

```js
// Data_Table.js:149-153
const restored_state = read_tabular_state(spec.el);
if (restored_state) {
    spec = Object.assign({}, restored_state, spec, { persist_activation_state: true });
}
```

Anything a control needs on the client must be written into the markup as a `data-*` attribute
at compose time and read back from `spec.el` at reattach time. See `persist_activation_state`
for the fully worked version of this, and `lab/experiments/001-data-grid-reattach/` for the
contract it protects.

## Related

- `jsgui3-ecosystem/docs/reviews/README.md` — index of reviews and corrections
- `jsgui3-ecosystem/docs/reviews/2026-07-02-jsgui3-ecosystem-audit.md` — the audit that first
  raised this, with corrections
