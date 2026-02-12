# Chapter 10: AI-Driven Continuous Improvement

> A systematic methodology that AI agents (and human developers) can follow  
> to continuously improve jsgui3-html controls — from survey to implementation  
> to documentation.

---

## 10.1 The Core Loop

The improvement methodology is a 6-step cycle:

```
┌─────────┐    ┌──────────┐    ┌──────────┐
│ 1.SURVEY │───▶│ 2.RESEARCH│───▶│ 3.DESIGN │
│          │    │          │    │   (SVG)   │
└─────────┘    └──────────┘    └──────────┘
      ▲                              │
      │                              ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│6.DOCUMENT │◀──│ 5.TEST   │◀──│4.IMPLEMENT│
│           │    │          │    │  (Code)   │
└──────────┘    └──────────┘    └──────────┘
```

**See:** [svg-09-ai-improvement-loop.svg](./svg-09-ai-improvement-loop.svg) — visual diagram of this loop.

Each step is defined precisely enough that an AI agent can execute it with minimal human guidance.

---

## 10.2 Step 1: Survey

**Goal:** Identify what needs improvement and in what order.

### Actions

1. Read `docs/control-design-book/05-control-catalogue.md` — the control inventory
2. Identify controls at Tier T0 or T1
3. Check the priority improvement order (Section 5.5)
4. Check `docs/controls_expansion_ideas.md` for new control requests
5. Check the issue tracker for user-reported visual bugs

### Output

A prioritized list of improvements:

```markdown
## Improvement Candidates

1. Button → Missing win32 variant, no micro-animations [T2→T3]
2. Text Field → Only 1 variant, needs sunken/floating-label [T1→T2]
3. Grid → No virtual rendering, needs win32 property-grid variant [T1→T2]
```

---

## 10.3 Step 2: Research

**Goal:** Study world-class implementations of the target control.

### Actions

1. Search the web for "[control name] design specifications"
2. Study 3–5 implementations in major libraries:
   - Material UI (React)
   - Ant Design (React)
   - Chakra UI (React)
   - Headless UI (React/Vue)
   - Primer (GitHub)
   - Carbon (IBM)
   - Fluent UI (Microsoft)
3. Note the following for each implementation:
   - Visual states (how many, what triggers them)
   - Accessibility patterns (ARIA roles, keyboard support)
   - Animation details (what animates, timing curves)
   - Variant count and names
   - API surface (props/params)
4. Study the existing jsgui3 control source code (`controls/organised/...`)

### Research Template

```markdown
## [Control Name] Research

### Implementations Studied
| Library | States | Variants | ARIA | Animation | Notes |
|---------|--------|----------|------|-----------|-------|
| Material UI | 5 | 6 | Full | 200ms | Ripple effect |
| Ant Design | 5 | 5 | Full | 300ms | Loading state |
| Chakra UI | 5 | 7 | Full | 200ms | Color scheme support |

### Key Findings
- [Finding 1]
- [Finding 2]

### Recommendations for jsgui3
- [Recommendation 1]
- [Recommendation 2]
```

---

## 10.4 Step 3: Design (SVG)

**Goal:** Create SVG mockups of the improved control in all target visual modes.

### Actions

1. Create an SVG that shows the control in its key states:
   - Normal, Hover, Active/Pressed, Focused, Disabled
2. Show the control in all target visual modes:
   - Modern Dark
   - Win32 Classic
   - At least one of: Glassmorphism, Neumorphism, Enterprise
3. Annotate with jsgui3 token names and CSS approach
4. Save to `docs/control-design-book/svg-{number}-{name}.svg`

### SVG Template

```xml
<svg viewBox="0 0 800 700" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <!-- Shared gradients, shadows, patterns -->
    </defs>
    
    <!-- Section 1: Title -->
    <text x="20" y="30" font-family="Inter" font-size="18" fill="#667eea">
        [Control Name] Design — jsgui3-html
    </text>
    
    <!-- Section 2: Modern Dark Mode -->
    <text x="20" y="60" font-family="Inter" font-size="14" fill="#94a3b8">
        Modern Dark Mode
    </text>
    <!-- Controls in modern dark style -->
    
    <!-- Section 3: Win32 Classic Mode -->
    <text x="20" y="300" font-family="Tahoma" font-size="14" fill="#333">
        Win32 Classic Mode
    </text>
    <!-- Controls in win32 style -->
    
    <!-- Section 4: Annotations -->
    <!-- Token mappings and CSS notes -->
</svg>
```

---

## 10.5 Step 4: Implement (Code)

**Goal:** Write the JavaScript and CSS code to implement the designed improvements.

### Code Quality Checklist

Before writing code:
- [ ] Read the existing control source completely
- [ ] Understand the current data model (Layer 1)
- [ ] Understand the current view-model (Layer 2)
- [ ] Identify what's CSS-only vs. what requires JS changes

### Implementation Order

1. **CSS first** — Add new theme token values and CSS rules
2. **Variants** — Register new variants in `themes/variants.js`
3. **JS changes** — Only if the control needs structural modifications
4. **Test page** — Update or create a lab demo page

### CSS Changes Pattern

```css
/* Win32 variant for Button */
[data-theme="win32"] .jsgui-button,
.jsgui-button[data-variant="vs-classic"] {
    /* Token-driven — all values from CSS variables */
    border-radius: var(--theme-radius-1);
    font-family: var(--theme-font-family-base);
    font-size: var(--theme-font-size-base);
    background: var(--theme-color-surface);
    color: var(--theme-color-text);
    
    /* Win32-specific: 3D border via box-shadow */
    box-shadow:
        inset -1px -1px 0 0 var(--theme-color-dark-shadow),
        inset 1px 1px 0 0 var(--theme-color-highlight),
        inset -2px -2px 0 0 var(--theme-color-shadow),
        inset 2px 2px 0 0 var(--theme-3d-light);
}
```

### JS Changes Pattern

```javascript
// In the control's constructor, add the new variant support
const params = themeable(this, 'button', spec, {
    defaults: {
        variant: 'filled',
        shape: 'rounded',
        // ... existing defaults
    }
});

// The params object now includes any win32-specific settings
// from the variant registry
if (params.border_style === 'beveled-3d') {
    this.dom.el.setAttribute('data-border-style', 'beveled-3d');
}
```

---

## 10.6 Step 5: Test

**Goal:** Verify the implementation is correct across all modes.

### Visual Testing

Use the browser tool to:
1. Open the control's lab demo page
2. Switch between themes (modern dark, win32, glass)
3. Test all interaction states (hover, click, focus, disable)
4. Take screenshots for documentation
5. Compare against the SVG mockup from Step 3

### Functional Testing

1. Click/interact with the control — verify events fire
2. Keyboard navigation — Tab, Enter, Space, Escape, Arrows
3. Screen reader testing — verify ARIA labels are announced
4. Resize window — verify responsive behavior
5. Rapid state changes — verify no visual glitches

### Regression Testing

1. Run existing test suite: `npm test`
2. Verify no other controls are broken by CSS changes
3. Check that the default theme still works (no unintended overrides)

### Performance Testing

For large-content controls (Grid, List):
1. Load with 10,000 items
2. Measure initial render time
3. Scroll — verify smooth 60fps
4. Filter/sort — measure response time

---

## 10.7 Step 6: Document

**Goal:** Update all documentation to reflect the improvements.

### Files to Update

1. **This book:**
   - `05-control-catalogue.md` — Update the control's tier and variant list
   - `08-design-assets.md` — Add new SVGs to the inventory
   - Chapter relevant to the visual mode (Ch. 6 for win32, Ch. 7 for modern)

2. **Roadmap files:**
   - `docs/THEME_SYSTEM_EXTENSION_ROADMAP.md` — Mark completed items
   - `docs/controls_expansion_ideas.md` — Mark completed ideas

3. **Code documentation:**
   - JSDoc comments in the control source
   - TypeScript declarations if applicable

---

## 10.8 The Minimal Prompt

An AI agent can be triggered to improve controls with a minimal prompt:

```
Improve the [control name] control.
```

The agent should then:
1. Read Chapter 10 of this book (this chapter)
2. Follow the 6-step loop
3. Report back with:
   - SVG mockup(s) created
   - Code changes made
   - Test results
   - Documentation updated

For a broader sweep:

```
Improve the controls.
```

The agent should:
1. Read Chapter 5 (control catalogue) for the priority list
2. Pick the highest-priority control
3. Execute the full 6-step loop
4. Move to the next control

---

## 10.9 Research Protocol

When researching a control, always:

### DO

- ✅ Study at least 3 mature implementations
- ✅ Check the WAI-ARIA Authoring Practices for the correct pattern
- ✅ Note exact CSS values, not vague descriptions ("use a subtle shadow")
- ✅ Record transition durations and easing curves
- ✅ Note keyboard shortcuts that are standard for this control type
- ✅ Check mobile/touch behavior requirements

### DON'T

- ❌ Copy implementation code from other libraries (license issues)
- ❌ Assume one library's approach is "correct" — synthesize from multiple
- ❌ Skip the SVG mockup step (it catches design issues before coding)
- ❌ Change the data model unless absolutely necessary (breaking change)
- ❌ Remove existing variants (only add new ones)

---

## 10.10 QA Checklist

Before marking a control improvement as complete:

### Visual
- [ ] Renders correctly in Modern Dark
- [ ] Renders correctly in Win32 Classic (if applicable)
- [ ] All 5 states visually distinct (normal, hover, active, focus, disabled)
- [ ] Text remains readable on all surface colors
- [ ] Focus indicator is visible on all backgrounds
- [ ] No rendering glitches at 0.5x, 1x, 2x, 3x DPI

### Functional
- [ ] All events fire correctly (click, change, focus, blur)
- [ ] Data model updates propagate to DOM
- [ ] DOM interactions propagate to data model
- [ ] Works with keyboard only (no mouse)
- [ ] Works with screen reader

### Theme
- [ ] Responds to all relevant theme tokens
- [ ] Variant registry entry exists
- [ ] `data-variant` attribute is set on DOM element
- [ ] `data-theme` cascade works (inherits from parent)
- [ ] Per-instance token overrides work

### Performance
- [ ] No layout thrashing (batch DOM reads, then writes)
- [ ] CSS animations use `transform` and `opacity` only
- [ ] Large content uses virtual rendering
- [ ] `contain: layout paint` applied

### Documentation
- [ ] Control catalogue updated (tier, variants, modes)
- [ ] SVG mockup added to design assets
- [ ] Code has JSDoc comments on public methods
- [ ] Lab demo page exists and works

---

## 10.11 Priority Order

When in doubt about what to improve:

1. **Button** — the most-used control; it defines the aesthetic baseline
2. **Text Field** — the most-used input control
3. **Panel/Card** — the primary layout container
4. **Window** — the showcase control for jsgui3
5. **Grid** — the most complex data display control
6. **List** — essential for data applications
7. **Tab Control** — heavily used in complex UIs
8. **Dropdown/Combo** — critical for form interactions
9. **Scrollbar** — affects perceived polish everywhere
10. **Progress** — small but sets visual tone

After these 10, prioritize based on user feedback and the control expansion ideas list.
