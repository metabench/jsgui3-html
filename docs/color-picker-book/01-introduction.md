# Chapter 1: Introduction & Vision

## Why a Great Color Picker Matters

A color picker is one of the most universally needed UI controls. Nearly every design tool, theme editor, rich text editor, charting system, and creative application requires one. Yet most framework implementations offer only the bare minimum — a single hue-saturation square with a brightness slider.

A *perfect* color picker goes further. It recognises that different users think about color in different ways:

- **Designers** think in HSL or HSV — adjusting hue, saturation, and lightness independently.
- **Developers** often work with hex codes (`#3A86FF`) or RGB tuples.
- **Casual users** want to pick from a curated palette of named swatches.
- **Brand managers** need to enter exact values and verify contrast ratios.
- **Artists** want a visual, intuitive spectrum they can explore freely.

A truly great color picker doesn't force one model. It provides multiple modes and lets the user switch between them seamlessly.

## What "Perfect" Looks Like

The perfect jsgui3 color picker is:

### Composable
Not a monolithic widget, but a family of focused controls that can be used independently or composed together:

| Control | Description |
|---------|-------------|
| `Swatch_Grid` | Click-to-select from a grid of preset colors |
| `HSL_Wheel` | Circular hue wheel with saturation/lightness area |
| `Gradient_Area` | 2D saturation-brightness rectangle with hue slider |
| `Channel_Sliders` | RGB or HSL sliders with numeric inputs |
| `Hex_Input` | Direct hex/RGB/HSL text entry with validation |
| `Color_Picker` | Tabbed composite combining any of the above |

### Consistent
Every mode emits the same `color-change` event with a normalised color value object. Switching tabs preserves the selected color. The API for getting/setting a color is identical regardless of which mode is active.

### Themeable
Uses the jsgui3 theme system with CSS custom properties. Works in light mode, dark mode, high contrast. Respects the global design token scale for sizes and spacing.

### Accessible
Full keyboard navigation. ARIA labels for all interactive regions. Screen reader announcements for color changes. Sufficient contrast in the controls themselves.

### SSR-Safe
Composes its DOM structure on the server. Activates interactive behaviour on the client. No `document` or `window` references at construct-time.

### Testable
Each sub-control can be unit tested in isolation. The composite can be integration tested. Visual regression tests capture the rendered output. Event flows can be verified without a browser.

## Design Principles

1. **Separate model from view** — A color value model normalises between representations. Views bind to it.
2. **Each mode is a standalone control** — `Swatch_Grid` is useful on its own. So is `Channel_Sliders`. They don't require the tabbed wrapper.
3. **The tabbed wrapper composes, not inherits** — `Color_Picker` contains mode controls; it doesn't extend them.
4. **Events flow up, data flows down** — Parent sets the color; child raises events when the user changes it.
5. **Progressive enhancement** — Start with the simplest mode (swatches), add complexity in later phases.

## How This Book Is Structured

Each chapter builds on the previous one:

- **Chapter 2** audits what already exists in jsgui3-html today.
- **Chapter 3** covers the color theory needed to implement conversions.
- **Chapter 4** designs each picker mode as a standalone control.
- **Chapter 5** shows how to combine modes using `Tabbed_Panel`.
- **Chapter 6** maps everything to jsgui3 patterns, mixins, and conventions.
- **Chapter 7** defines a comprehensive testing strategy.
- **Chapter 8** lays out a phased roadmap from MVP to production.

By the end you'll have a precise blueprint for building possibly the best color picker in any JavaScript UI framework.
