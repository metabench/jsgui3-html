# Date_Picker Control (Native)

The `Date_Picker` control wraps a native `<input type="date">` and syncs data/view models for MVC or MVVM usage.

**Location:** `controls/organised/0-core/0-basic/0-native-compositional/date-picker.js`

## Usage

```javascript
const date_picker = new controls.Date_Picker({
    context,
    value: '2024-01-02',
    min: '2024-01-01',
    max: '2024-01-31',
    locale: 'en-GB',
    week_start: 1
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `string\|Date` | — | Initial value (`YYYY-MM-DD` or `Date`) |
| `min` | `string` | — | Minimum selectable date |
| `max` | `string` | — | Maximum selectable date |
| `locale` | `string` | — | Locale for formatting (sets `lang` attribute) |
| `week_start` | `number` | `0` | Week start index (0-6), stored as `data-week-start` |

## Methods

```javascript
date_picker.set_value('2024-01-05');
const value = date_picker.get_value();
const iso = date_picker.format_date(new Date(), { format: 'iso' });
const display = date_picker.format_date(new Date(), { format: 'locale' });
```

## Keyboard

- `ArrowUp` / `ArrowDown`: increment or decrement by one day.
- `PageUp` / `PageDown`: move by one month.
- `Home` / `End`: jump to min/max when set.

## Tests

- `test/core/date_picker.test.js`

---

# Complex Date Picker (Visual Calendar)

A custom visual date picker composed of `Year_Picker`, `Month_Picker`, `Month_View`, and a "Today" button.

**Location:** `controls/organised/0-core/0-basic/_complex_date-picker.js`
**Extends:** `Control`
**Uses:** `Left_Right_Arrows_Selector`, `Month_View`, `mx_date`

## Usage

```javascript
const Date_Picker = require('./controls/organised/0-core/0-basic/_complex_date-picker');

const dp = new Date_Picker({
    context,
    size: [360, 280]
});
```

## Architecture

```
Date_Picker
  ├── Year_Picker (Left_Right_Arrows_Selector, years: current ±10)
  ├── Month_Picker (Left_Right_Arrows_Selector, months: Jan–Dec, loops)
  ├── Month_View (calendar grid, single select)
  └── "Today" button (jumps to current date)
```

## Behaviour

- **Year navigation:** Left/right arrows cycle through years (current year ±10). Disabled at boundaries.
- **Month navigation:** Left/right arrows cycle through months. Loops into next/previous year automatically.
- **Month/year coupling:** Month picker looping triggers year change. Year boundary disables month arrows.
- **Day selection:** Clicking a day in the Month_View emits `'change'` with the selected date.
- **Today button:** Jumps year picker, month picker, and month view to today's date.

## Events

| Event | Payload | When |
|-------|---------|------|
| `'change'` | `{ name: 'day', value: cell }` | Day selected in month view |
| `'change'` | `{ name: 'year', value: year }` | Year changed |
| `'change'` | `{ name: 'month', value: month }` | Month changed |

## See Also

- [Month_View](./month_view.md) — the calendar grid control used internally
- Demo: `node lab/date_controls_demo_server.js` → http://localhost:3601

## Selection Mode Forwarding

To use the Complex Date Picker with range or multi selection, pass `selection_mode` in the Month_View spec:

```javascript
const dp = new Date_Picker({ context, size: [360, 280] });
// The internal Month_View defaults to 'single' mode.
// For range mode, construct the Month_View directly:
const Month_View = require('./controls/.../month-view');
const mv = new Month_View({ context, selection_mode: 'range' });
```

## Tests

- `test/core/date_picker.test.js` — native `<input type="date">` Date_Picker tests
- `test/core/complex-date-picker.test.js` — complex visual Date_Picker tests (17 tests)
