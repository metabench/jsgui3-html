# Date_Picker Control

The `Date_Picker` control wraps a native `<input type="date">` and syncs data/view models for MVC or MVVM usage.

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

- `value`: initial value (`YYYY-MM-DD` or `Date`).
- `min` / `max`: minimum and maximum values.
- `locale`: locale for formatting helpers (also sets `lang` attribute).
- `week_start`: week start index (0-6), stored as `data-week-start`.

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
