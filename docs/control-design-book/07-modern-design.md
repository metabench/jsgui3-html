# Chapter 7: Modern Design Patterns

> Dark mode, glassmorphism, neumorphism, micro-animations, gradient science,  
> and the techniques that make a UI feel premium and alive.

---

## 7.1 The Modern Dark Aesthetic

Modern dark UIs (VS Code, Figma, Linear, Vercel Dashboard, Raycast, Arc Browser) share a visual grammar that goes far beyond "make the background black." These interfaces feel premium because every visual decision is intentional.

### Color Architecture

Dark themes use a **layered surface system** where depth is communicated through brightness:

```
Level 0:  #0f172a  (deepest background, page-level)
Level 1:  #1e293b  (primary surface, cards, panels)
Level 2:  #334155  (elevated, dropdowns, popovers)
Level 3:  #475569  (highest, tooltips, floating elements)
```

Each level is ~20% lighter than the previous. This creates an implicit stacking order without using box-shadows for every element.

**Why this works:** In the real world, objects that are closer to us (closer to the light source overhead) are brighter. Dark UIs mimic this: elements that float higher are lighter.

### The Dark Background Trap

A common mistake is making the background pure black (`#000000`). This creates problems:

| Background | Problem | Better Alternative |
|-----------|---------|-------------------|
| `#000000` (pure black) | Too harsh on OLED screens — creates a "hole in the screen" effect. Text contrast is eye-fatiguing. | `#0f172a` (dark navy) |
| `#111111` (near black) | Slightly better but still too stark for most UIs. | `#1a1a2e` (dark desaturated navy) |
| `#1e1e1e` (VS Code dark) | Good for code editors where text density is high. | Appropriate for IDE-style UIs |
| `#0f172a` (Tailwind slate) | Rich, warm-dark with a subtle blue undertone. Easy on the eyes for long sessions. | **Recommended default** |

### Accent Color Science

The accent color (#667eea purple-blue) is not chosen randomly. On dark backgrounds:

- **Cool blues and purples** feel natural — they harmonize with the dark background
- **Warm oranges and reds** create high contrast — good for alerts but eye-fatiguing for primary actions
- **Greens** should be cool-toned — use `#22c55e` not `#00ff00`
- **Yellows** should lean amber — `#f59e0b` not `#ffff00` (pure yellow is blinding on dark)

### Color Palette Generation

For generating harmonious palettes from a single accent color, prefer **OKLCH** over HSL:

```css
/* HSL: perceptually uneven — same ΔL produces different visual lightness */
--primary-50:  hsl(231, 77%, 95%);  /* looks odd — too saturated */
--primary-500: hsl(231, 77%, 55%);
--primary-900: hsl(231, 77%, 15%);  /* looks muddy */

/* OKLCH: perceptually uniform — same ΔL produces even visual steps */
--primary-50:  oklch(0.95 0.04 268);  /* soft, natural */
--primary-500: oklch(0.62 0.14 268);
--primary-900: oklch(0.25 0.08 268);  /* deep, rich */
```

### Text Opacity Hierarchy

Instead of choosing different gray values for text levels, use opacity on white:

```css
--text-primary:   rgba(255, 255, 255, 1.0);    /* Headings, key content */
--text-secondary: rgba(255, 255, 255, 0.7);    /* Labels, descriptions */
--text-tertiary:  rgba(255, 255, 255, 0.5);    /* Placeholders, hints */
--text-disabled:  rgba(255, 255, 255, 0.3);    /* Disabled text */
--text-ghost:     rgba(255, 255, 255, 0.15);   /* Barely visible dividers */
```

This ensures text adapts correctly to any surface color. If you change the surface from `#1e293b` to `#2d1b3d` (dark purple), the text hierarchy still works because it's opacity-based, not absolute-color-based.

### Border Philosophy

In dark mode, borders should be nearly invisible — just enough to define edges:

```css
/* Primary border: barely visible */
--border-default: rgba(255, 255, 255, 0.08);

/* Hoverable border: slightly more visible on hover */
--border-hover: rgba(255, 255, 255, 0.15);

/* Focus border: clearly visible for accessibility */
--border-focus: rgba(59, 130, 246, 0.8);

/* Divider: even subtler than borders */
--border-divider: rgba(255, 255, 255, 0.05);
```

**Key insight:** In dark mode, borders are **additive** (lighter than the surface). In light mode, borders are **subtractive** (darker than the surface). This is why a single border-color token that works in both modes is nearly impossible — you need mode-specific values or opacity-based borders.

---

## 7.2 Shadow Design

### Why Shadows Matter on Dark Backgrounds

On light backgrounds, shadows create depth by darkening the surface below. On dark backgrounds, this barely works — you can't darken what's already dark. Instead, dark-mode shadows serve two purposes:

1. **Edge definition** — a dark halo around floating elements separates them from the background
2. **Color glow** — colored shadows tinted with the element's accent color create a premium feel

### Layered Shadows

Premium dark UIs use **multiple shadow layers** for natural-looking depth:

```css
/* Cheap shadow (one layer — looks flat and artificial) */
.shadow-cheap {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* Premium shadow (three layers — mimics real light diffusion) */
.shadow-premium {
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.3),      /* Tight contact shadow */
        0 4px 8px rgba(0, 0, 0, 0.2),       /* Medium diffuse */
        0 12px 28px rgba(0, 0, 0, 0.15);    /* Large ambient */
}

/* Elevated shadow (for floating elements like dropdowns) */
.shadow-elevated {
    box-shadow:
        0 0 1px rgba(0, 0, 0, 0.5),         /* Crisp edge definition */
        0 2px 4px rgba(0, 0, 0, 0.3),       /* Contact shadow */
        0 8px 16px rgba(0, 0, 0, 0.25),     /* Medium lift */
        0 24px 48px rgba(0, 0, 0, 0.2);     /* Ambient distance */
}
```

**Why three layers?** In the physical world, a single light source creates:
1. A **contact shadow** directly under the object (sharp, dark)
2. A **penumbra** around the contact shadow (softer, medium)
3. An **ambient occlusion** across a large area (very diffuse, subtle)

CSS `box-shadow` with one declaration can't replicate all three. Multiple shadow declarations, each with different offset/blur/spread values, produce far more realistic depth.

### Colored Shadows

Elements can cast shadows tinted with their own color. This is the technique that most distinguishes premium UIs from amateur ones:

```css
.button-primary {
    background: #667eea;
    box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.2),             /* Neutral base */
        0 4px 14px rgba(102, 126, 234, 0.25);      /* Purple tint */
}

.badge-danger {
    background: #ef4444;
    box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.2),
        0 4px 12px rgba(239, 68, 68, 0.3);         /* Red tint */
}

.card-success {
    border: 1px solid rgba(34, 197, 94, 0.3);
    box-shadow:
        0 0 12px rgba(34, 197, 94, 0.08),          /* Green ambient glow */
        0 4px 16px rgba(0, 0, 0, 0.2);
}
```

**How to calculate the colored shadow:** Take the element's primary color, reduce opacity to 20–30%, and use it as the shadow color. Layer it on top of a neutral dark shadow for the ambient contribution.

### Shadow Tokens

```css
/* Dark mode shadow tokens */
--shadow-xs:  0 1px 2px rgba(0,0,0,0.3);
--shadow-sm:  0 1px 3px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2);
--shadow-md:  0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2);
--shadow-lg:  0 4px 8px rgba(0,0,0,0.3), 0 12px 28px rgba(0,0,0,0.15);
--shadow-xl:  0 0 1px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.25), 0 24px 48px rgba(0,0,0,0.2);

/* Light mode shadow tokens */
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:  0 1px 3px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.04);
--shadow-md:  0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.06);
--shadow-lg:  0 4px 8px rgba(0,0,0,0.07), 0 12px 28px rgba(0,0,0,0.1);
--shadow-xl:  0 0 1px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1), 0 24px 48px rgba(0,0,0,0.1);
```

---

## 7.3 Micro-Animations

Animations should be functional, not decorative. Every animation must communicate something to the user:

| Animation | Communicates |
|-----------|-------------|
| Hover elevation | "This element is interactive — you can click it" |
| Press squish | "Your click was registered" |
| Focus ring fade-in | "Keyboard focus is here" |
| Slide-in | "New content appeared from this direction" |
| Fade-out | "This element is leaving" |
| Spinner rotation | "Processing is happening" |
| Progress crawl | "Work is advancing at this rate" |
| Skeleton shimmer | "Content is loading and this is where it will appear" |
| Tooltip delay | "Hover is intentional, not just passing through" |
| Accordion expand | "More content is being revealed below" |
| Shake | "That action was invalid" |

### Timing Guidelines

| Timing | Duration | Easing | Use Case |
|--------|----------|--------|----------|
| **Instant** | 0ms | — | Win32 classic (no animations ever) |
| **Snappy** | 100–150ms | `ease-out` | Hover states, small color changes, tooltip show |
| **Smooth** | 200–250ms | `ease` | Focus changes, elevation, button press |
| **Flowing** | 300–400ms | `ease-in-out` | Panel expand/collapse, accordion, slide transitions |
| **Dramatic** | 500ms+ | `cubic-bezier(0.4, 0, 0.2, 1)` | Page transitions, modal enter, hero animations |

**The 200ms rule:** Most UI state transitions should be 200ms. Faster and the user can't perceive the change was smooth. Slower and the UI feels sluggish. 200ms is the sweet spot where the brain registers "smooth transition" without registering "waiting."

### Custom Easing Curves

```css
/* Spring-like bounce for playful UIs (overshoots then settles) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Smooth deceleration for entering elements (fast start, graceful stop) */
--ease-enter: cubic-bezier(0, 0, 0.2, 1);

/* Quick acceleration for leaving elements (slow start, fast exit) */
--ease-exit: cubic-bezier(0.4, 0, 1, 1);

/* Material Design standard curve (natural acceleration/deceleration) */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

/* Apple-style fluid curve (very smooth, slightly slow) */
--ease-apple: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### Button Animation Example (Complete)

```css
.jsgui-button {
    /* Combine multiple transition properties with appropriate timings */
    transition:
        background-color 150ms ease,
        box-shadow 200ms ease,
        transform 100ms ease,
        border-color 150ms ease;
    
    /* Prepare the GPU for transforms */
    will-change: transform;
}

.jsgui-button:hover {
    /* Subtle lift + colored shadow glow */
    box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.2),
        0 4px 14px var(--button-shadow-color, rgba(102, 126, 234, 0.3));
    transform: translateY(-1px);
}

.jsgui-button:active {
    /* Subtle press + minimal shadow */
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    transform: translateY(0) scale(0.98);
    /* Shorter transition for press — should feel instant */
    transition-duration: 50ms;
}

.jsgui-button:focus-visible {
    /* Focus ring fades in */
    box-shadow:
        0 0 0 2px var(--theme-color-bg),         /* Gap ring (same as bg) */
        0 0 0 4px var(--theme-color-focus);        /* Blue focus ring */
    outline: none;
}
```

### Reduce Motion

Always respect the user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

### Common Animation Patterns

#### Skeleton Loading Shimmer

```css
.skeleton {
    background: linear-gradient(
        90deg,
        var(--theme-color-surface) 25%,
        var(--theme-color-surface-elevated) 50%,
        var(--theme-color-surface) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: var(--theme-radius-1);
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

#### Tooltip Entrance

```css
.tooltip {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
    transition: opacity 150ms ease, transform 150ms ease;
    pointer-events: none;
}

.tooltip.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
}
```

#### Accordion Expand

```css
.accordion-content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 300ms ease-in-out;
}

.accordion-content.expanded {
    grid-template-rows: 1fr;
}

.accordion-content > .inner {
    overflow: hidden;
}
```

This uses CSS Grid's `fr` unit for smooth height animations without knowing the content height — a superior technique to `max-height` hacks.

#### Notification Badge Bounce

```css
.badge {
    animation: badge-enter 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes badge-enter {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
}
```

---

## 7.4 Glassmorphism Deep Dive

Glassmorphism creates frosted-glass panels that let background content show through, producing a ethereal, layered aesthetic.

### The Recipe

```css
.glass-panel {
    /* Semi-transparent background — the "frost" */
    background: rgba(255, 255, 255, 0.08);
    
    /* Frosted glass blur — the key property */
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    
    /* Subtle border for edge definition */
    border: 1px solid rgba(255, 255, 255, 0.18);
    
    /* Generous rounding — glass panels feel organic */
    border-radius: 16px;
    
    /* Soft shadow for floating depth */
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
}
```

### Requirements for Good Glassmorphism

1. **Colorful background** — a plain flat background makes the blur invisible; you need a gradient or image behind the glass panels
2. **Sufficient translucency** — `rgba(255,255,255,0.05)` to `0.15` range is the sweet spot. Too opaque defeats the effect; too transparent makes text unreadable
3. **High blur radius** — 12px minimum, 16–20px ideal. Lower blur looks like a dirty window
4. **Border** — without a border, the panel's edges are invisible against the background. Use `rgba(255,255,255,0.18)` for a subtle glass edge
5. **Not too many layers** — stacking glass panels degrades readability fast. Maximum 2 levels of glass

### Top-Edge Highlight

A common refinement: add a brighter top edge to simulate light catching the glass surface:

```css
.glass-panel {
    /* ... base styles ... */
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
```

This graded border creates the illusion of light falling from the top-left, matching the same light-source convention as Win32's beveled borders (but far subtler).

### Dark Glass vs. Light Glass

```css
/* Dark glass (for dark backgrounds — most common) */
.glass-dark {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Light glass (for light backgrounds) */
.glass-light {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Colored glass (tinted with accent color) */
.glass-accent {
    background: rgba(102, 126, 234, 0.15);
    backdrop-filter: blur(16px) saturate(200%);
    border: 1px solid rgba(102, 126, 234, 0.2);
}
```

### The Background: Making Glass Shine

Glass is only as good as the background it sits on. Common patterns:

```css
/* Mesh gradient background */
.glass-container {
    background:
        radial-gradient(at 20% 80%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
        radial-gradient(at 80% 20%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
        radial-gradient(at 50% 50%, rgba(17, 153, 142, 0.3) 0%, transparent 50%),
        #0f172a;
}

/* Animated gradient background */
.glass-container-animated {
    background: linear-gradient(-45deg, #667eea, #764ba2, #22c55e, #3b82f6);
    background-size: 400% 400%;
    animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
```

### Performance Considerations

`backdrop-filter` is expensive. For each element with `backdrop-filter`:
1. The browser renders everything behind the element
2. Applies the blur filter (GPU-intensive)
3. Composites the result

Tips:
- Limit to 3–5 glass elements per viewport
- Avoid glass on rapidly changing content (video, canvas animations)
- Use `will-change: backdrop-filter` sparingly — it increases memory usage
- Test on lower-powered devices (mobile, older laptops)

**SVG Reference:** [svg-05-glassmorphism-panels.svg](./svg-05-glassmorphism-panels.svg)

---

## 7.5 Neumorphism Deep Dive

Neumorphism ("new skeuomorphism") creates volume through paired shadows on a monochromatic surface. It's the most tactile of modern styles.

### The Core Technique

Every surface is the **same color** as its background. Depth comes entirely from shadows:

```css
:root {
    --neu-bg: #e0e5ec;
    --neu-shadow-dark: #b8bec7;
    --neu-shadow-light: #ffffff;
    --neu-radius: 16px;
}

/* Raised (convex) — button normal state */
.neu-raised {
    background: var(--neu-bg);
    border: none;
    border-radius: var(--neu-radius);
    box-shadow:
        8px 8px 16px var(--neu-shadow-dark),
        -8px -8px 16px var(--neu-shadow-light);
}

/* Sunken (concave) — input field, pressed button */
.neu-pressed {
    background: var(--neu-bg);
    border: none;
    border-radius: var(--neu-radius);
    box-shadow:
        inset 4px 4px 8px var(--neu-shadow-dark),
        inset -4px -4px 8px var(--neu-shadow-light);
}

/* Flat (flush with surface) — neutral/inactive */
.neu-flat {
    background: var(--neu-bg);
    border: none;
    border-radius: var(--neu-radius);
    box-shadow: none;
}
```

### The Shadow Math

The shadow colors are derived from the background color:

```
Base color:    #e0e5ec  →  HSL(216, 18%, 89%)
Dark shadow:   HSL(216, 18%, 77%)  →  #b8bec7  (12% darker)
Light shadow:  HSL(216, 18%, 100%) →  #ffffff  (clipped to white)
```

**Rule of thumb:** Dark shadow = base lightness minus 12%. Light shadow = white (or base lightness plus 10%, capped at 100%).

### Dark Neumorphism

Neumorphism works on dark backgrounds with adjusted shadow math:

```css
:root {
    --neu-bg-dark: #2d3436;
    --neu-shadow-dark-mode: #1a1f20;     /* 14% darker */
    --neu-shadow-light-mode: #404748;    /* 12% lighter */
}

.neu-dark-raised {
    background: var(--neu-bg-dark);
    box-shadow:
        6px 6px 12px var(--neu-shadow-dark-mode),
        -6px -6px 12px var(--neu-shadow-light-mode);
}
```

### Component Examples

#### Neumorphic Button (Full)

```css
.neu-button {
    background: var(--neu-bg);
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    
    /* Raised state */
    box-shadow:
        6px 6px 14px var(--neu-shadow-dark),
        -6px -6px 14px var(--neu-shadow-light);
    
    transition: box-shadow 200ms ease;
}

.neu-button:hover {
    /* Slightly stronger shadows on hover */
    box-shadow:
        8px 8px 18px var(--neu-shadow-dark),
        -8px -8px 18px var(--neu-shadow-light);
}

.neu-button:active {
    /* Transition to sunken (inset) */
    box-shadow:
        inset 4px 4px 8px var(--neu-shadow-dark),
        inset -4px -4px 8px var(--neu-shadow-light);
}
```

#### Neumorphic Toggle Switch

```css
.neu-toggle {
    width: 56px;
    height: 28px;
    border-radius: 14px;
    background: var(--neu-bg);
    position: relative;
    cursor: pointer;
    
    /* Sunken track */
    box-shadow:
        inset 3px 3px 6px var(--neu-shadow-dark),
        inset -3px -3px 6px var(--neu-shadow-light);
}

.neu-toggle-thumb {
    width: 24px;
    height: 24px;
    border-radius: 12px;
    background: var(--neu-bg);
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 200ms ease;
    
    /* Raised thumb */
    box-shadow:
        3px 3px 6px var(--neu-shadow-dark),
        -3px -3px 6px var(--neu-shadow-light);
}

.neu-toggle.on .neu-toggle-thumb {
    transform: translateX(28px);
}
```

#### Neumorphic Input Field

```css
.neu-input {
    background: var(--neu-bg);
    border: none;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 14px;
    color: #6b7280;
    
    /* Sunken (concave) — text sits in a groove */
    box-shadow:
        inset 3px 3px 6px var(--neu-shadow-dark),
        inset -3px -3px 6px var(--neu-shadow-light);
}

.neu-input:focus {
    /* Add subtle accent glow on focus */
    box-shadow:
        inset 3px 3px 6px var(--neu-shadow-dark),
        inset -3px -3px 6px var(--neu-shadow-light),
        0 0 0 2px rgba(102, 126, 234, 0.3);
    outline: none;
}
```

### Neumorphism vs. Win32 Skeuomorphism

Both create 3D depth, but the mechanics are completely different:

| Aspect | Win32 3D | Neumorphism |
|--------|----------|-------------|
| Depth cue | Hard-edged beveled borders (1–2px lines) | Soft diffuse shadows (8–16px blur) |
| Surface | Visible, textured (ButtonFace gray) | Invisible, indistinguishable from background |
| Borders | The primary visual element | Completely absent |
| Color palette | Multi-color (gray surface, white highlight, dark shadow) | Monochrome (one base color, two shadow tints) |
| Corner treatment | Sharp 90° angles | Generously rounded (12–20px) |
| Contrast | High (black text on gray, white highlights) | Low (everything is harmonious) |
| Information density | High — tight spacing, sharp boundaries | Low — needs generous padding and spacing |
| History | Born from hardware constraints (256-color screens) | Born from design aesthetics (post-flat reaction) |

### Limitations of Neumorphism

- **Accessibility issues** — low contrast between surface and background makes boundaries hard to see for visually impaired users
- **Does not work with rich colors** — the monochromatic constraint is fundamental; accent colors break the illusion
- **Nested elements are tricky** — inner shadows inside outer shadows create visual confusion
- **Best for simple UIs** — buttons, cards, toggles, sliders. Not suitable for complex data tables or text-heavy interfaces
- **Touch targets are ambiguous** — without borders, it's hard to communicate the exact tap area on mobile

---

## 7.6 Gradient Design

### Button Gradients

```css
/* Subtle gradient (recommended — almost solid but with depth suggestion) */
.gradient-subtle {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Bold gradient (eye-catching CTA, use sparingly) */
.gradient-bold {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* Metallic gradient (gives buttons a 3D shine) */
.gradient-metallic {
    background: linear-gradient(
        180deg,
        rgba(255,255,255,0.15) 0%,
        transparent 40%,
        transparent 60%,
        rgba(0,0,0,0.1) 100%
    ),
    linear-gradient(135deg, #667eea, #764ba2);
}

/* Mesh gradient (advanced — multiple radial gradients layered) */
.gradient-mesh {
    background:
        radial-gradient(at 20% 80%, #667eea33 0%, transparent 50%),
        radial-gradient(at 80% 20%, #764ba233 0%, transparent 50%),
        radial-gradient(at 50% 50%, #11998e33 0%, transparent 50%),
        #0f172a;
}
```

### Gradient Directions and Their Moods

| Direction | Angle | Mood |
|-----------|-------|------|
| Top → Bottom | `180deg` | Classic, stable, safe |
| Top-left → Bottom-right | `135deg` | Dynamic, modern (most popular) |
| Left → Right | `90deg` | Progressive, movement |
| Circular radial | `radial-gradient` | Focused, spotlight |
| Conic | `conic-gradient` | Unusual, artistic |

### Border Gradients

CSS doesn't support `border-image` with `border-radius`, so use the `background-clip` trick:

```css
/* Gradient border using background-clip */
.gradient-border {
    background:
        linear-gradient(var(--theme-color-surface), var(--theme-color-surface)) padding-box,
        linear-gradient(135deg, #667eea, #764ba2) border-box;
    border: 2px solid transparent;
    border-radius: 8px;
}

/* Animated gradient border */
.gradient-border-animated {
    background:
        linear-gradient(var(--theme-color-surface), var(--theme-color-surface)) padding-box,
        linear-gradient(var(--angle, 135deg), #667eea, #764ba2, #22c55e) border-box;
    border: 2px solid transparent;
    border-radius: 8px;
    animation: border-rotate 3s linear infinite;
}

@keyframes border-rotate {
    to { --angle: 495deg; }
}
@property --angle {
    syntax: '<angle>';
    initial-value: 135deg;
    inherits: false;
}
```

### Text Gradients

```css
.gradient-text {
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

---

## 7.7 Focus Indicators Across Modes

Focus indicators are critical for accessibility. Each visual mode needs a distinct approach that is both **visible** and **aesthetic**:

| Mode | Focus Style | CSS | Why |
|------|------------|-----|-----|
| Win32 | Dotted rect | `outline: 1px dotted #000; outline-offset: -4px;` | Classic, high contrast, inside the control |
| Modern Dark | Glow ring | `box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px #3b82f6;` | Double ring creates gap for contrast |
| Glassmorphism | Bright ring | `box-shadow: 0 0 0 2px rgba(59,130,246,0.8);` | Must be bright against blurred bg |
| Neumorphism | Subtle glow | `box-shadow: 0 0 8px rgba(59,130,246,0.5), (inset shadows);` | Combines with existing neumorphic shadows |
| Enterprise | Solid outline | `outline: 2px solid #2563eb; outline-offset: 2px;` | Professional, high visibility |

### The Double-Ring Technique

The most polished focus indicator uses two concentric rings: an inner gap ring matching the background color, and an outer accent ring:

```css
.focus-ring:focus-visible {
    outline: none;  /* Remove default outline */
    box-shadow:
        0 0 0 2px var(--theme-color-surface),  /* Gap ring */
        0 0 0 4px var(--theme-color-focus);     /* Focus ring */
}
```

The gap ring ensures the focus ring is visible even against backgrounds that are similar to the focus color. This is the technique used by GitHub, Radix UI, and Shadcn.

---

## 7.8 Typography for Premium Feel

### Font Selection

The font is one of the strongest signals of a premium UI. System defaults (Arial, Times) immediately convey "default/undesigned." A curated font stack costs nothing but transforms perception:

```css
/* Premium sans-serif stack */
font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;

/* Premium monospace for code */
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code',
    'Source Code Pro', 'Consolas', monospace;
```

**Why Inter?** Inter was designed specifically for computer screens. It has features like:
- Tabular numbers (`font-feature-settings: "tnum"`) for aligned columns
- Contextual alternates for better legibility at small sizes
- A full weight range (100–900) for fine-grained hierarchy

### Type Scale

A consistent scale creates visual harmony:

```css
--font-size-2xs: 10px;   /* Footnotes, legal text */
--font-size-xs:  11px;   /* Badges, labels */
--font-size-sm:  12px;   /* Secondary text, captions */
--font-size-base: 14px;  /* Body text, form fields */
--font-size-md:  16px;   /* Emphasized body, large labels */
--font-size-lg:  18px;   /* Section headings */
--font-size-xl:  24px;   /* Page headings */
--font-size-2xl: 30px;   /* Hero headings */
--font-size-3xl: 36px;   /* Display headings */
```

This is approximately a **1.25 major second** scale. Each step is 1.25× the previous, rounded to nice pixel values.

### Letter Spacing

Detailed letter-spacing dramatically improves readability:

```css
/* Tight for large headings (they already have enough visual weight) */
h1, h2, h3 { letter-spacing: -0.025em; }

/* Normal for body text */
body { letter-spacing: 0; }

/* Wide for small labels and captions (aids legibility at small sizes) */
.label {
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 11px;
    font-weight: 500;
}
```

### Font Weight as Structure

Instead of relying on borders and backgrounds for hierarchy, use font weight:

```css
.heading { font-weight: 600; }    /* Semi-bold: clear hierarchy */
.body { font-weight: 400; }       /* Regular: readable body text */
.label { font-weight: 500; }      /* Medium: distinguishable but not heavy */
.caption { font-weight: 400; opacity: 0.7; }  /* Regular + reduced opacity */
```

### Numeric Typography

For dashboards and data-heavy UIs, use tabular (monospaced) numbers:

```css
.data-cell {
    font-feature-settings: "tnum";  /* Tabular numbers — digits align vertically */
    font-variant-numeric: tabular-nums;
}

.price {
    font-feature-settings: "tnum", "salt";  /* Tabular + stylistic alternates */
}
```

---

## 7.9 Interactive States: The Complete Set

Every interactive element should have exactly these states with clear visual transitions between them:

| State | Trigger | Visual Change | Example (button) |
|-------|---------|--------------|-----------------|
| **Normal** | Default | Base appearance | Solid fill, standard shadow |
| **Hover** | Mouse enters | Lighter fill, elevated shadow, cursor: pointer | `translateY(-1px)`, stronger shadow |
| **Active/Pressed** | Mouse down | Darker fill, no shadow, pressed feel | `scale(0.98)`, no shadow |
| **Focus** | Tab key | Visible ring around element | 2px blue ring with gap |
| **Focus + Hover** | Tab then mouse | Ring + hover changes combined | Ring + lighter fill |
| **Disabled** | `disabled` attr | Muted colors, no cursor change | 50% opacity, `cursor: not-allowed` |
| **Loading** | Async operation | Spinner replaces content, no interaction | Spinner animation, disabled |
| **Error** | Validation fail | Red border/shadow, error message | Red ring, shake animation |

### The Full CSS

```css
.jsgui-button {
    /* Normal */
    background: var(--theme-color-primary);
    color: var(--theme-color-primary-text);
    border-radius: var(--theme-radius-2);
    padding: 8px 16px;
    cursor: pointer;
    transition: all 200ms ease;
    position: relative;
}

/* Hover */
.jsgui-button:hover:not(:disabled) {
    background: var(--theme-color-primary-hover);
    box-shadow: 0 4px 14px var(--button-shadow-color);
    transform: translateY(-1px);
}

/* Active */
.jsgui-button:active:not(:disabled) {
    background: var(--theme-color-primary);
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    transform: translateY(0) scale(0.98);
    transition-duration: 50ms;
}

/* Focus */
.jsgui-button:focus-visible {
    box-shadow: 0 0 0 2px var(--theme-color-bg), 0 0 0 4px var(--theme-color-focus);
    outline: none;
}

/* Disabled */
.jsgui-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

/* Loading */
.jsgui-button[data-loading="true"] {
    pointer-events: none;
    opacity: 0.8;
}
.jsgui-button[data-loading="true"]::after {
    content: '';
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 600ms linear infinite;
    margin-left: 8px;
    display: inline-block;
    vertical-align: middle;
}

/* Error shake */
.jsgui-button.error {
    animation: shake 300ms ease;
    box-shadow: 0 0 0 2px var(--theme-color-danger);
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
}
```
