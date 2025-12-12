# Regression Tests

This document describes the regression tests added to prevent reintroducing recently-fixed packaging and load-time issues.

## Requirements

- Node.js `>=18` (matches `package.json` `engines.node`)

## Running

From the repo root:

```bash
cd test
npm test
```

Or without changing directories:

```bash
npm --prefix test test
```

To run just the module-load regression coverage:

```bash
npm --prefix test run test:core -- --grep "Module Load Regression Tests"
```

## What’s Covered

### Module-load regressions

`test/core/module_load_regression.test.js` covers:

- `controls/controls.js` export wiring:
  - `Color_Grid` is not accidentally mapped to `Color_Palette`
- Correct export from `html-core/Data_Validation.js`
- `Tile_Slider` subcontrols receiving `context` correctly
- Viewer/editor modules being `require()`-able without broken relative paths
- `require('./html.js')` not invoking `console.trace()` during load (prevents noisy “Trace …” output at import time)

