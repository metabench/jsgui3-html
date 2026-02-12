# Chapter 10: The 30-Day Sprint Plan

> A day-by-day schedule for taking jsgui3-html  
> from its current state to a visually premium UI toolkit.

---

## 10.1 Sprint Overview

| Week | Focus | Deliverables |
|:----:|-------|-------------|
| **1** | Foundation | Token unification, CSS layer setup, registry, 5 core controls |
| **2** | Expansion | 15 more controls, dark mode, typography |
| **3** | Polish | Motion, states, remaining controls, gallery page |
| **4** | Integration | Cleanup, docs, production build, visual regression |

---

## 10.2 Week 1: Foundation (Days 1–7)

### Day 1: Token Unification
- [ ] Create `css/jsgui-tokens.css` with unified `--j-*` prefix
- [ ] Include full primitive palette (Chapter 6)
- [ ] Include spacing scale, radii, shadows, typography tokens (Chapter 5)
- [ ] Include `[data-theme="dark"]` overrides (Chapter 8)

### Day 2: CSS Architecture
- [ ] Create `css/jsgui-reset.css`
- [ ] Create `css/jsgui-utilities.css` with focus-ring, sr-only, truncate utilities
- [ ] Create `css/jsgui.css` master import with `@layer` declarations
- [ ] Create `css/css-registry.js` (Chapter 9)

### Day 3: Button — Reference Implementation
- [ ] Create `css/components/button.css` with all variants + 5 states
- [ ] Verify Button constructor calls `themeable()` + `add_class('jsgui-button')`
- [ ] Register CSS in constructor via registry
- [ ] Test all variants: primary, secondary, ghost, danger, outline, link
- [ ] Test all sizes: small, medium, large, xlarge
- [ ] Test light + dark mode

### Day 4: Text Input
- [ ] Create `css/components/input.css`
- [ ] All fill styles: outline, filled, underline, transparent
- [ ] Validation states: invalid, valid
- [ ] Placeholder styling
- [ ] Test alignment: button + input same height at each size

### Day 5: Toggle Switch
- [ ] Refactor `toggle_switch.js` — add `themeable()` call
- [ ] Create `css/components/toggle.css`
- [ ] Implement spring animation for thumb movement
- [ ] Test ON/OFF states, hover, focus, disabled
- [ ] Compare with iOS toggle feel

### Day 6: Panel + Data Table
- [ ] Create `css/components/panel.css` — all variants (card, elevated, well, glass)
- [ ] Create `css/components/table.css` — row hover, sort indicators, striping
- [ ] Add `themeable()` to Data_Table constructor

### Day 7: Week 1 Review
- [ ] Visual comparison: before/after screenshots
- [ ] Dark mode verification for all 5 controls
- [ ] Identify any token adjustments needed
- [ ] Update `00-index.md` with audit results

---

## 10.3 Week 2: Expansion (Days 8–14)

### Day 8: Combo Box + Dropdown Menu
- [ ] `css/components/combo-box.css` — dropdown animation, selected item
- [ ] `css/components/dropdown.css` — chevron rotation, variants

### Day 9: Checkbox + Radio
- [ ] `css/components/checkbox.css` — custom check mark (CSS, no images)
- [ ] `css/components/radio.css` — custom dot indicator
- [ ] Add `themeable()` to both constructors

### Day 10: Tabs + Menu
- [ ] `css/components/tabs.css` — animated underline, pill variant, vertical position
- [ ] `css/components/menu.css` — horizontal/vertical, indicators

### Day 11: Horizontal Slider
- [ ] Refactor `horizontal-slider.js` — new semantic class names
- [ ] `css/components/slider.css` — track, fill, thumb with all states
- [ ] Add `themeable()` call

### Day 12: Window + Context Menu
- [ ] `css/components/window.css` — title bar, button styles, resize handles
- [ ] `css/components/context-menu.css` — shadow, animation, keyboard highlight

### Day 13: Indicators — Badge, Spinner, Progress, Skeleton
- [ ] `css/components/badge.css` — colour variants, pulse animation
- [ ] `css/components/spinner.css` — rotation, size variants
- [ ] `css/components/progress.css` — fill bar, indeterminate shimmer
- [ ] `css/components/skeleton.css` — shimmer animation, shape variants

### Day 14: Week 2 Review
- [ ] 20 controls now have full visual treatment
- [ ] Dark mode verified for all 20
- [ ] Typography consistency check across all controls

---

## 10.4 Week 3: Polish (Days 15–21)

### Day 15: Remaining Form Controls
- [ ] Number input, password input with show/hide toggle
- [ ] Textarea, Search input with clear button

### Day 16: Date/Time Pickers + Calendar
- [ ] Month_View styling with token-based colours
- [ ] Date picker dropdown animation

### Day 17: Charts
- [ ] Base chart styling (axes, grid, labels)
- [ ] Tooltip styling
- [ ] Responsive container sizing

### Day 18: List Controls
- [ ] List, Virtual_List base styling
- [ ] Item hover, selection, dividers
- [ ] Card-style list items

### Day 19: Advanced Controls
- [ ] Property_Grid, Form_Container, Tree_View, Accordion
- [ ] Login form styling

### Day 20: Micro-Animations Pass
- [ ] Review all 60+ interactive controls for motion (Chapter 7)
- [ ] Add spring animations to toggles, tabs, dropdowns
- [ ] Add press-in effects to all buttons
- [ ] Test `prefers-reduced-motion`

### Day 21: Component Gallery
- [ ] Create `lab/control-gallery.html`
- [ ] Every control in every variant, every size
- [ ] Theme toggle (light/dark)
- [ ] Keyboard navigation test page

---

## 10.5 Week 4: Integration (Days 22–30)

### Days 22–23: Legacy CSS Cleanup
- [ ] Audit `basic.css` lines 152–1194
- [ ] Replace all hardcoded hex values with tokens
- [ ] Remove duplicate/dead rules
- [ ] Move any still-needed rules to component files

### Days 24–25: Production Build
- [ ] Create build script to concatenate CSS in layer order
- [ ] Generate `jsgui.min.css`
- [ ] Verify no runtime injection needed in production mode
- [ ] Measure bundle size (target: <20KB gzipped)

### Days 26–27: Documentation
- [ ] Update existing Design Book chapters 03 + 05 with new token names
- [ ] Add visual examples to each chapter of this book
- [ ] Create "Quick Start: Theming a New Control" guide

### Days 28–29: Visual Regression Setup
- [ ] Screenshot-based regression tests for the control gallery
- [ ] Compare light vs dark mode screenshots
- [ ] CI pipeline integration plan

### Day 30: Final Review
- [ ] All ~60 interactive controls have 5 interaction states
- [ ] All ~100 controls use token-based CSS
- [ ] Dark mode parity verified
- [ ] Typography consistent across all controls
- [ ] Gallery page serves as living documentation
- [ ] Ship release candidate

---

## 10.6 Success Criteria

| Metric | Before Sprint | After Sprint |
|--------|:------------:|:------------:|
| Controls with 5 states | ~3 | **60+** |
| Controls using `--j-*` tokens | ~5 | **100** |
| Lines of hardcoded hex CSS | ~300 | **0** |
| Component CSS files | 0 | **25+** |
| Dark mode coverage | ~5% | **100%** |
| Controls with micro-animation | ~1 | **30+** |
| Gallery/showcase page | None | **Live** |
| Production CSS bundle | N/A | **<20KB gz** |

---

> This book began with an audit. It ends with a plan.  
> The gap between where we are and premium is measurable, finite, and achievable.  
> Thirty days of focused work transforms jsgui3-html into a toolkit  
> that competes visually with the best in the industry.
