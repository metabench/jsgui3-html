# Chapter 14: Completing Existing Controls — Data, Layout & Navigation

> Continuing the gap analysis from Chapter 13,  
> this chapter covers controls that display data, manage layout, and handle navigation.

---

## 14.1 Data_Table — Missing Standard Features

**File:** `controls/organised/1-standard/4-data/data_table.js` (424 lines)  
**Status:** 🟡 Core works — columns, rows, sorting, filtering, pagination exist but are basic.

### What Exists
- Column definition with key/label/sortable/accessor/render
- Row rendering with cell composition
- Sort by column (click header)
- Synthetic filter API
- Pagination with page size
- Selection model (single/multi)

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Column resizing** | P0 | Drag column borders to resize — currently no resize handles |
| **Column reordering** | P1 | Drag column headers to reorder |
| **Fixed/sticky columns** | P1 | Lock first N columns while scrolling horizontally |
| **Row expansion** | P1 | Click to expand a row and show detail content below |
| **Empty state** | P0 | "No data" message when there are no rows |
| **Loading state** | P0 | Skeleton rows while data is being fetched |
| **Sort indicators** | P0 | Up/down arrows in sorted column headers |
| **Multi-column sort** | P2 | Shift+click to add secondary sort |
| **Row actions column** | P1 | Right-aligned column with edit/delete buttons |
| **Export** | P2 | Copy to clipboard, download as CSV |
| **Bulk selection** | P1 | Checkbox column with "select all" header |
| **Footer summary row** | P2 | Aggregations (sum, count, avg) in footer |

### Estimated effort: 4–5 days for P0+P1 features

---

## 14.2 Tree_View — Missing Standard Features

**File:** `controls/organised/1-standard/4-data/Tree_View.js`  
**Status:** 🟡 Basic tree rendering works.

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Lazy loading** | P1 | Load children on expand (async callback) |
| **Drag-and-drop reorder** | P1 | Move nodes within and between parents |
| **Checkbox selection** | P0 | Tri-state checkboxes (checked, unchecked, indeterminate for partial children) |
| **Search/filter** | P1 | Filter tree to show only matching nodes (with parent path) |
| **Context menu** | P1 | Right-click node for actions (rename, delete, move, etc.) |
| **Keyboard navigation** | P0 | Arrow keys to navigate, Enter to toggle expand, Space to select |
| **Node icons** | P0 | Per-node-type icons (folder/file, open/closed folder) |
| **Virtualization** | P2 | For trees with 10,000+ nodes — only render visible nodes |
| **Indent guides** | P1 | Vertical lines showing tree depth visually |

### Estimated effort: 3–4 days for P0+P1 features

---

## 14.3 Horizontal_Slider — Needs Full Rewrite

**File:** `controls/organised/1-standard/5-ui/horizontal-slider.js` (303 lines)  
**Status:** 🔴 Uses legacy patterns — no CSS, no theming, direct style manipulation.

### What Exists
- Basic drag functionality via the `dragable` mixin
- Value calculation from position
- Min/max/value fields

### What Needs Complete Rewrite

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Modern CSS** | P0 | Replace all inline JS positioning with CSS + `transform` |
| **Range slider** | P0 | Two thumbs for min/max range selection |
| **Step snapping** | P0 | Snap to discrete values (e.g. step: 5) |
| **Tick marks** | P1 | Visual marks at intervals along the track |
| **Labels** | P1 | Min/max value labels, current value tooltip above thumb |
| **Vertical orientation** | P1 | Support `orientation: 'vertical'` |
| **Theme tokens** | P0 | All colours, sizes, shadows via `--j-*` vars |
| **Keyboard control** | P0 | Left/Right arrows, Home/End, Page Up/Down |
| **ARIA** | P0 | `role="slider"`, `aria-valuemin/max/now`, `aria-orientation` |
| **Touch support** | P0 | Proper touch events, not just mouse |

### Estimated effort: 3 days (essentially a ground-up rebuild)

---

## 14.4 Tabbed_Panel — Missing Polish

**File:** `controls/organised/1-standard/6-layout/tabbed-panel.js`  
**Status:** 🟡 Core tab switching works, needs visual polish.

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Animated tab indicator** | P0 | Sliding underline that moves to the active tab (see Chapter 7) |
| **Tab variants** | P1 | Underline (default), pill, boxed, vertical-left, vertical-right |
| **Closable tabs** | P1 | × button to close/remove a tab |
| **Overflow scrolling** | P1 | When too many tabs, show left/right scroll arrows |
| **Tab icons** | P0 | Icon + label per tab |
| **Lazy tab content** | P1 | Only compose tab content when first activated |
| **Keyboard navigation** | P0 | Arrow keys to move between tabs, Enter/Space to activate |
| **Badge on tab** | P2 | Notification count badge on individual tabs |
| **Drag to reorder** | P2 | Reorder tabs by dragging |

### Estimated effort: 2–3 days

---

## 14.5 Window — Missing Window Management

**File:** `controls/organised/1-standard/6-layout/window.js`  
**Status:** 🟡 Has variants in `variants.js`, basic title bar, but missing standard windowing features.

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Snap zones** | P1 | Drag to edge to snap half-screen / quarter-screen |
| **Maximize animation** | P0 | Smooth transition to full-size, not instant |
| **Minimize to taskbar** | P2 | Collapse to a bar at the bottom |
| **Resize constraints** | P0 | Min/max width and height enforcement |
| **Z-order management** | P0 | Click to bring to front, proper z-index stacking |
| **Cascade positioning** | P1 | New windows offset from previous to avoid perfect overlap |
| **Title bar double-click** | P0 | Toggle maximize/restore |
| **Keyboard shortcuts** | P1 | Alt+F4 close, Alt+Space for system menu |

### Estimated effort: 2–3 days (Window_Manager handles some of this)

---

## 14.6 Modal — Missing Standard Features

**File:** `controls/organised/1-standard/6-layout/modal.js`  
**Status:** 🟡 Basic overlay + content panel.

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Entrance/exit animation** | P0 | Fade + scale-up on open, reverse on close |
| **Backdrop click to close** | P0 | Click outside modal to dismiss |
| **Escape key to close** | P0 | Standard keyboard shortcut |
| **Focus trap** | P0 | Tab key cycles through modal controls only |
| **Header/body/footer sections** | P0 | Pre-built title + close button, scrollable body, sticky actions footer |
| **Size variants** | P1 | Small (400px), medium (560px), large (720px), fullscreen |
| **Stacked modals** | P2 | Opening a modal from within a modal |
| **Close confirmation** | P1 | "Are you sure?" dialog when closing with unsaved changes |
| **Scroll lock** | P0 | Prevent body scrolling while modal is open |

### Estimated effort: 1–2 days

---

## 14.7 Accordion — Missing Standard Features

**File:** `controls/organised/1-standard/6-layout/accordion.js`  
**Status:** 🟡 Basic expand/collapse works.

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Chevron rotation animation** | P0 | Rotate chevron icon 180° on expand/collapse |
| **Exclusive mode** | P0 | Only one section open at a time (auto-close others) |
| **Body height animation** | P0 | Smooth animated expand/collapse instead of instant |
| **Disabled section** | P1 | Grey out and prevent toggle on specific sections |
| **Variant: bordered** | P1 | Sections separated by borders |
| **Variant: filled** | P1 | Active section has tinted background |
| **Keyboard navigation** | P0 | Arrow keys to navigate headers, Enter/Space to toggle |
| **Header slots** | P1 | Custom content in header (icon, badge, subtitle) |

### Estimated effort: 1–2 days

---

## 14.8 Breadcrumbs — Feature Gaps

**File:** `controls/organised/1-standard/5-ui/breadcrumbs.js`  
**Status:** 🟡 Renders linked items.

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Custom separator** | P0 | Configurable separator (/ or > or → or icon) |
| **Overflow truncation** | P1 | Collapse middle items to "..." when too many breadcrumbs |
| **Icon support** | P1 | Home icon for first breadcrumb |
| **Dropdown on overflow** | P2 | Click "..." to see collapsed items in dropdown |
| **Current page non-clickable** | P0 | Last breadcrumb is text, not a link |

### Estimated effort: 0.5 day

---

## 14.9 Split_Pane — Missing Polish

**File:** `controls/organised/1-standard/6-layout/split_pane.js`  
**Status:** 🟡 Basic two-pane with drag divider.

### What's Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Collapse pane** | P0 | Double-click divider or button to collapse one pane |
| **Min/max pane size** | P0 | Prevent pane from being dragged too small or too large |
| **Divider hover style** | P0 | Visual indicator that divider is draggable |
| **Nested split panes** | P1 | Split panes within split panes |
| **Persistence** | P1 | Remember pane size in localStorage |
| **Orientation** | P0 | horizontal and vertical (`orientation: 'horizontal' \| 'vertical'`) |

### Estimated effort: 1 day

---

## 14.10 Rich_Text_Editor — Missing Advanced Features

**File:** `controls/organised/1-standard/1-editor/Rich_Text_Editor.js` (581 lines)  
**Status:** 🟢 Most complete editor — has toolbar, markdown mode, sanitization, word/char count.

### What Exists
- WYSIWYG mode + markdown mode with toggle
- Toolbar with bold/italic/underline/lists/heading/link
- HTML sanitization
- Content get/set (HTML, markdown, plain text)
- Read-only mode, focus, clear, is_empty
- Character and word count

### What's Still Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Table insertion** | P1 | Create/edit tables with add/remove row/column |
| **Image insertion** | P1 | Insert image by URL or file upload |
| **Undo/redo** | P0 | History stack with Ctrl+Z / Ctrl+Y |
| **Placeholder text** | P0 | "Type something..." when empty |
| **Text colour** | P2 | Colour picker for text foreground |
| **Block quote** | P1 | Left-border styled blockquote |
| **Code block** | P1 | Monospace formatted code blocks |
| **Mentions** | P2 | @mention with autocomplete dropdown |
| **Drag-and-drop images** | P2 | Drop image files into the editor |
| **Max length** | P1 | Character limit with visual indicator |
| **Keyboard shortcuts** | P0 | Ctrl+B, Ctrl+I, Ctrl+K (link), Ctrl+Shift+M (markdown) — verify all work |

### Estimated effort: 3–4 days for P0+P1 features

---

## 14.11 Color_Picker — Missing Convenience Features

**File:** `controls/organised/0-core/0-basic/1-compositional/color-picker.js` (936 lines)  
**Status:** 🟢 Most feature-rich control — HSL wheel, saturation/lightness area, RGB/HSL sliders, input fields, preview.

### What's Still Missing

| Feature | Priority | Description |
|---------|:--------:|-------------|
| **Preset/swatch palette** | P0 | Row of clickable preset colours (recent + theme colours) |
| **Copy to clipboard** | P0 | Click hex value to copy — with brief "Copied!" feedback |
| **Eyedropper** | P1 | `EyeDropper` API (Chrome/Edge) for picking from screen |
| **CSS named colour support** | P2 | Input "red", "cornflowerblue" etc. |
| **Opacity/alpha slider** | P1 | Visual alpha slider with checkerboard background |
| **Compact mode** | P1 | Dropdown that opens full picker from a small colour swatch |
| **Gradient picker** | P2 | Linear/radial gradient builder |

### Estimated effort: 2–3 days

---

## 14.12 Completeness Summary — Data, Layout & Navigation

| Control | Completeness | Key Gaps | Effort |
|---------|:------------:|----------|:------:|
| Data_Table | 55% | No column resize, no empty/loading state, no sort indicators | 4–5 days |
| Tree_View | 45% | No checkboxes, no keyboard nav, no lazy loading | 3–4 days |
| Horizontal_Slider | 15% | Full rewrite needed — no CSS, no range mode, no ARIA | 3 days |
| Tabbed_Panel | 50% | No animated indicator, no closable tabs, no overflow | 2–3 days |
| Window | 50% | No snap zones, no z-order, no animate maximize | 2–3 days |
| Modal | 40% | No animation, no focus trap, no backdrop dismiss | 1–2 days |
| Accordion | 45% | No animation, no exclusive mode, no keyboard nav | 1–2 days |
| Breadcrumbs | 55% | No custom separator, no overflow truncation | 0.5 day |
| Split_Pane | 50% | No collapse, no min/max constraints | 1 day |
| Rich_Text_Editor | 70% | No undo/redo, no tables, no images | 3–4 days |
| Color_Picker | 75% | No presets, no clipboard, no eyedropper | 2–3 days |

**Total effort to complete data/layout/nav controls: ~24–34 days**

---

## 14.13 Grand Total: Completing All Existing Controls

| Category | From Chapter | Effort |
|----------|:------------:|:------:|
| Core & Form controls | Chapter 13 | 11–14 days |
| Data, Layout & Navigation controls | Chapter 14 | 24–34 days |
| **Total** | | **35–48 days** |

Combined with the new controls from Chapters 11–12 (~55–70 days), the full roadmap to a premium 200+ control toolkit is approximately **90–120 days** of focused development — achievable within a single quarter.

---

> These chapters prove that jsgui3-html is not starting from zero.  
> The architecture is sound. The gaps are known. The path is clear.
