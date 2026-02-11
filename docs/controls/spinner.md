# Spinner Control

A CSS-animated loading indicator with size presets and optional label.

## Usage

```javascript
const spinner = new Spinner({
    context,
    size: 'lg',
    color: '#3b82f6',
    label: 'Loading...'
});
```

## Public API

- `spinner_size` — Size preset: `'sm'` (16px), `'md'` (32px), `'lg'` (48px)
- `label` — Label text (readonly)
- `visible` — Current visibility state
- `show()` / `hide()` / `toggle()` — Visibility control
- `set_label(text)` — Update label text

## Notes

- Uses CSS `@keyframes jsgui-spin` for animation
- `spinner_size` is used instead of `size` to avoid collision with `Control.size`
- Custom color applies to the spinning ring's top border

## Tests

- `test/controls/spinner.test.js` — 7 tests
