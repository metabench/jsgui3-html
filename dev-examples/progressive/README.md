# Progressive Enhancement (Activation) Demo

This example demonstrates progressive enhancement tiers for native HTML controls. In other UI frameworks this step is often called "Hydration"; in jsgui3-html it is called **Activation**.

## Features

- Tier 0: plain native controls
- Tier 1: styled native controls using CSS tokens
- Tier 2: activated native controls with jsgui behavior
- Mixed forms with `.jsgui-form` activation and `.jsgui-no-enhance` opt-out
- SSR-friendly activation that reuses server-rendered markup

## Quick Start

```bash
# From repo root
node dev-examples/progressive/server.js
```

Then open `http://localhost:52008`.

## Code Example

```javascript
const { enable_auto_enhancement } = require('jsgui3-html/control_mixins/auto_enhance');

class Progressive_Enhancement_Demo extends Active_HTML_Document {
    activate() {
        if (!this.__active) {
            super.activate();
            enable_auto_enhancement(this.context);
        }
    }
}
```

## Architecture

- **Server render**: the server renders native HTML inputs.
- **Client activation**: `enable_auto_enhancement()` activates supported inputs based on CSS markers.
- **Swap registry**: the activation manager matches native elements to control classes.

## Activation Markers

- `.jsgui-enhance` enables activation for the element.
- `.jsgui-form` enables activation for supported inputs inside the form.
- `.jsgui-no-enhance` disables activation for an element or subtree.

## Extension Points

- Register additional swaps in `control_mixins/swap_registry.js`.
- Add new activation modes in `control_mixins/activation.js`.
- Extend styling tokens in `css/native-enhanced.css` or override with theme variables.
