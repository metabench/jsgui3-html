# Date_Range_Picker Control

A composite date range selector with single/dual calendar views and optional time inputs.

## Usage

```javascript
const picker = new Date_Range_Picker({
    context,
    mode: 'dual-view',
    use_time: true,
    start: '2026-01-01',
    end: '2026-01-15',
    start_time: '09:00',
    end_time: '17:00'
});
```

## Public API

- `start_date` / `end_date` — Get/set the selected date range (YYYY-MM-DD)
- `start_time` / `end_time` — Get/set time values (HH:MM, when `use_time` is true)
- `mode` — `'single-view'` or `'dual-view'`
- `mv_start` / `mv_end` — Internal Month_View references

## Events

- `'range_change'` `{ start, end }` — Fired when range changes

## Notes

- Range initialization happens in `compose_date_range_picker()`, not `activate()`
- Supports `initial_start` / `initial_end` aliases for `start` / `end`
- Calendar views auto-sync range highlight on init

## Tests

- `test/controls/date_range_picker.test.js` — 5 tests
