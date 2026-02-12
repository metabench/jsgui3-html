# Chapter 13: Completing Existing Controls — Core & Form

> Many controls in jsgui3-html exist but are skeletal.  
> This chapter is a control-by-control gap analysis with exact specifications  
> for bringing each one to a production-complete state.

---

## 13.1 Completeness Criteria

A control is "complete" when it meets ALL of these:

| Criterion | Description |
|-----------|-------------|
| **Visual** | Uses theme tokens, has 5 interaction states (rest/hover/active/focus/disabled) |
| **Functional** | All expected features for its control type are implemented |
| **Accessible** | ARIA roles, keyboard navigation, screen-reader announcements |
| **Themed** | Calls `themeable()`, responds to `[data-theme="dark"]` |
| **Documented** | JSDoc, spec examples, inline comments |
| **Tested** | Works in light + dark mode, responsive, no console errors |

---

## 13.2 Search_Bar — Currently Skeletal

**File:** `controls/organised/1-standard/5-ui/search-bar.js` (131 lines)  
**Status:** ⚠️ Minimal shell — renders a Text_Input + Button, basic value binding, no real search features.

### What Exists
- Composes a `Text_Input` and `Button` via `parse_mount`
- Has a `value` field that syncs with input changes
- Has a `view_model_spec` with a `search` action

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Clear button** | P0 | An × icon inside the input to clear text |
| **Search icon** | P0 | A magnifying glass icon either in the input or as the button icon |
| **Debounced input** | P0 | Fire search events after a configurable delay (default 300ms), not on every keystroke |
| **Loading state** | P1 | Spinner in the input while search is running |
| **Autocomplete dropdown** | P1 | Show suggestions below the input as user types |
| **Recent searches** | P2 | Remember and display recent search terms |
| **Keyboard shortcuts** | P1 | Escape to clear, Enter to submit, Down arrow to focus suggestions |
| **Placeholder text** | P0 | Configurable placeholder (e.g. "Search...") |
| **No results state** | P1 | Display "No results" when suggestions come back empty |

### Spec to Complete

```javascript
const search = new Search_Bar({
    placeholder: 'Search...',
    debounce_ms: 300,
    show_clear: true,
    show_icon: true,           // Magnifying glass
    autocomplete: true,        // Enable dropdown
    on_search: async (query) => {
        return await fetch(`/api/search?q=${query}`).then(r => r.json());
    },
    result_template: (item) => `${item.icon} ${item.title}`,
    max_suggestions: 8,
    recent_count: 5
});
```

### Estimated effort: 2–3 days

---

## 13.3 Tooltip — Basic but Incomplete

**File:** `controls/organised/1-standard/5-ui/tooltip.js` (111 lines)  
**Status:** ⚠️ Functional but visually primitive and missing standard tooltip features.

### What Exists
- Renders text in an absolutely-positioned div
- Shows/hides on mouseenter/mouseleave and focus/blur
- Has ARIA attributes (`role="tooltip"`, `aria-describedby`)
- Placement property (top/bottom/left/right)
- CSS: hardcoded `#222` background, opacity transition

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Positioning logic** | P0 | Currently sets a CSS class (`tooltip-top`) but has no code to calculate position relative to target. The tooltip renders at its natural DOM position, not near the target. |
| **Arrow/caret** | P0 | No CSS arrow pointing to the trigger element |
| **Collision detection** | P1 | If tooltip would overflow viewport, flip to opposite side |
| **Rich content** | P1 | Support HTML content, not just plain text |
| **Delay** | P1 | Show delay (e.g. 400ms) to prevent flicker on fast mouse movements |
| **Theme tokens** | P0 | Hardcoded `#222` bg — needs `var(--j-tooltip-bg)` etc. |
| **Max width** | P0 | Long text should wrap, not extend infinitely |
| **Interactive tooltip** | P2 | Keep tooltip open when hovering over the tooltip itself (for links/buttons inside) |

### CSS Spec for Completion

```css
.jsgui-tooltip {
    position: fixed; /* Use fixed for viewport-relative positioning */
    z-index: 9999;
    max-width: 280px;
    padding: var(--j-space-2) var(--j-space-3);
    font: 400 var(--j-text-xs)/1.4 var(--j-font-sans);
    color: var(--j-tooltip-fg, white);
    background: var(--j-tooltip-bg, var(--j-slate-800));
    border-radius: var(--j-radius-md);
    box-shadow: var(--j-shadow-md);
    pointer-events: none;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 150ms ease-out, transform 150ms ease-out;
}
.jsgui-tooltip.is-visible {
    opacity: 1;
    transform: translateY(0);
}
/* Arrow */
.jsgui-tooltip::after {
    content: '';
    position: absolute;
    border: 5px solid transparent;
}
.jsgui-tooltip[data-placement="top"]::after {
    bottom: -10px; left: 50%; transform: translateX(-50%);
    border-top-color: var(--j-tooltip-bg, var(--j-slate-800));
}
.jsgui-tooltip[data-placement="bottom"]::after {
    top: -10px; left: 50%; transform: translateX(-50%);
    border-bottom-color: var(--j-tooltip-bg, var(--j-slate-800));
}
```

### Estimated effort: 1–2 days

---

## 13.4 Toast — Missing Animations & Polish

**File:** `controls/organised/1-standard/5-ui/toast.js` (127 lines)  
**Status:** ⚠️ Functional core but visually basic — hardcoded colours, no animation, dismiss is plain "x" text.

### What Exists
- Show/dismiss with auto-timeout
- Status variants (success, error, warning)
- Click-to-dismiss via delegation
- ARIA `aria-live="polite"`

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Slide-in animation** | P0 | Toasts should slide in from the edge, not just appear |
| **Position control** | P0 | `position: 'top-right' \| 'top-center' \| 'bottom-right'` etc. — currently no fixed positioning |
| **Auto-dismiss timer bar** | P1 | Visual countdown bar at the bottom of each toast |
| **Icon per type** | P0 | ✅ for success, ⚠️ for warning, ❌ for error, ℹ️ for info |
| **Stacking** | P1 | Multiple toasts should stack with gap, newest on top |
| **Slide-out animation** | P0 | Toast should slide out on dismiss, not just `remove()` |
| **Theme tokens** | P0 | Replace hardcoded `#333`, `#1b5e20`, `#b71c1c`, `#ff6f00` |
| **Pause on hover** | P1 | Hovering a toast pauses the auto-dismiss timer |
| **Action button** | P2 | "Undo" or custom action button inside the toast |
| **Dismiss icon** | P0 | Replace literal "x" text with an × SVG/Unicode icon |

### Estimated effort: 1–2 days

---

## 13.5 Badge — Missing Variants & Animation

**File:** `controls/organised/0-core/0-basic/1-compositional/badge.js`  
**Status:** Basic — renders a span with a class.

### To Complete

| Feature | Priority |
|---------|:--------:|
| Colour variants (primary, success, warning, danger, neutral) | P0 |
| Dot-only variant (no text, just a coloured dot) | P1 |
| Pill shape (fully rounded) vs squared | P0 |
| Pulse animation for new notifications | P1 |
| Max value display (e.g. "99+" for counts > 99) | P1 |
| Positioning helper (absolute top-right of parent) | P0 |
| Theme tokens | P0 |

### Estimated effort: 0.5 day

---

## 13.6 Chip — Missing Interaction

**File:** `controls/organised/0-core/0-basic/1-compositional/chip.js`  
**Status:** Renders a static chip element.

### To Complete

| Feature | Priority |
|---------|:--------:|
| Dismissible (× button to remove) | P0 |
| Clickable/selectable state | P0 |
| Avatar/icon slot (leading position) | P1 |
| Colour variants | P0 |
| Outlined variant (border only, no fill) | P1 |
| Size variants (small, medium) | P0 |
| Disabled state | P0 |
| Selected state (for filter chips) | P1 |
| Group behaviour (multi-select, single-select) | P2 |

### Estimated effort: 1 day

---

## 13.7 Skeleton_Loader — Missing Shape Variants

**File:** `controls/organised/0-core/0-basic/1-compositional/skeleton-loader.js`  
**Status:** Basic shimmer animation.

### To Complete

| Feature | Priority |
|---------|:--------:|
| Shape variants: text line, circle, rectangle, card | P0 |
| Configurable width/height | P0 |
| Multi-line text skeleton with varying widths | P1 |
| Avatar + text combo preset | P1 |
| Card skeleton preset (image + title + body) | P1 |
| Theme token integration (shimmer colours) | P0 |
| `prefers-reduced-motion` disables shimmer | P0 |

### Estimated effort: 0.5 day

---

## 13.8 Progress_Bar — Missing Features

**File:** `controls/organised/0-core/0-basic/0-native-compositional/progress_bar.js`  
**Status:** Wraps `<progress>` element.

### To Complete

| Feature | Priority |
|---------|:--------:|
| Custom visual styling (not native `<progress>`) | P0 |
| Indeterminate state with shimmer animation | P0 |
| Striped animated variant | P1 |
| Colour variants (primary, success, warning, danger) | P0 |
| Label inside or outside the bar | P1 |
| Segmented progress (multi-colour for multi-part tasks) | P2 |
| Size variants (thin/medium/thick) | P1 |
| Circular/radial variant | P2 |
| Theme tokens for bar colour, track colour, height | P0 |

### Estimated effort: 1 day

---

## 13.9 Spinner — Missing Size/Colour Options

**File:** `controls/organised/0-core/0-basic/1-compositional/spinner.js`  
**Status:** Basic spinning element.

### To Complete

| Feature | Priority |
|---------|:--------:|
| Size variants (xs, sm, md, lg, xl) | P0 |
| Colour matching — inherit from parent or explicit colour prop | P0 |
| Overlay mode (covers parent with semi-transparent backdrop + centered spinner) | P1 |
| Label ("Loading...") positioned below spinner | P1 |
| `prefers-reduced-motion` — show static "Loading..." text instead of spinning | P0 |
| Theme tokens | P0 |

### Estimated effort: 0.5 day

---

## 13.10 Avatar — Missing Features

**File:** `controls/organised/0-core/0-basic/1-compositional/avatar.js`  
**Status:** Renders an image or initials in a circle.

### To Complete

| Feature | Priority |
|---------|:--------:|
| Fallback initials when image fails to load | P0 |
| Status indicator dot (online/away/busy/offline) | P0 |
| Size variants (xs: 24px, sm: 32px, md: 40px, lg: 56px, xl: 80px) | P0 |
| Group/stack layout (overlapping avatars for teams) | P1 |
| Clickable with hover ring | P1 |
| Border colour matching status | P1 |
| Random background colour from initials (deterministic hash) | P1 |

### Estimated effort: 1 day

---

## 13.11 File_Upload — Missing Drag & Drop

**File:** `controls/organised/0-core/0-basic/0-native-compositional/file-upload.js`  
**Status:** Wraps `<input type="file">`.

### To Complete

| Feature | Priority |
|---------|:--------:|
| Drag-and-drop zone with dashed border | P0 |
| Visual drag-over state (border turns primary, background tints) | P0 |
| File preview (thumbnail for images, file icon for others) | P1 |
| File list with remove button | P0 |
| Progress indicator per file (during upload) | P1 |
| File size validation + error display | P0 |
| File type restriction with clear messaging | P0 |
| Multiple file support | P0 |
| Max file count | P1 |

### Estimated effort: 2 days

---

## 13.12 Completeness Summary Table — Core & Form Controls

| Control | Current Lines | Completeness | Key Gaps | Effort |
|---------|:------------:|:------------:|----------|:------:|
| Search_Bar | 131 | 25% | No clear button, no debounce, no autocomplete, no icon | 2–3 days |
| Tooltip | 111 | 40% | No positioning logic, no arrow, no collision detection | 1–2 days |
| Toast | 127 | 50% | No animations, no positioning, hardcoded colours | 1–2 days |
| Badge | ~60 | 30% | No variants, no positioning, no animation | 0.5 day |
| Chip | ~80 | 35% | No dismiss, no selection, no variants | 1 day |
| Skeleton_Loader | ~50 | 40% | No shape variants, no presets | 0.5 day |
| Progress_Bar | ~40 | 20% | Native `<progress>` only, no custom styling | 1 day |
| Spinner | ~40 | 30% | No sizes, no overlay mode, no reduced-motion | 0.5 day |
| Avatar | ~80 | 45% | No status dot, no group layout, no fallback hash | 1 day |
| File_Upload | ~60 | 25% | No drag-drop zone, no preview, no progress | 2 days |
| Rating_Stars | ~100 | 60% | Needs half-star precision, keyboard nav, readonly | 0.5 day |

**Total effort to complete core & form controls: ~11–14 days**

---

**Next:** [Chapter 14 — Completing Existing Controls: Data, Layout & Navigation](./14-completing-data-layout-nav.md)
