# Progressive Enhancement Guide (Activation)

This guide explains how to activate native HTML controls with jsgui3-html. Other UI frameworks often call this step "Hydration", but in this project we use **Activation** and **Activate** consistently.

## Overview

Progressive enhancement lets you start with accessible native HTML (Tier 0), add a styling layer (Tier 1), and then activate enhanced behavior (Tier 2) when JavaScript is available.

## Enhancement Tiers

| Tier | Description | JavaScript | CSS |
|------|-------------|------------|-----|
| T0 - Native | Plain HTML controls | None | Optional |
| T1 - Styled | Native HTML with theming | None | `native-enhanced.css` |
| T2 - Activated | Native HTML activated by jsgui | Activation required | `native-enhanced.css` |

## HTML Markup Patterns

```html
<!-- Tier 0: Native only -->
<input type="text" name="basic">

<!-- Tier 1: Styled native -->
<input type="text" name="styled" class="jsgui-input">

<!-- Tier 2: Activated -->
<input type="text" name="activated" class="jsgui-enhance">

<!-- Activate all inputs inside a form -->
<form class="jsgui-form">
    <input type="text" name="username" required>
    <input type="email" name="email">
    <select name="role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
    </select>
    <button type="submit">Submit</button>
</form>
```

## CSS Theming (Tier 1)

Include the base theme layer:

```html
<link rel="stylesheet" href="/css/native-enhanced.css">
```

Key CSS hooks:

- `.jsgui-input` / `.jsgui-select` / `.jsgui-button`
- `.jsgui-checkbox` / `.jsgui-radio`
- `.jsgui-form` (scopes native styling)

## Activation API (Tier 2)

### Automatic Activation

```javascript
const { enable_auto_enhancement } = require('jsgui3-html/control_mixins/auto_enhance');

const page_context = new jsgui.Page_Context();

// Activate native elements on page load
enable_auto_enhancement(page_context);
```

### Manual Activation

```javascript
const { Activation_Manager } = require('jsgui3-html/control_mixins/activation');

const page_context = new jsgui.Page_Context();
const activation_manager = new Activation_Manager(page_context);

// Activate elements within a specific container
activation_manager.activate(document.querySelector('.jsgui-form'));
```

## Activation Markers

- `.jsgui-enhance` enables activation for a native element.
- `.jsgui-no-enhance` disables activation for an element or subtree.
- `.jsgui-form` enables activation for supported inputs inside the form.
- `data-jsgui-mode="styled"` forces CSS-only styling without activation.

## Server-Side Rendering + Client Activation

1. Render native HTML on the server.
2. Load the activation script on the client.
3. Call `enable_auto_enhancement()` or `Activation_Manager.activate()` once the DOM is ready.

Activation is safe to run multiple times, and can be re-run on newly injected content.

## Notes

- Activation logic only runs in the browser.
- Controls must opt in via `.jsgui-enhance` or `.jsgui-form` markers.
- If you need a complete replacement (custom DOM structure), use a full control instead of activation.
