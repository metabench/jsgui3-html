# Month_View Control

A calendar month grid displaying days in a 7-column layout (Mon–Sun). Supports single-day selection, date range selection (two-click, drag, Shift+click), and multi-select mode (Ctrl+click, Shift+click).

**Location:** `controls/organised/0-core/0-basic/1-compositional/month-view.js`
**Extends:** `Grid` → `Control`
**Mixin:** `mx_date` (provides `year`, `month`, `day` properties)

---

## Quick Start

```javascript
const Month_View = require('./controls/organised/0-core/0-basic/1-compositional/month-view');

// Basic single-select (default)
const mv = new Month_View({ context });

// Range selection with min/max bounds
const mv_range = new Month_View({
    context,
    selection_mode: 'range',
    min_date: '2026-02-05',
    max_date: '2026-02-25'
});

// Multi-select with week numbers and Sunday-first
const mv_multi = new Month_View({
    context,
    selection_mode: 'multi',
    show_week_numbers: true,
    first_day_of_week: 6   // 0=Mon(default), 6=Sun
});
```

---

## Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selection_mode` | `string` | `'single'` | `'single'`, `'range'`, `'multi'`, or `'week'` |
| `first_day_of_week` | `number` | `0` | 0=Monday, 1=Tuesday, …, 6=Sunday |
| `show_week_numbers` | `boolean` | `false` | Display ISO week numbers in a left gutter column |
| `min_date` | `string\|null` | `null` | Earliest selectable date (ISO `YYYY-MM-DD`) |
| `max_date` | `string\|null` | `null` | Latest selectable date (ISO `YYYY-MM-DD`) |
| `size` | `[w,h]` | `[360,200]` | Pixel dimensions. Automatically `[400,200]` when week numbers enabled |
| `month` | `number` | current | 0-indexed month (0=January) |
| `year` | `number` | current | Four-digit year |
| `day` | `number` | `1` | Day of month (for initial highlight in single mode) |

---

## Selection Modes

### `'single'` (default)
Click a day cell to select it. The control raises `'change'` with `{ name: 'selected', value: true }`.

### `'range'`
Two-click date range selection with three interaction styles:

1. **Two-click:** First click sets start date, second sets end. Auto-swaps if end < start.
2. **Drag-to-select:** Mousedown on start, drag across cells, mouseup on end.
3. **Shift+click:** Extends range from anchor (last explicit start) to clicked date.

Raises:
- `'range-start-pick'` — `{ date: 'YYYY-MM-DD' }` on first click
- `'range-change'` — `{ start, end }` when range is committed (second click or drag end)
- `'date-hover'` — `{ date }` on mousemove over cells

### `'multi'`
Toggle individual dates or select contiguous ranges:

- **Plain click:** Clears all, selects only the clicked date
- **Ctrl+click** (or Cmd+click): Toggle a single date on/off
- **Shift+click:** Select all dates between anchor and clicked date

Raises `'selection-change'` — `{ dates: ['YYYY-MM-DD', ...] }` (sorted array).

### `'week'`
Click any day to select the entire Mon–Sun week containing it. Automatically determines the ISO week boundaries.

```javascript
const mv_week = new Month_View({
    context,
    selection_mode: 'week',
    show_week_numbers: true  // recommended for visual clarity
});
mv_week.on('week-select', e => {
    console.log(e.week_number, e.start, e.end, e.dates);
});
```

Raises `'week-select'` — `{ week_number, start, end, dates }` where:
- `week_number` — ISO 8601 week number (1–53)
- `start` — Monday ISO date of the selected week
- `end` — Sunday ISO date of the selected week
- `dates` — sorted array of selected ISO dates (only those visible in the current month)

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `range_start` | `string\|null` | Start of selected range (ISO) |
| `range_end` | `string\|null` | End of selected range (ISO) |
| `selected_dates` | `string[]` | Array of selected dates in multi mode (sorted ISO strings) |
| `min_date` | `string\|null` | Get/set minimum selectable date |
| `max_date` | `string\|null` | Get/set maximum selectable date |
| `year` | `number` | Current year (from `mx_date` mixin) |
| `month` | `number` | Current month 0-indexed (from `mx_date` mixin) |
| `day` | `number` | Current day of month (from `mx_date` mixin) |

---

## Methods

### `set_range(start, end)`
Programmatically set the date range. Accepts ISO strings. Auto-swaps if `start > end`. Triggers `update_range_highlight()` and raises `'range-change'`.

### `clear_range()`
Clears all selection state: range start/end, anchor, click state, and multi-select set. Resets visual highlighting.

### `refresh_month_view()`
Re-renders all cells for the current `year`/`month`. Call after changing `year` or `month` properties.

### `update_range_highlight()`
Reapplies CSS classes based on current range/multi state. Normally called automatically.

---

## Visual Features

### Today Indicator
Today's date gets the `.today` CSS class — bold text with an inset blue ring (`box-shadow: inset 0 0 0 2px`). Applied automatically.

### Weekend Styling
Saturday and Sunday columns get the `.weekend` class — muted text colour. Adjusts automatically when `first_day_of_week` changes.

### Min/Max Bounds
Dates outside `[min_date, max_date]` get:
- `.out-of-bounds` class (opacity 0.4, strikethrough text, `cursor: not-allowed`)
- `selectable = false` — click events are blocked

### Week Numbers
When `show_week_numbers: true`, an 8th column appears at the left showing ISO 8601 week numbers (W1–W53). Styled with `.week-number` class.

---

## CSS Theming

All colours use CSS custom properties. Override them on the `.month-view` element:

```css
.month-view {
    --mv-bg: #fff;                /* control background */
    --mv-cell-bg: inherit;        /* normal cell background */
    --mv-cell-disabled: #ddd;     /* disabled cell bg */
    --mv-text: #1e293b;           /* body text */
    --mv-header-text: #64748b;    /* day header text */
    --mv-accent: #2563eb;         /* selected/range endpoints */
    --mv-accent-light: #dbeafe;   /* range-between fill */
    --mv-accent-mid: #93c5fd;     /* hover preview */
    --mv-today-ring: #2563eb;     /* today indicator ring */
    --mv-weekend-text: #94a3b8;   /* weekend text colour */
}
```

### CSS Classes Applied to Cells

| Class | When |
|-------|------|
| `.today` | Current date |
| `.weekend` | Saturday or Sunday columns |
| `.out-of-bounds` | Outside min/max range |
| `.week-number` | Week number gutter cells |
| `.range-start` | Start of selected range |
| `.range-end` | End of selected range |
| `.range-between` | Dates between start and end |
| `.range-hover` | Hover preview during two-click or drag selection |
| `.multi-selected` | Individually selected dates in multi mode |

---

## Tiled (Sliding) Month View

```javascript
const Tiled_Month = Month_View.Tiled;
const tiled = new Tiled_Month({ context });
```

`Month_View.Tiled` wraps Month_View with `Tile_Slider`, enabling sliding transition animations when navigating between months.

---

## Demo Server

```bash
node lab/date_controls_demo_server.js
# → http://localhost:3601
```

Shows 7 sections: single select, range select, multi select, complex date picker (with "Today" button), week numbers, Sunday-first layout, and min/max bounds.

---

## Tests

- `test/core/month-view.test.js` — 47 unit tests covering constructor, day headers, weekends, date mapping, bounds, range, multi, week mode, week numbers, refresh, CSS
