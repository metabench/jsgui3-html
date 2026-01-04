# `lang-tools` compatibility patches (in `jsgui3-html`)

This repo currently carries a small “compat layer” that patches selected `lang-tools` behaviors at runtime when the installed `lang-tools` version does not meet the expectations of `jsgui3-html`.

The patches live in `html-core/lang_tools_compat.js` and are applied automatically during module load via `html-core/html-core.js`.

## Where the patches are applied

- Entry point: `html-core/html-core.js` calls `patch_lang_tools()` from `html-core/lang_tools_compat.js`.
- `html-core/lang_tools_compat.js` also calls `apply_patches_if_needed()` at module load, so requiring it directly also applies patches.

## Why this exists

The `jsgui3-html` codebase has long-standing expectations about:

- `Data_Object`/`Data_Value` ergonomics and event payloads
- “direct property” access (`obj.some_prop = 123`) mapping through `obj.set('some_prop', 123)`
- `Collection` storing data model items, raising `change` events, and maintaining indexes

Some `lang-tools` versions change these behaviors (or introduce regressions), which breaks controls, MVVM bindings, and rendering.

This file documents:

1. What each patch does and what bug/regression it addresses.
2. How the detection works (so the patch only applies when needed).
3. Concrete proposals for fixing these behaviors upstream in `lang-tools`.

---

## Patch: `Collection.push/add` accepts `tof(...) === 'data_model'`

### Symptom

Under `lang-tools@0.0.43`, adding `Data_Object` / `Data_Model` items into a `Collection` can silently fail.

Minimal repro (with upstream `lang-tools` behavior):

```js
const { Collection, Data_Object, tof } = require('lang-tools');

const col = new Collection({});
const item = new Data_Object({});
console.log(tof(item));          // 'data_model' (in 0.0.43)

col.add(item);
console.log(col.length());       // 0  (unexpected)
```

### Root cause

In `lang-tools@0.0.43`, `Collection.push` handles:

- `'object'`, `'function'`
- `'data_value'`
- `'collection'`
- `'data_object'` and `'control'`
- primitives (string/number/boolean/null/undefined) via wrapping in `Data_Value`

But it does not handle `'data_model'`.

At the same time, `tof(new Data_Object(...))` returns `'data_model'` in this version, so `Collection.push` falls through without appending to `_arr`. If an index function is configured, the upstream implementation may still call `index.put(idx_key, pos)` with `pos` unset, which can corrupt the index.

Upstream reference for the behavior in this workspace (vendor file, do not edit): `node_modules/lang-tools/Data_Model/new/Collection.js`.

### Patch behavior in this repo

Implemented in `html-core/lang_tools_compat.js` as `patch_collection_data_model_push()`:

- Wraps `Collection.prototype.push`.
- If `tof(value) === 'data_model'`:
  - Appends to `this._arr` and increments `this._arr_idx`.
  - Raises the same `change` event shape used by upstream for insertions:
    - `{ target, item, value, position, name: 'insert' }`
  - Updates the index (`this.index.put(idx_key, pos)`) when `fn_index` is present.
  - Returns the value.
- Otherwise delegates to the original upstream `push`.

Important detail: upstream assigns `p.add = p.push` once at module load time. After wrapping `push`, this repo also rebinds:

```js
Collection.prototype.add = Collection.prototype.push;
```

Without this, `Collection.add(...)` would still point at the original unpatched `push`.

### How we detect the need for this patch

In `detect_needs_patch()` (`html-core/lang_tools_compat.js`), requirement 8:

- Creates a `Collection`, calls `col.add(new Data_Object({}))`, then checks `col.length()`.
- If `length() === 0`, it flags `needs_collection_data_model_patch`.

### Impact on `jsgui3-html`

This patch matters because many MVVM patterns rely on `Collection` to:

- Actually store model items.
- Raise insertion events so views can update.
- Maintain `fn_index`-backed indexes.

Without it, data-bound controls can appear “empty” or fail to update even though items were added.

---

## Patch: `Data_Object.set` null safety + correct change events (heavy patch)

### Symptom(s) addressed

In some `lang-tools` versions:

- `Data_Object.set('x', null, true)` can throw or store an unexpected shape.
- `Data_Object.set(...)` can call `.value()` on `Data_Value`/`Data_Object` in ways that throw.
- The `change` event payload can be missing `old`, and/or include wrapped `Data_Value` objects instead of plain values.

### Patch behavior

Implemented in `patch_data_object_set()`:

- Intercepts `Base_Data_Object.prototype.set`.
- When called as `set(prop_name, value, silent?)`:
  - Normalizes `silent` to a boolean.
  - Captures `old_val` as an *unwrapped* value (so `Data_Value` becomes its `.value`).
  - If setting `null` for a property that did not exist, wraps `null` in `new Data_Value({ value: null })` (compat with older internal expectations).
  - Calls upstream `set` with `silent=true` to avoid upstream’s buggy event/unwrap behavior.
  - Ensures the stored `Data_Value` receives `context` if the parent object has one.
  - Ensures a direct property accessor exists for `prop_name` (see “Accessor patch” below).
  - If not silent, raises a synthetic `change` event with payload:
    - `{ name: prop_name, old: old_val, value: new_val }`
    - where `new_val` is also unwrapped.

### Detection

`detect_needs_patch()` checks multiple behaviors (requirements 2–4). If any fail, it flags `needs_heavy_set_patch` and applies this heavy patch.

---

## Patch: `Data_Object.set` accessor-only fix (light patch)

### Symptom(s) addressed

Some versions store correctly and don’t need the heavy rewrite, but still don’t provide reactive direct property assignment.

Expectation in this repo:

```js
obj.set('x', 1, true);
obj.x = 2;              // should call obj.set('x', 2)
obj.get('x') === 2;
```

### Patch behavior

Implemented in `patch_data_object_set_light()`:

- Wraps `Base_Data_Object.prototype.set` but only to call `ensure_property_access(this, prop_name)` after setting.
- Leaves upstream behavior otherwise intact.

### Detection

`detect_needs_patch()` requirement 5:

- Sets a value, checks if a getter/setter descriptor exists on the instance.
- If missing (or direct assignment fails to update `.get(...)`), it flags `needs_accessors_patch`.

---

## Patch: `Data_Value._id()` does not throw without context

### Symptom

Some code paths create `Data_Value` instances without an attached `context`. In some versions, calling `_id()` can hard-throw when context is missing.

### Patch behavior

Implemented in `patch_data_value_id()`:

- Wraps `Data_Value.prototype._id`.
- If `this.__id` exists, returns it.
- If `this.context` exists, delegates to upstream.
- Otherwise returns `undefined` instead of throwing.

### Detection

`detect_needs_patch()` requirement 6:

- Calls `new Data_Value({ value: 1 })._id()` and flags `needs_data_value_id_patch` if it throws.

---

## Patch: `Data_Object.set_fields_from_spec` compatibility shim

### Symptom

Some `lang-tools` versions deprecate or alter `set_fields_from_spec` so that constructing `new Data_Object(spec, fields)` can throw (sometimes with `console.trace()` spam).

### Patch behavior

Implemented in `patch_set_fields_from_spec()`:

- Replaces `Base_Data_Object.prototype.set_fields_from_spec` with a tolerant implementation that:
  - Normalizes `fields` from either an array or object form into `[name, type, default?]` tuples.
  - Determines `value_to_set` from either `spec[field_name]` or the tuple default.
  - Calls `this.set(field_name, value_to_set, true)` when available (fallback to direct assignment).
  - Ensures a direct property accessor exists for each field.

### Detection

`detect_needs_patch()` requirement 7:

- Attempts `new Base_Data_Object({}, [['__compat_test', String]])` with console trace suppressed.
- If it throws, flags `needs_set_fields_patch`.

---

## Patch: `Data_Object` constructor spec activation (Data_Object_Compat)

### Symptom

In some versions, `new Data_Object({ a: 1 })` does not populate the internal backing store used by `.get('a')`, and/or does not set up accessors.

That breaks patterns throughout this repo where `spec` is treated as initial model state.

### Patch behavior

When needed, `lang_tools.Data_Object` is replaced with `Data_Object_Compat`:

- Calls `super(spec, fields)`.
- Iterates keys in `spec` and calls `this.set(key, v, true)` to ensure internal storage is initialized.
- Skips reserved keys (`context`, ids, type fields, etc.) and any keys starting with `__`.
- Ensures accessors exist for each activated key.

### Detection

`detect_needs_patch()` requirement 1:

- Creates `new Base_Data_Object({ a: 1 })`.
- Checks `inst.get('a')` returns `1` (unwrapping `Data_Value` if needed).
- If not, flags `needs_data_object_compat`.

---

## Upstream proposals (for `lang-tools`)

These are intended as concrete, actionable changes you can hand to an agent working in the `lang-tools` repo.

### 1) Fix `Collection.push` to support `tv === 'data_model'`

Change `Data_Model/new/Collection.js` so that `'data_model'` is treated equivalently to `'data_object'` (and likely `'control'`):

- Append to `_arr`, increment `_arr_idx`.
- Raise the standard `'change'` insert event when not silent.
- Maintain `fn_index` / `index.put`.
- Ensure `pos` is set so index updates are correct.

Add a regression test that:

- Verifies `col.add(new Data_Object({}))` increments `col.length()` and raises insert events.
- Verifies index position correctness when `fn_index` is provided.

### 2) Make `add` a real method, not a one-time alias assignment

Replace `p.add = p.push` with:

```js
add(value) { return this.push(value); }
```

Reason: alias assignment copies the function reference once; later monkey-patching/overriding `push` (or subclassing) won’t affect `add`.

Add a regression test that:

- Temporarily wraps `push` and confirms `add` uses the wrapped implementation.

### 3) Decide and document the `tof()` taxonomy for `Data_Object` / `Data_Model`

Right now, a `Data_Object` being reported as `tof(...) === 'data_model'` causes compatibility issues in code that expects `'data_object'`.

Two viable fixes (pick one, then codify it):

- **Option A:** Make `tof(Data_Object)` return `'data_object'` again (preserve legacy expectations).
- **Option B:** Keep `'data_model'`, but update all data-structure APIs (`Collection`, etc.) to accept `'data_model'` everywhere `'data_object'` is accepted.

Whichever is chosen, add tests that lock the behavior.

### 4) Normalize `Data_Object.set` events and value unwrapping

Ensure upstream `Data_Object.set(name, value, silent?)` reliably:

- Accepts `null` values safely.
- Does not call `.value()` in ways that throw for `Data_Value` objects.
- Emits `change` events that include `{ name, old, value }` using *plain* values (not wrapped `Data_Value` objects).

Add regression tests for:

- Setting `null` with and without an existing value.
- Setting a `Data_Value` then overwriting it.
- `change` payload containing unwrapped `old` and `value`.

### 5) Clarify / harden `Data_Value._id` behavior without context

If `_id()` requires `context`, upstream should either:

- Return `undefined` without context (most compatible), or
- Create a deterministic local-only id, or
- Throw a typed error with a clear message (least compatible with existing usage).

Add a regression test for the chosen behavior.

### 6) Replace “throw strings” and `console.trace()` debug paths

Several `lang-tools` paths still:

- `throw 'some string'`
- `console.trace()` then throw

Proposal:

- Replace with `throw new Error('...')` (and include enough context in the message).
- Avoid tracing by default; consider a debug flag.

This makes integration failures easier to catch and less noisy in downstream consumers.

---

## Removing this compat layer

Once upstream `lang-tools` provides the behaviors above (and tests lock them in), this repo can remove the corresponding patches from `html-core/lang_tools_compat.js` and simplify `html-core/html-core.js` initialization.

