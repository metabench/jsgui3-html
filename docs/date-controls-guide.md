# Date & Time Controls Guide

Practical guide to the jsgui3-html date/time control suite. Last verified 2026-07-02 against a live jsgui3-server app (SSR + esbuild bundle + client activation).

## The controls at a glance

| Control | Registry key | Use when |
|---|---|---|
| `Date_Picker` | `controls.Date_Picker` | You want the native `<input type="date">` with model binding and keyboard support |
| `Month_View` | `controls.Month_View` | You need a month grid: single/range/multi/week selection — the core primitive everything else composes |
| `Time_Picker` | `controls.Time_Picker` | Time of day: analog clock, spinners, presets, 12/24h |
| `DateTime_Picker` | `controls.Datetime_Picker` | Date + time together; stacked / side-by-side / tabbed layouts |
| `Date_Range_Picker` | `controls.Date_Range_Picker` | Start/end range with a popup of one or two calendars, optional time inputs |
| `Date_Value_Editor` | value-editor registry type `date` | Inline date editing inside property grids / form editors |
| `Calendar` | `controls.Calendar` | Month grid **plus events**: per-day colored badges and a selected-day event list |
| `Popup` | `controls.Popup` | Not date-specific: the anchored overlay primitive the pickers use |
| ~~`Timespan_Selector`~~ | — | **Deprecated.** Use `Date_Range_Picker` |

All date values are ISO strings (`YYYY-MM-DD`); datetimes are `YYYY-MM-DDTHH:MM[:SS]`; times are `HH:MM[:SS]`.

## Quick start

```javascript
const jsgui = require('jsgui3-html');
const { controls } = jsgui;
const { Month_View, Datetime_Picker, Date_Range_Picker, Calendar } = controls;

// Month grid with range selection, French headers, bounded dates
const mv = new Month_View({
    context,
    selection_mode: 'range',      // 'single' | 'range' | 'multi' | 'week'
    year: 2026, month: 6,         // July 2026 (month is 0-based)
    locale: 'fr',                 // Intl day headers: lun. mar. mer. ...
    first_day_of_week: 6,         // 6 = Sunday-first (default 0 = Monday)
    show_week_numbers: true,      // ISO week gutter
    min_date: '2026-07-05',
    max_date: '2026-07-25'
});
mv.on('range-change', e => console.log(e.start, e.end));

// Date + time, tabbed
const dtp = new Datetime_Picker({
    context, layout: 'tabbed', value: '2026-07-02T14:30'
});
dtp.on('change', e => console.log(e.value)); // '2026-07-02T14:30'

// Range picker with dual-calendar popup
const drp = new Date_Range_Picker({
    context, mode: 'dual', start: '2026-07-06', end: '2026-07-17'
});
drp.on('change', e => console.log(e.start, e.end));

// Event calendar
const cal = new Calendar({
    context, year: 2026, month: 6,
    events: [
        { date: '2026-07-06', label: 'Standup', color: '#16a34a' },
        { date: '2026-07-17', label: 'Release' }   // default blue
    ]
});
cal.on('date-select', e => console.log(e.iso, e.events));
cal.add_event({ date: '2026-07-20', label: 'Demo' });
```

Serve any of these with the standard pattern (see `jsgui3-server` docs): `new Server({ Ctrl, src_path_client_js })`, wait for `'ready'`, `server.start(port)`. CSS is extracted automatically from each control's static `.css`.

## Events reference

| Control | Event | Payload |
|---|---|---|
| Month_View | `date-select` (single mode) | `{iso, date}` |
| | `range-change` | `{start, end}` |
| | `range-start-pick` | `{date}` (first click of a range) |
| | `selection-change` (multi) | `{dates: [...]}` |
| | `week-select` | `{week_number, start, end, dates}` |
| | `focus-date` (keyboard) | `{date}` |
| Time_Picker | `change` | `{value, hours, minutes, seconds}` |
| DateTime_Picker | `change` | `{value, date, time, hours, minutes}` |
| Date_Range_Picker | `change` | `{start, end}` |
| | `time-change` | `{start, end}` (HH:MM) |
| Calendar | `date-select` | `{iso, events}` |
| | `events-change` | `{events}` |
| Popup | `open` / `close` | `{anchor_el}` / `{}` |

## Keyboard support

Roots are focusable (`tabindex="0"`).

**Month_View** — Arrow keys move a focus ring by ±1 day / ±7 days (clamped to the displayed month and min/max bounds); `Home`/`End` jump to the first/last selectable day; `Enter`/`Space` acts like a mouse press in the current selection mode; `Escape` cancels a half-picked range and clears the ring. The focused cell gets the `.kb-focus` class.

**Time_Picker** — `ArrowUp`/`ArrowDown` ± step minutes; `ArrowLeft`/`ArrowRight` ± 1 hour; `PageUp`/`PageDown` ± 15 minutes; `a`/`p` switch AM/PM (12h mode).

**Date_Picker** (native wrapper) — Arrow ±1 day, Page ±1 month, Home/End to min/max.

**Popup** — `Escape` closes; outside click closes (both configurable).

## Localization

Pass `locale` (any BCP 47 tag) to `Month_View` or `Calendar`:

- Day headers render via `Intl.DateTimeFormat` (`lun.`, `Mo.`, `lun`, …), rotated by `first_day_of_week`.
- `mv.month_name()` returns the localized month name (used in Calendar's caption and Month_View's `aria-label`).
- Invalid locales and Intl-less environments fall back to English.
- Composites can reuse the helpers: `Month_View.get_locale_day_names(locale)`, `Month_View.get_locale_month_names(locale)`.

## Accessibility

- **Month_View**: `role="grid"` with a localized `aria-label` ("July 2026"), `role="row"`, `role="columnheader"` (day names), `role="gridcell"` (days); selected/in-range cells carry `aria-selected="true"` — kept in sync on every highlight update, server- and client-side.
- **Time_Picker**: `role="group"` labelled with the current time; the digital display is `aria-live="polite"`; the clock canvas is `role="img"` ("Analog clock showing 14:30"); spinner buttons are labelled ("Increase hours"); spinner values are `role="spinbutton"` with `aria-valuemin/max`.
- **DateTime_Picker** (tabbed): `role="tablist"` / `role="tab"` with `aria-selected` toggling.
- **Date_Range_Picker**: labelled inputs with `aria-haspopup="dialog"`.
- **Popup**: `role="dialog" aria-modal="false"`; pass `aria_label` in the spec.

## Theming

Month_View exposes CSS custom properties (`--mv-text`, `--mv-accent`, `--mv-accent-light`, `--mv-cell-disabled`, `--mv-today-ring`, `--mv-weekend-text`, …) with a dark set under `.jsgui-dark-mode` / `[data-theme="dark"]`. Dark-panel hosts can retheme an embedded Month_View by overriding the variables — see the `.datetime-picker .month-view` block in `Datetime_Picker.js` for the reference implementation (this is how the picker keeps day numbers legible on its dark panel). Disabled/filler cells use `var(--mv-cell-disabled)` (not a hard-coded color), so they follow the host theme.

## The isomorphic contract (required reading for new composites)

jsgui3 controls render on the server and **reattach** on the client: the client constructor receives `{el, context}` only — *no other spec options* — and composed child references do not exist. A composite is only activation-safe if it does ALL of the following:

1. **Conditional compose** — `if (!spec.el) { this.compose_x(); }`. Unconditional compose creates detached VDOM children client-side whose `dom.el` is null; every wiring guard then fails *silently* (this is exactly how Date_Range_Picker shipped broken).
2. **Tag child refs** — `child.dom.attributes['data-jsgui-ctrl'] = 'propName'` at compose; call `this._wire_jsgui_ctrls()` at the top of `activate()` to restore `this.propName`.
3. **Persist behavior-affecting config** — write spec options that gate wiring to `data-*` attributes at construct/compose time, and read them back in `activate()` before using them. Examples in tree: `data-selection-mode`, `data-month`/`data-year`, `data-layout`, `data-mode`/`data-start`/`data-end`, `data-events`, `data-position`, `data-locale`.
4. **Guard activation** — `if (!this.__active) { super.activate(); ... }`.
5. **JSON in attributes must be URI-encoded** (`encodeURIComponent(JSON.stringify(v))`) — the renderer does not HTML-escape attribute values, so raw quotes corrupt the markup. See `Calendar._sync_events_attr`.
6. **Don't rely on the selectable mixin surviving reattachment** — wire DOM listeners explicitly in `activate()` (see Month_View's per-mode `addEventListener` blocks and `_select_single`).

**Testing the contract:** plain unit tests construct and activate the *same instance* and will not catch violations. Use the SSR→reattach harness in `test/core/ssr_reattach.test.js`: render in one `Page_Context`, mount the HTML into a fresh DOM, build a new context with the lowercased registry as `map_Controls`, then run `jsgui.pre_activate(ctx)` + `jsgui.activate(ctx)` and assert against the reconstructed instances. Every new composite should add a case there.

## Demos

- `lab/date_controls_demo_server.js` (port 3601) and `lab/date_range_demo_server.js` (port 3602) — static SSR only (no client bundle): good for markup/CSS review, **not** interactivity.
- For a fully interactive reference (activation, keyboard, popups, events), serve the controls through jsgui3-server — see `jsgui3-simple-example` or the patterns in this guide's Quick start.
