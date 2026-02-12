# Chapter 9: Making jsgui3-html World-Class

> A detailed roadmap for advancing the library from good to premium-tier  
> in visual quality, performance, developer experience, and accessibility.

---

## 9.1 Current Strengths

jsgui3-html already has a strong foundation that most UI libraries lack:

| Strength | Details | Why It Matters |
|----------|---------|----------------|
| **Multi-modal theming** | Token-based architecture that supports radically different visual modes from the same controls | Users don't need different control implementations for different visual styles |
| **MVVM architecture** | Clean data/presentation separation with evented models, bindings, and computed properties | Complex interactive controls can be built without spaghetti event handlers |
| **Variant registries** | Named presets for each control type with merge-priority resolution | Designers can create named variants; developers just pick a name |
| **Rich control library** | 30+ controls covering forms, navigation, data display, and selection | Most business apps need these exact controls |
| **Isomorphic design** | Server-side rendering possible with the same control code | SEO-friendly apps and faster first paint |
| **Active documentation** | Extensive guides, roadmaps, design mockups, this design book | Lower onboarding friction for new contributors |
| **Data-binding model** | Two-way bindings with transforms and computed properties | Eliminates manual DOM synchronization bugs |

---

## 9.2 Visual Quality Advancement

### Tier 1: Baseline (Current State)

Most controls have basic theming. They respond to tokens for colors, fonts, and spacing. Some have multiple variants. The primary gap is **state coverage** — many controls only distinguish between normal and maybe hover.

**What's missing at this tier:**
- Active states often identical to hover states
- Focus indicators missing on many controls
- Disabled state is often just `opacity: 0.5` without proper cursor changes
- No visual transitions between states (changes are instant)

### Tier 2: Polished

Every control must have:

| Requirement | Details | How to Verify |
|-------------|---------|---------------|
| **5 interaction states** | Normal, hover, active, focus, disabled — each visually distinct | Tab through the form, mouse over each control, click each |
| **Smooth transitions** | 150–250ms transitions between states | Watch for any "snapping" — all changes should be smooth |
| **3+ variants** | At minimum: default, win32, and one other | Switch themes and verify each variant renders correctly |
| **Consistent sizing** | Height, padding, and font size follow the spacing scale | Line up controls side-by-side and verify alignment |
| **Proper cursors** | `pointer` on clickable, `not-allowed` on disabled, `text` on inputs | Check every interactive element |

**Estimated effort to reach Tier 2:** 2–3 days of focused CSS work per control.

### Tier 3: Premium

Controls that feel best-in-class:

| Requirement | Details | Example |
|-------------|---------|---------|
| **Micro-animations** | Subtle motion that communicates state changes | Button lifts on hover, squishes on press |
| **Colored shadows** | Interactive elements cast shadows tinted with their color | Primary button emits purple glow on hover |
| **Gradient support** | Buttons and surfaces can use gradient fills | Subtle gradient on primary button: `#667eea → #764ba2` |
| **Typography refinement** | Proper letter-spacing, font-weight transitions | Headings: -0.025em; labels: 0.05em uppercase |
| **Dark/light parity** | Equally polished in both modes | Side-by-side comparison reveals no "afterthought" mode |
| **Skeleton loading** | Loading states show content shape before data arrives | Grid shows row/cell skeletons while loading |

**Estimated effort:** 1–2 weeks of focused design and CSS work across all controls.

### Tier 4: World-Class

The "wow" factor — techniques used by Stripe, Linear, Vercel, Raycast:

| Requirement | Details | Implementation Notes |
|-------------|---------|---------------------|
| **Spring physics** | Animations with spring easing for natural feel | Use `cubic-bezier(0.34, 1.56, 0.64, 1)` or a spring physics library |
| **Gesture support** | Swipe, pinch, long-press for touch devices | Use PointerEvents API; implement in Window, List, Slider |
| **Haptic feedback** | Vibration on mobile for key interactions | `navigator.vibrate(10)` on button press, toggle switch |
| **Custom cursors** | Cursor changes precisely with interactive zones | Window resize handles, slider thumb, splitter bar |
| **Sound design** | Optional, subtle audio feedback | Keyboard click on button press, whoosh on panel slide |
| **Canvas/WebGL** | GPU-rendered content for very large datasets | Grid with 100K+ cells, chart controls |

**Estimated effort:** 2–4 months of dedicated engineering. This is the aspirational target.

---

## 9.3 Performance Roadmap

### Virtual Rendering

Controls with potentially large content (Grid, List, Combo Box, Tree View) must use virtual rendering — only create DOM nodes for visible items. This is the single most impactful performance optimization.

| Control | Current | Target | Technique |
|---------|---------|--------|-----------|
| Grid | All rows in DOM | Virtual rows — 100,000+ items, <100 DOM nodes | Row virtualization with overscan |
| List | All items in DOM | Virtual list — infinite scroll capable | Intersection Observer + pool |
| Combo Box | All options in DOM | Virtual dropdown — instant with 100K items | Same as List |
| Tree View | All nodes in DOM | Virtual tree — lazy-loaded child nodes | Flatten visible nodes, virtualize that list |
| Month View | All 42 cells in DOM | Keep as-is (42 cells is fine) | N/A |

**Virtual rendering algorithm:**

```
Given:
  - scrollTop: current scroll position
  - itemHeight: height of each row (fixed or estimated)
  - containerHeight: visible area height
  - totalItems: total number of data items
  - overscan: number of extra rows above/below viewport (default: 5)

Calculate:
  - startIndex = Math.floor(scrollTop / itemHeight) - overscan
  - endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  - visibleItems = items.slice(startIndex, endIndex)
  - offsetY = startIndex * itemHeight  (CSS transform: translateY)
  - totalHeight = totalItems * itemHeight  (spacer element height)

Render:
  - One spacer div with height = totalHeight (creates scrollbar)
  - Only visibleItems.length DOM nodes, offset by translateY
```

**Key implementation detail:** Use `transform: translateY()` instead of `position: absolute; top:` because `transform` is GPU-accelerated and doesn't trigger layout recalculation.

### CSS Containment

CSS containment tells the browser that a subtree's layout is independent from the rest of the page. This dramatically reduces layout recalculation costs:

```css
/* Basic containment for all controls */
.jsgui-control {
    contain: layout paint;  /* Isolate layout recalculations */
}

/* Strict containment for list items (maximum isolation) */
.jsgui-list-item {
    contain: strict;    /* layout + paint + size */
    content-visibility: auto;  /* Hidden items skip rendering entirely */
    contain-intrinsic-size: 0 40px;  /* Estimated size when not rendered */
}

/* Containment for grid cells */
.jsgui-grid-cell {
    contain: layout style paint;
}
```

**`content-visibility: auto` is particularly powerful:** Items outside the viewport are not rendered at all — no style calculation, no layout, no paint. The browser uses the `contain-intrinsic-size` as a placeholder for scrollbar sizing.

### Animation Performance Rules

```css
/* ✅ GOOD: Only animate compositor-friendly properties */
/* These properties are handled by the GPU compositor thread */
.jsgui-button {
    transition: transform 150ms ease, opacity 200ms ease;
    will-change: transform;
}

.jsgui-button:hover {
    transform: translateY(-1px) scale(1.02);
}

/* ❌ BAD: These trigger layout recalculation (main thread) */
/* width, height, top, left, right, bottom, margin, padding, font-size */
.jsgui-button:hover {
    width: 110%;      /* BAD: triggers layout */
    padding: 12px;    /* BAD: triggers layout */
    font-size: 15px;  /* BAD: triggers layout + paint */
}
```

**The two "free" properties:** `transform` and `opacity` can be animated by the GPU compositor thread without touching the main thread. Everything else triggers either layout (very expensive) or paint (moderately expensive).

### Rendering Pipeline Awareness

Understanding the browser rendering pipeline helps make better performance decisions:

```
JavaScript → Style calculation → Layout → Paint → Composite
   │               │                │        │         │
   │  "which CSS    │  "where does   │  "draw  │  "layer 
   │   applies?"    │   each box     │  pixels" │  compositing"
   │               │   go?"         │        │
   │               │                │        │
   └── minimize ───┘── avoid ───────┘── minimize ──── GPU-free ──┘
```

- **JavaScript:** Minimize DOM reads/writes. Batch all reads first, then all writes.
- **Style:** Use simple selectors. Avoid `*` and deep descendants.
- **Layout:** Avoid triggering layout from JavaScript. Never read layout properties (offsetWidth) between writes.
- **Paint:** Use `will-change` sparingly. Each `will-change` creates a new GPU layer.
- **Composite:** `transform` and `opacity` changes only need this step — the cheapest path.

### Memory Management

For large datasets:

```javascript
// DOM node pooling for virtual lists
class NodePool {
    constructor(factory) {
        this._factory = factory;
        this._pool = [];
    }
    
    acquire() {
        return this._pool.pop() || this._factory();
    }
    
    release(node) {
        // Reset the node and return to pool
        node.textContent = '';
        node.className = '';
        this._pool.push(node);
    }
}
```

---

## 9.4 Developer Experience Improvements

### Better Constructors

Typed constructors with clear parameter objects:

```javascript
// Before: spec bag with mysterious properties
const btn = new Button({ text: 'OK', xyw: [10, 20, 100] });

// After: clear, documented, autocomplete-friendly
const btn = new Button({
    text: 'OK',
    variant: 'primary',     // autocomplete: 'primary' | 'ghost' | 'outline' | ...
    size: 'medium',          // autocomplete: 'small' | 'medium' | 'large'
    icon: 'check',           // icon name from icon registry
    disabled: false,
    onClick: () => save(),
    theme_params: {
        corner_radius: 8,
        shadow: true
    }
});
```

### Error Messages

```javascript
// Before (cryptic)
// TypeError: Cannot read property 'el' of undefined

// After (actionable)
// jsgui3 Error: Button requires a parent context.
// 
// The Button was created but not added to a container before calling .activate().
// 
// Fix: Add the button to a panel or window first:
//   panel.add(button);   // ← add to container
//   button.activate();   // ← then activate
//
// Common cause: Creating controls in a loop without a container.
```

### Component Gallery

A live showcase page (`lab/control-gallery.html`) that displays:

| Section | Content |
|---------|---------|
| **Controls** | Every control in every variant |
| **States** | Each control in all interaction states |
| **Themes** | One-click switching between visual modes |
| **Sizes** | Controls at every size step |
| **Density** | Comfortable, compact, and dense layouts |
| **Accessibility** | Keyboard navigation testing, screen reader output |
| **Performance** | Stress tests (1000 buttons, 10K grid rows) |

This gallery would serve as:
1. **Documentation** — developers see what's available
2. **Regression testing** — visual changes are immediately apparent
3. **Design tool** — designers can see the effect of token changes
4. **Demo** — showcasing the library's capabilities to potential users

---

## 9.5 Accessibility Roadmap

### ARIA Support

Every interactive control must provide full ARIA semantics:

| ARIA Feature | Controls | Priority | Implementation Notes |
|-------------|----------|----------|---------------------|
| `role` attribute | All | **P0** | Set in constructor |
| `aria-label` / `aria-labelledby` | All | **P0** | Pass through from spec, with fallback |
| `aria-disabled` | All | **P0** | Set via property binding |
| `aria-expanded` | Dropdown, Tree, Collapsible, Accordion | **P1** | Toggle on expand/collapse |
| `aria-selected` | List, Grid, Tab | **P1** | Update on selection change |
| `aria-checked` | Checkbox, Radio, Toggle, Switch | **P1** | `"true"`, `"false"`, or `"mixed"` |
| `aria-valuenow/min/max` | Slider, Progress, Stepper, Gauge | **P2** | Update on value change |
| `aria-live` | Badge, Status, Notification, Toast | **P2** | `"polite"` for updates, `"assertive"` for errors |
| `aria-describedby` | All inputs | **P2** | Link to error/help text elements |
| `aria-activedescendant` | List, Grid, Menu, Combo | **P2** | For composite widget keyboard nav |
| `aria-orientation` | Slider, Toolbar, Menu | **P3** | `"horizontal"` or `"vertical"` |
| `aria-keyshortcuts` | Menu items | **P3** | Document keyboard shortcuts |

### Keyboard Navigation Patterns

Every interactive control must be operable without a mouse:

| Pattern | Controls | Keys | WAI-ARIA Pattern |
|---------|----------|------|-----------------|
| **Single activation** | Button, Link | Enter, Space | Button pattern |
| **Toggle** | Checkbox, Toggle, Switch | Space | Checkbox pattern |
| **Selection in group** | Radio, Tab | Arrow keys, Home/End | Radio Group / Tabs |
| **Disclosure** | Dropdown, Tree node, Accordion | Enter/Space to toggle, Arrows to navigate | Disclosure pattern |
| **Grid navigation** | Grid, Calendar, Color Palette | Arrows (cell), Home/End (row), Ctrl+Home/End (grid) | Grid pattern |
| **Text editing** | Input, Textarea | Standard keys, Ctrl+A, Ctrl+Z | N/A (browser native) |
| **Dismiss** | Modal, Dropdown, Menu, Toast | Escape | Dialog pattern |
| **Roving tabindex** | Toolbar, Menu bar | Tab into widget, Arrows within | Toolbar pattern |

### Focus Management

Controls must manage focus correctly for keyboard users:

```javascript
// Focus trap for modals — Tab stays within the modal
class Modal extends Control {
    _activate() {
        // Remember where focus was before the modal
        this._previousFocus = document.activeElement;
        
        // Move focus into the modal
        this._focusFirst();
        
        // Trap Tab key within modal
        this._trapFocus();
    }
    
    _deactivate() {
        // Release the focus trap
        this._releaseFocus();
        
        // Restore focus to what had it before
        this._previousFocus?.focus();
    }
    
    _focusFirst() {
        const focusable = this._getFocusableElements();
        if (focusable.length > 0) {
            focusable[0].focus();
        }
    }
    
    _getFocusableElements() {
        return this.dom.el.querySelectorAll(
            'button:not([disabled]), ' +
            '[href]:not([disabled]), ' +
            'input:not([disabled]), ' +
            'select:not([disabled]), ' +
            'textarea:not([disabled]), ' +
            '[tabindex]:not([tabindex="-1"]):not([disabled])'
        );
    }
    
    _trapFocus() {
        this._keyHandler = (e) => {
            if (e.key !== 'Tab') return;
            
            const focusable = this._getFocusableElements();
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();  // Shift+Tab from first → last
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();  // Tab from last → first
                }
            }
        };
        
        document.addEventListener('keydown', this._keyHandler);
    }
    
    _releaseFocus() {
        document.removeEventListener('keydown', this._keyHandler);
    }
}
```

### Color Contrast

All text and interactive elements must meet WCAG AA contrast ratios:

| Element | Minimum Contrast | Current Status |
|---------|:---------------:|:--------------:|
| Normal text (≥14px) | 4.5:1 | ⚠️ Check per mode |
| Large text (≥18px or ≥14px bold) | 3:1 | ⚠️ Check per mode |
| UI components (borders, icons) | 3:1 | ⚠️ Check per mode |
| Focus indicators | 3:1 against adjacent | ✅ Double-ring technique passes |

### High Contrast Mode

Support Windows High Contrast Mode:

```css
@media (forced-colors: active) {
    .jsgui-button {
        border: 2px solid ButtonText;  /* System-enforced colors */
        background: ButtonFace;
        color: ButtonText;
    }
    
    .jsgui-button:focus-visible {
        outline: 2px solid Highlight;
    }
    
    .jsgui-button:disabled {
        border-color: GrayText;
        color: GrayText;
    }
}
```

---

## 9.6 Quality Metric Targets

| Metric | Current (est.) | Tier 2 Target | Tier 3 Target | Tier 4 Target |
|--------|:--------------:|:-------------:|:-------------:|:-------------:|
| Controls with ≥3 variants | ~3 | 10 | 15+ | 20+ |
| Controls with micro-animations | ~1 | 5 | 10+ | All interactive |
| Controls with keyboard nav | ~5 | 10 | All interactive | + Shortcuts |
| Controls with full ARIA | ~2 | 8 | All interactive | + Screen reader tested |
| Visual modes fully supported | 1 | 2 | 3+ | 4+ |
| Grid/List: max items before lag | ~500 | 5,000 | 50,000+ | 500,000+ |
| Time to render 100 buttons | ~50ms | <20ms | <10ms | <5ms |
| Bundle size per control avg | unknown | <8KB | <5KB gzipped | <3KB gzipped |
| Documentation coverage | ~40% | 70% | 90%+ | 100% |
| WCAG AA compliance | ~30% | 60% | 90%+ | 100% |
| Component gallery exists | No | Yes (basic) | Yes (interactive) | Yes (automated tests) |

---

## 9.7 Technology Decisions

### CSS Strategy

| Technique | Use When | Avoid When |
|-----------|----------|------------|
| CSS Custom Properties | Theme tokens, dynamic values | Static values that never change |
| CSS `@layer` | Ordering theme overrides | Simple component CSS |
| `container` queries | Responsive components | Only viewport-dependent layouts |
| `:has()` selector | Parent styling based on child state | Browser support needed (pre-2023) |
| CSS nesting | Component styles with state variants | Already using preprocessor |
| `@property` | Animating custom properties (gradients) | Simple color/transform transitions |

### JavaScript Strategy

| Technique | Use When | Avoid When |
|-----------|----------|------------|
| `IntersectionObserver` | Virtual rendering visibility detection | Simple show/hide with `display` |
| `ResizeObserver` | Component resize handling | Only need viewport resize |
| `MutationObserver` | Watching DOM changes from external code | You control the mutations yourself |
| `requestAnimationFrame` | Batching DOM updates, smooth animations | Simple CSS transitions suffice |
| `PointerEvents` API | Touch + mouse + stylus support | Mouse-only desktop apps |
| `Clipboard` API | Copy/paste support in grids | Simple text inputs (browser handles it) |
