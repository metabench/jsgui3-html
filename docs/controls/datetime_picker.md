# Datetime_Picker

Composite control combining Month_View (date selection) + Time_Picker (time selection) in one unified control.

## Usage

```js
const { controls } = require('jsgui3-html');
const { Datetime_Picker } = controls;

// Or by direct path — note the exact casing, which is load-bearing:
// require('jsgui3-html/controls/organised/0-core/0-basic/1-compositional/Datetime_Picker')

// Minimal — calendar + clock, stacked
const dtp = new Datetime_Picker({ context });

// Custom — specific datetime, side-by-side layout
const dtp2 = new Datetime_Picker({
    context,
    value: '2026-02-11T14:30',
    layout: 'side-by-side',
    use_24h: false,
    show_spinners: true,
    clock_size: 140,
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | string | now | ISO datetime `YYYY-MM-DDTHH:MM` |
| `layout` | string | `'stacked'` | `'stacked'` \| `'side-by-side'` \| `'tabbed'` |
| `show_month_view` | bool | `true` | Show calendar |
| `show_clock` | bool | `true` | Show analog clock |
| `use_24h` | bool | `true` | 24-hour time |
| `show_seconds` | bool | `false` | Show seconds |
| `clock_size` | number | `160` | Clock diameter |
| `clock_style` | string | `'modern'` | Clock visual style |
| `show_spinners` | bool | `false` | Time spinners |
| `step_minutes` | number | `1` | Minute step |
| `min_date` / `max_date` | string | — | Date constraints |

## Public API

| Property/Method | Returns | Description |
|----------------|---------|-------------|
| `.value` | string | ISO datetime `YYYY-MM-DDTHH:MM` |
| `.date` | Date | Date object (date part only) |
| `.datetime` | Date | Full Date with hours/minutes set |
| `.time` | string | Time string HH:MM |
| `.hours` / `.minutes` | number | Time components |
| `.set_date(y, m, d)` | — | Set date (month 0-based) |
| `.set_time(h, m)` | — | Set time |
| `.set_value(iso)` | — | Parse and set ISO datetime |

## Events

- **`change`** `{ value, date, time, hours, minutes }` — fires on date or time change

## Layout Modes

- **`stacked`** — Calendar above, time picker below (default)
- **`side-by-side`** — Calendar left, time picker right
- **`tabbed`** — Tab bar switches between 📅 Date and 🕐 Time views

## Tests

`test/controls/datetime_picker.test.js` — 10 tests
