# The Perfect jsgui3 Color Picker

A comprehensive guide to designing, building, and testing a world-class color picker control system for jsgui3-html.

## Table of Contents

1. [Introduction & Vision](./01-introduction.md) — Why a great color picker matters and what "perfect" looks like
2. [Current State Assessment](./02-current-state.md) — Audit of existing color-related code in jsgui3-html
3. [Color Theory & Models](./03-color-theory.md) — RGB, HSL, HSV, HEX, Named Colors, and alpha channels
4. [Picker Mode Designs](./04-picker-modes.md) — Six distinct ways to pick a color, each as its own control
5. [Tabbed Composite Architecture](./05-tabbed-composite.md) — Combining picker modes into a unified `Color_Picker` control
6. [jsgui3 Implementation Patterns](./06-implementation-patterns.md) — How to build each piece using jsgui3 conventions
7. [Testing Strategy](./07-testing-strategy.md) — Unit, integration, visual, and accessibility testing plans
8. [Roadmap & Milestones](./08-roadmap.md) — Phased delivery plan from MVP to production-ready
9. [Deep Theme Integration](./09-deep-theme-integration.md) — Bidirectional theming: picker appearance AND theme colour authoring
10. [Palettes, Composability & Idiomatic Usage](./10-palettes-and-usage.md) — How palettes work, controls in multiple contexts, and high-level patterns

## Who This Book Is For

Developers working with or contributing to the jsgui3-html control library who want to understand how to build a feature-rich, composable color picker that integrates cleanly with jsgui3's SSR, theming, and event systems.

## Conventions

- **Class names** use `Camel_Case` (e.g., `Color_Picker`, `HSL_Wheel`)
- **Method names** use `snake_case` (e.g., `get_value`, `set_color`)
- **CSS classes** use `kebab-case` (e.g., `color-picker`, `hsl-wheel`)
- **Events** use `kebab-case` (e.g., `choose-color`, `color-change`)
