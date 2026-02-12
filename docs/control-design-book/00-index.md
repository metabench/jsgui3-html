# The jsgui3-html Control Design Book

> A comprehensive, illustrated guide to designing, theming, and continuously improving  
> UI controls in jsgui3-html — from philosophy to methodology.

---

## Chapters

| # | File | Title | Description |
|---|------|-------|-------------|
| 1 | [01-design-philosophy.md](./01-design-philosophy.md) | Design Philosophy & Visual Heritage | Why design matters for a control library, the visual design spectrum from skeuomorphism to flat, and the jsgui3 position |
| 2 | [02-visual-modes.md](./02-visual-modes.md) | Visual Modes | Deep catalogue of every visual mode — Win32 Classic, Modern Dark, Glassmorphism, Neumorphism, Enterprise — with comparison tables and adaptation checklists |
| 3 | [03-theming-architecture.md](./03-theming-architecture.md) | Theming Architecture | The token system, merge priority, variant registries, the `themeable` mixin, and step-by-step theme creation |
| 4 | [04-data-presentation-separation.md](./04-data-presentation-separation.md) | Separating Presentation from Data | The MVVM three-layer model, data objects, computed properties, bindings, transforms, and practical design implications |
| 5 | [05-control-catalogue.md](./05-control-catalogue.md) | Control-by-Control Design Guide | Every control in the library with visual mode status, design specs per mode, and what needs work |
| 6 | [06-skeuomorphic-design.md](./06-skeuomorphic-design.md) | Skeuomorphic Design Deep Dive | Win32 visual language dissected pixel by pixel — beveled borders, sunken wells, etched groups, with annotated SVG illustrations |
| 7 | [07-modern-design.md](./07-modern-design.md) | Modern Design Patterns | Dark mode, glassmorphism, neumorphism, micro-animations, gradient science, with annotated SVG illustrations |
| 8 | [08-design-assets.md](./08-design-assets.md) | Design Assets Inventory | Catalogue of all SVGs, screenshots, and reference images with descriptions |
| 9 | [09-platform-advancement.md](./09-platform-advancement.md) | Making jsgui3-html World-Class | Quality tiers, visual quality roadmap, performance, DX improvements, accessibility |
| 10 | [10-ai-methodology.md](./10-ai-methodology.md) | AI-Driven Continuous Improvement | The repeatable improvement loop, minimal prompts, research protocol, QA checklist |

---

## SVG Illustrations In This Book

| File | Style | Content |
|------|-------|---------|
| [svg-01-design-spectrum.svg](./svg-01-design-spectrum.svg) | Diagram | Visual design spectrum from skeuomorphic to flat |
| [svg-02-vs-classic-buttons.svg](./svg-02-vs-classic-buttons.svg) | Win32 | Raised 3D buttons, flat toolbar, inputs, checkboxes, tabs, scrollbars |
| [svg-03-vs-classic-windows.svg](./svg-03-vs-classic-windows.svg) | Win32 | MDI window, properties dialog, Solution Explorer, property grid |
| [svg-04-modern-dark-buttons.svg](./svg-04-modern-dark-buttons.svg) | Modern | Gradient buttons, outlined, pill, icon buttons |
| [svg-05-glassmorphism-panels.svg](./svg-05-glassmorphism-panels.svg) | Glass | Frosted cards, analytics, profile, notifications, settings |
| [svg-06-theme-token-flow.svg](./svg-06-theme-token-flow.svg) | Diagram | How tokens flow from theme → variant → control → DOM |
| [svg-07-mvvm-layers.svg](./svg-07-mvvm-layers.svg) | Diagram | The three-layer model architecture |
| [svg-08-control-modes-comparison.svg](./svg-08-control-modes-comparison.svg) | Mixed | Same button/input/window in 4 different visual modes side-by-side |
| [svg-09-ai-improvement-loop.svg](./svg-09-ai-improvement-loop.svg) | Diagram | The 6-step AI improvement methodology flowchart |

## How to Read This Book

- **Building a new control?** Start with [Chapter 4](./04-data-presentation-separation.md) (data architecture), then [Chapter 3](./03-theming-architecture.md) (theming), then [Chapter 5](./05-control-catalogue.md) (existing patterns)
- **Designing a theme?** Start with [Chapter 2](./02-visual-modes.md) (visual modes), then [Chapter 3](./03-theming-architecture.md) (theming architecture)
- **Adding skeuomorphic support?** Start with [Chapter 6](./06-skeuomorphic-design.md) (deep dive) with its SVG illustrations
- **AI agent improving controls?** Start with [Chapter 10](./10-ai-methodology.md) (the methodology), which references all other chapters
- **Just browsing?** Start with [Chapter 1](./01-design-philosophy.md) and read sequentially
