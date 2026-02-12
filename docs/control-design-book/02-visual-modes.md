# Chapter 2: Visual Modes

> Every control in jsgui3-html can present itself in radically different visual styles.  
> This chapter catalogues each mode, defines its rules, and shows how controls adapt.

---

## 2.1 What Is a Visual Mode?

A visual mode is a **complete set of aesthetic rules** that can be applied to any control. It defines not just colors but:

- **Shapes** — border-radius, corner treatment
- **Depth cues** — shadows, bevels, gradients, transparency
- **Borders** — thickness, style, color, 3D effects
- **Typography** — font family, weight, size, letter-spacing
- **Spacing** — padding, margins, gap rhythms
- **Animation** — transition timing, easing curves, hover effects
- **Focus indicators** — glow rings, dotted rectangles, underlines

Two controls rendered in different visual modes can share zero visual properties in common while being driven by identical JavaScript code.

---

## 2.2 Mode 1: Classic Win32 / Visual Studio

**Era:** 1995–2005  
**Mood:** Professional, utilitarian, densely packed, physical  
**Fonts:** Tahoma 8pt, MS Sans Serif 8pt, Segoe UI 9pt  
**Target:** Enterprise applications, IDEs, system utilities

**SVG Illustrations:**  
- [svg-02-vs-classic-buttons.svg](./svg-02-vs-classic-buttons.svg) — all button states, toolbar, inputs, tabs  
- [svg-03-vs-classic-windows.svg](./svg-03-vs-classic-windows.svg) — MDI window, dialog, tool windows

### Core Visual Rules

| Property | Rule |
|----------|------|
| Border radius | `0px` everywhere – no rounded corners at all |
| Button borders | 4-edge 3D bevel: white top/left, dark-gray bottom/right |
| Input borders | Sunken 3D: dark top/left, light bottom/right (inverse of buttons) |
| Background | System gray `#ECE9D8` (XP) or `#D4D0C8` (Classic) |
| Shadows | None — depth is communicated entirely through beveled borders |
| Focus | Dotted 1px black rectangle _inside_ the control (marching ants) |
| Disabled | Embossed text (white shadow at +1,+1, gray text on top) |
| Title bars | Linear gradient, left-to-right (#0A246A → #3A6EA5 active, gray inactive) |
| Scrollbars | Chunky 17px wide, with arrow buttons at each end |
| Progress | Segmented green blocks with gaps between them |

### The 3D Border System

This is the defining visual feature of Win32 controls. Every interactive control is drawn with a multi-layer border that creates the illusion of light hitting a raised or sunken surface:

**Raised button (normal state):**
```
Layer 1 (outermost): #404040 (3DDarkShadow)     - bottom/right outer
Layer 2:             #FFFFFF (ButtonHighlight)    - top/left outer
Layer 3:             #808080 (ButtonShadow)       - bottom/right inner
Layer 4:             #F0F0F0 (3DLight)            - top/left inner
Layer 5 (face):      #D4D0C8 (ButtonFace)         - the flat center
```

**Sunken input (normal state):**
```
Layer 1 (outermost): #F0F0F0 (3DLight)            - bottom/right outer
Layer 2:             #808080 (ButtonShadow)        - top/left outer
Layer 3:             #FFFFFF (ButtonHighlight)      - bottom/right inner
Layer 4:             #404040 (3DDarkShadow)         - top/left inner
Layer 5 (face):      #FFFFFF (Window)               - the white interior
```

**Pressed button:** The layers swap — it becomes sunken:
```
Layer 1: #808080 top/left
Layer 2: #FFFFFF bottom/right
Layer 3: #404040 top/left  
Layer 4: #F0F0F0 bottom/right
Face:    #D4D0C8 (shifted 1px right and down)
Text:    shifted 1px right and down (tactile press feedback)
```

### CSS Implementation for jsgui3

```css
[data-theme="win32"] .jsgui-button {
    border: none;
    border-radius: 0;
    padding: 4px 12px;
    font-family: Tahoma, 'Segoe UI', sans-serif;
    font-size: 11px;
    background: var(--theme-color-surface);
    color: var(--theme-color-text);
    
    /* Raised 3D effect using box-shadow layers */
    box-shadow:
        /* Outer dark shadow bottom/right */
        inset -1px -1px 0 0 var(--theme-color-dark-shadow),
        /* Outer highlight top/left */
        inset 1px 1px 0 0 var(--theme-color-highlight),
        /* Inner dark shadow bottom/right */
        inset -2px -2px 0 0 var(--theme-color-shadow),
        /* Inner highlight top/left */
        inset 2px 2px 0 0 var(--theme-3d-light);
}

[data-theme="win32"] .jsgui-button:active {
    /* Pressed: invert the shadows */
    box-shadow:
        inset 1px 1px 0 0 var(--theme-color-shadow),
        inset -1px -1px 0 0 var(--theme-color-highlight),
        inset 2px 2px 0 0 var(--theme-color-dark-shadow);
    /* Shift text to simulate press */
    padding: 5px 11px 3px 13px;
}

[data-theme="win32"] .jsgui-button:focus-visible {
    /* Classic dotted focus rectangle */
    outline: 1px dotted #000;
    outline-offset: -4px;
}
```

### Control Adaptations in Win32 Mode

| Control | Win32 Adaptation |
|---------|-----------------|
| Button | Raised 3D, text shifts on press, dotted focus rect |
| Text Input | Sunken border, white background, no placeholder animation |
| Checkbox | 13×13px sunken box with simple checkmark path |
| Radio Button | 12px circle with sunken border, 4px filled dot when selected |
| Dropdown | Sunken input + 16px raised arrow button on the right side |
| Tab Control | Raised active tab extends below panel border; inactive tabs are 2px shorter |
| Group Box | Etched double-line border (dark then light, 1px gap) |
| Progress Bar | Chunky green (#00A000) blocks, 12px wide with 2px gaps |
| Scrollbar | 17px wide, raised arrow buttons, raised thumb, patterned track |
| Tree View | Dotted lines connecting nodes, +/- expansion icons in small boxes |
| List View | Alternating white and light-gray rows, blue highlight selection |
| Menu | Flat white background, blue highlight hover, keyboard shortcut right-aligned |
| Toolbar | Flat buttons that raise on hover (VS 2003 "cool" style) |
| Status Bar | Sunken sections at bottom, grip size handle at right edge |
| Window | Gradient title bar, minimize/maximize/close as small raised buttons |

---

## 2.3 Mode 2: Modern Dark

**Era:** 2018–present  
**Mood:** Sleek, premium, atmospheric, developer-oriented  
**Fonts:** Inter, system-ui, JetBrains Mono (code)  
**Target:** Developer tools, creative apps, dashboards

**SVG Illustrations:**  
- [svg-04-modern-dark-buttons.svg](./svg-04-modern-dark-buttons.svg) — gradient buttons, outlined, pill, icon  

### Core Visual Rules

| Property | Rule |
|----------|------|
| Border radius | `6–12px` — soft rounded corners |
| Button borders | None or 1px subtle with `rgba(255,255,255,0.1)` |
| Input borders | 1px `rgba(255,255,255,0.1)`, colored glow on focus |
| Background | Dark slate: `#0f172a`, `#1e293b` |
| Shadows | Colored shadows: `0 4px 14px rgba(102,126,234,0.15)` |
| Focus | 2px colored ring: `0 0 0 2px #3b82f6` |
| Disabled | Lower opacity (0.5), muted colors |
| Title bars | Dark flat, traffic-light or minimal buttons |
| Scrollbars | Thin 6px, rounded, semi-transparent, appear on hover |
| Progress | Smooth gradient bar with rounded ends |

### Design Principles

1. **Dark backgrounds absorb attention; colored elements draw the eye.** Only accent colors should be vivid.
2. **Borders are barely visible.** Use 1px `rgba(255,255,255,0.1)` — just enough to define edges.
3. **Shadows are colored by the element.** A blue button casts a blue shadow, not a black one.
4. **Text hierarchy through opacity.** Primary text: white. Secondary: `rgba(255,255,255,0.7)`. Tertiary: `rgba(255,255,255,0.5)`.
5. **Interactive states are smooth.** All state changes use `transition: all 200ms ease`.

### CSS Token Set

```css
[data-theme="modern-dark"] {
    --theme-color-bg: #0f172a;
    --theme-color-surface: #1e293b;
    --theme-color-surface-elevated: #334155;
    --theme-color-text: #f1f5f9;
    --theme-color-text-secondary: rgba(255,255,255,0.7);
    --theme-color-text-muted: rgba(255,255,255,0.5);
    --theme-color-primary: #667eea;
    --theme-color-primary-hover: #7c94f5;
    --theme-color-focus: #3b82f6;
    --theme-color-border: rgba(255,255,255,0.1);
    --theme-color-danger: #ef4444;
    --theme-color-success: #22c55e;
    --theme-color-warning: #f59e0b;
    --theme-radius-1: 6px;
    --theme-radius-2: 8px;
    --theme-radius-3: 12px;
    --theme-radius-full: 9999px;
    --theme-font-family-base: Inter, system-ui, -apple-system, sans-serif;
    --theme-font-size-base: 14px;
    --theme-transition-fast: 150ms ease;
    --theme-transition-normal: 200ms ease;
    --theme-shadow-1: 0 1px 3px rgba(0,0,0,0.3);
    --theme-shadow-2: 0 4px 14px rgba(0,0,0,0.3);
    --theme-shadow-primary: 0 4px 14px rgba(102,126,234,0.25);
}
```

---

## 2.4 Mode 3: Glassmorphism

**Era:** 2020–present (resurgence of Vista's Aero)  
**Mood:** Ethereal, layered, see-through, premium  
**Target:** Creative/music apps, landing pages, dashboards

**SVG Illustrations:**  
- [svg-05-glassmorphism-panels.svg](./svg-05-glassmorphism-panels.svg) — frosted panels, cards, status

### Core Visual Rules

| Property | Rule |
|----------|------|
| Surface fill | `rgba(255,255,255,0.08)` semi-transparent |
| Blur | `backdrop-filter: blur(16px) saturate(180%)` |
| Border | `1px solid rgba(255,255,255,0.18)` |
| Border radius | `16–24px` (generous rounding) |
| Shadows | Large, diffuse: `0 8px 32px rgba(0,0,0,0.3)` |
| Background | Colorful gradient or image that shows through the frosted surface |
| Text | White or near-white for maximum contrast against the translucent surface |

### Requirements

Glassmorphism requires:
1. A **colorful or gradient background** behind the frosted panels
2. `backdrop-filter` browser support (all modern browsers)
3. Careful contrast testing — text must remain readable over varying backgrounds

### CSS Implementation

```css
[data-theme="glass"] .jsgui-panel {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

[data-theme="glass"] .jsgui-button {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    transition: background 200ms ease;
}

[data-theme="glass"] .jsgui-button:hover {
    background: rgba(255, 255, 255, 0.2);
}
```

---

## 2.5 Mode 4: Neumorphism (Soft UI)

**Era:** 2019–present  
**Mood:** Soft, tactile, minimalist-yet-physical  
**Target:** Health/wellness apps, music players, smart home interfaces

### Core Visual Rules

| Property | Rule |
|----------|------|
| Background | Monochromatic — everything is the _same_ base color (`#e0e5ec`) |
| Depth | Created **entirely through shadows**, never through borders |
| Raised element | Light shadow top-left + dark shadow bottom-right |
| Sunken element | Inset light shadow + inset dark shadow |
| Border | None — borders destroy the neumorphic illusion |
| Border radius | `12–20px` (generously rounded) |
| Colors | Very muted accents, mostly monochrome |
| Text | Medium gray for harmony with background |

### The Shadow Formula

```css
/* Raised (convex) element */
.neu-raised {
    background: #e0e5ec;
    border: none;
    border-radius: 12px;
    box-shadow:
        6px 6px 12px #b8bec7,      /* Dark shadow, bottom-right */
        -6px -6px 12px #ffffff;      /* Light shadow, top-left */
}

/* Sunken (concave) element */
.neu-sunken {
    background: #e0e5ec;
    border: none;
    border-radius: 12px;
    box-shadow:
        inset 4px 4px 8px #b8bec7,
        inset -4px -4px 8px #ffffff;
}

/* Pressed button (transition from raised to sunken) */
.neu-raised:active {
    box-shadow:
        inset 4px 4px 8px #b8bec7,
        inset -4px -4px 8px #ffffff;
}
```

### Neumorphism vs. Win32 Skeuomorphism

Both create 3D depth, but the mechanics are completely different:

| Aspect | Win32 3D | Neumorphism |
|--------|----------|-------------|
| Depth cue | Hard-edged beveled borders | Soft diffuse shadows |
| Surface | Visible, textured (ButtonFace) | Invisible, same as background |
| Borders | The primary visual element | Completely absent |
| Color palette | Multi-color (gray surface, white highlight, dark shadow) | Monochrome (one base color) |
| Corner treatment | Sharp 90° angles | Generously rounded |
| Contrast | High (black text on gray, white highlights) | Low (everything is harmonious) |

---

## 2.6 Mode 5: Enterprise / Data-Dense

**Era:** Timeless  
**Mood:** Efficient, compact, information-first  
**Target:** Admin dashboards, trading terminals, data management

### Core Visual Rules

| Property | Rule |
|----------|------|
| Font size | `12px` (smaller than default) |
| Line height | `1.2–1.4` (compact) |
| Padding | `2–4px` (tight) |
| Border radius | `2–4px` (barely rounded) |
| Colors | Muted, professional (gray/blue palette) |
| Borders | Thin but visible (`1px solid #d1d5db`) |
| Shadows | None or minimal (`0 1px 2px rgba(0,0,0,0.05)`) |
| Info density | Maximum — more data per pixel than any other mode |

### Token Set

```css
[data-theme="enterprise"] {
    --theme-font-size-base: 12px;
    --theme-line-height: 1.25;
    --theme-space-1: 2px;
    --theme-space-2: 4px;
    --theme-space-3: 6px;
    --theme-space-4: 8px;
    --theme-radius-1: 2px;
    --theme-radius-2: 3px;
    --theme-color-bg: #f8fafc;
    --theme-color-surface: #ffffff;
    --theme-color-border: #d1d5db;
    --theme-color-text: #374151;
}
```

---

## 2.7 Mode Comparison Table

| Property | Win32 Classic | Modern Dark | Glassmorphism | Neumorphism | Enterprise |
|----------|:------------:|:-----------:|:-------------:|:-----------:|:----------:|
| Border radius | 0px | 6–12px | 16–24px | 12–20px | 2–4px |
| Borders | Beveled 3D | Subtle 1px | 1px glass | None | Thin 1px |
| Shadows | None | Colored | Large diffuse | Light+dark pair | Minimal |
| Background | System gray | Dark slate | Semi-transparent | Monochrome | White/light |
| Focus style | Dotted rect | Glow ring | Glow ring | Subtle glow | Blue outline |
| Font | Tahoma 8pt | Inter 14px | System 14px | System 14px | System 12px |
| Depth model | 3D borders | Z-elevation | Layer stacking | Shadow depth | Flat |
| Animations | None | 200ms ease | 300ms ease | 250ms ease | 150ms ease |

---

## 2.8 How Controls Adapt to Visual Modes

Every control in jsgui3-html adapts to visual modes through three levels:

```
┌──────────────────────────────────────────┐
│  Level 1: Theme Tokens                    │  All controls respond to token changes
│  Colors, spacing, radii, fonts            │  (color-bg, radius-1, font-family, etc.)
│  → Changes appearance, not structure      │
├──────────────────────────────────────────┤
│  Level 2: Variant Parameters              │  Control-specific style presets
│  Resolved from variant registries         │  (button 'raised' vs 'flat' vs 'ghost')
│  → Changes rendering style               │
├──────────────────────────────────────────┤
│  Level 3: Structural Composition          │  DOM structure changes
│  Compositional model adapts               │  (title bar button layout changes)
│  → Changes the control's HTML structure   │
└──────────────────────────────────────────┘
```

**For most controls**, only Level 1 changes between visual modes. The CSS variables do all the work.

**For some controls**, Level 2 is needed. A Button's `variant` might switch from `'raised'` (Win32) to `'filled'` (Modern) to `'soft'` (Neumorphic).

**For a few controls**, Level 3 is required. The Window control's title bar has platform-specific button layouts:
- Win32: minimize □ maximize □ close ✕ — all as small raised rectangles, right-aligned
- macOS: 🔴 🟡 🟢 — traffic light circles, left-aligned
- Modern: just an ✕ close button
- Windows 11: ─ □ × — flat icons, right-aligned, with rounded mica backdrop

---

## 2.9 Designing for Multiple Modes: The Checklist

When creating or modifying a control, verify it works across all targeted modes:

### Shape & Layout
- [ ] Does it render correctly with `border-radius: 0px`?
- [ ] Does it render correctly with `border-radius: 16px`?
- [ ] Does it handle both tight (2px) and generous (12px) padding?
- [ ] Are all sizes relative to tokens, never hardcoded?

### Color & Contrast
- [ ] Does it work on both light (`#f8fafc`) and dark (`#0f172a`) backgrounds?
- [ ] Is text readable over all surface colors?
- [ ] Does the focus indicator contrast with every background?
- [ ] Are disabled states visually distinct from enabled states?

### Depth & Shadows
- [ ] Does it look correct without _any_ shadows (flat mode)?
- [ ] Does it look correct with beveled 3D borders (Win32 mode)?
- [ ] Does it look correct with soft neumorphic shadows?
- [ ] Does it look correct on a glass/blurred background?

### Interaction States
- [ ] Is hover visually distinct from normal?
- [ ] Is active/pressed visually distinct from hover?
- [ ] Is focus visually distinct from active?
- [ ] Is disabled obviously non-interactive?

### Typography
- [ ] Does it look correct with Tahoma 11px (Win32)?
- [ ] Does it look correct with Inter 14px (Modern)?
- [ ] Does it look correct with 12px (Enterprise)?
- [ ] Does text truncate/ellipsis gracefully?
