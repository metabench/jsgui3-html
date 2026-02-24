# Showcase App (Theme Studio)

A polished dev showcase for jsgui controls with a built-in live theme editor.

## Features

- Multi-section control gallery (status, actions, layout, editor)
- Dedicated showcase navigation sidebar for section jumping
- Preset theme switching via `Admin_Theme` presets
- Live editing of core `--admin-*` variables
- Reset-to-preset flow for quick experimentation
- Theme state persistence (`localStorage`) with JSON export/import
- Responsive two-column shell with sticky Theme Studio

## Run

```bash
node dev-examples/binding/showcase_app/server.js
```

Open `http://localhost:52008`.

## Theme Studio Controls

- `Preset`: switches `data-admin-theme` preset
- `Accent color`: updates `--admin-accent`
- `Card background`: updates `--admin-card-bg`
- `Text color`: updates `--admin-text`
- `Radius`: updates `--admin-radius`
- `Font size`: updates `--admin-font-size`
- `Save local` / `Clear saved`: persist or clear `showcase_theme_state_v1`
- `Export JSON` / `Import JSON`: transfer a full theme preset+override payload

## Notes

- The app follows isomorphic composition (`compose_ui`) and client-side event wiring (`activate`).
- Showcase includes controls from layout, UI, feedback, and editor categories.
