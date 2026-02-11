# Rating_Stars Control

An interactive star-rating input with optional half-star increments.

## Usage

```javascript
const stars = new Rating_Stars({
    context,
    max: 5,
    value: 3,
    half: true,
    readonly: false
});
```

## Public API

- `value` — Get/set the current rating (clamped to 0–max)
- `max` — Maximum number of stars (readonly after init)
- `readonly` — Whether the control is readonly
- `set_value(n)` / `get_value()` — Programmatic access
- `set_readonly(bool)` — Toggle readonly mode

## Events

- `'change'` `{ value }` — Fired when user clicks a star

## Notes

- Half-star mode snaps to nearest 0.5 on click
- Re-clicking the same value resets to 0 (toggle-off)
- Hover state previews the value before clicking
- CSS uses `★`/`☆` characters, styled with transitions

## Tests

- `test/controls/rating_stars.test.js` — 9 tests
