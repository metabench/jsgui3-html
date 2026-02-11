# Time_Picker

Time selection control with optional analog clock face, digital display, spinners, and presets.

## Usage

```js
const Time_Picker = require('controls/organised/0-core/0-basic/1-compositional/time-picker');

// Minimal — clock face + digital display, 24h
const tp = new Time_Picker({ context });

// Custom — 12h, with spinners and presets, no clock
const tp2 = new Time_Picker({
    context,
    value: '2:30 PM',
    use_24h: false,
    show_clock: false,
    show_spinners: true,
    show_presets: true,
    presets: ['Now', '09:00', '12:00', '17:00', '22:00'],
    step_minutes: 15,
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | string | `'12:00'` | Initial time (HH:MM or HH:MM:SS or h:MM AM/PM) |
| `show_clock` | bool | `true` | Analog clock face |
| `clock_size` | number | `200` | Clock diameter in px |
| `clock_style` | string | `'modern'` | `'modern'` \| `'classic'` \| `'minimal'` |
| `show_ticks` | bool | `true` | Tick marks on clock |
| `show_numbers` | bool | `true` | Hour numbers on clock |
| `show_second_hand` | bool | `false` | Second hand |
| `clock_bg` | string | — | Custom clock background color |
| `hand_color` | string | — | Custom hand color |
| `use_24h` | bool | `true` | 24-hour mode |
| `show_seconds` | bool | `false` | Show seconds in value |
| `show_spinners` | bool | `false` | Up/down number spinners |
| `show_presets` | bool | `false` | Quick-pick preset buttons |
| `presets` | array | `['Now','09:00','12:00','17:00']` | Preset time strings |
| `min_time` | string | — | Min time constraint (e.g. `'09:00'`) |
| `max_time` | string | — | Max time constraint (e.g. `'17:00'`) |
| `step_minutes` | number | `1` | Minute step (1, 5, 10, 15, 30) |

## Public API

| Property/Method | Returns | Description |
|----------------|---------|-------------|
| `.value` | string | Time in HH:MM or HH:MM:SS |
| `.display_value` | string | Formatted with AM/PM in 12h mode |
| `.hours` / `.minutes` / `.seconds` | number | Components |
| `.is_am` / `.is_pm` | bool | Period check |
| `.set_time(h, m [, s])` | — | Set time directly |
| `.set_value(str)` | — | Parse and set time string |
| `.toggle_am_pm()` | — | Flip AM↔PM |
| `.increment_hours(delta)` | — | Adjust hours (wraps 0–23) |
| `.increment_minutes(delta)` | — | Adjust minutes (auto-carries hours) |
| `.increment_seconds(delta)` | — | Adjust seconds |

## Events

- **`change`** `{ value, hours, minutes, seconds }` — fires on every value change

## Clock Face Styles

| Style | Background | Numbers | Ticks |
|-------|-----------|---------|-------|
| `modern` | Dark slate | White | Subtle gray |
| `classic` | White | Dark | Light gray |
| `minimal` | Dark | Bold | None |

## Tests

`test/controls/time_picker.test.js` — 13 tests
