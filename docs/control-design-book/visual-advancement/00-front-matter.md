# Taking jsgui3-html to the Next Level

> A hands-on engineering book for transforming jsgui3-html from functional controls  
> into a visually premium, precisely customisable UI toolkit.

---

## About This Book

The existing *Control Design Book* (chapters 01–10) establishes philosophy, visual modes, theming architecture, and aspirational quality tiers. **This companion volume is different.** It is a practical playbook that starts from the exact code that exists today — the actual CSS, the actual `themeable()` calls, the actual inline `.css` strings — and describes, with surgical precision, every change needed to reach a top-notch visual standard.

Each chapter:

- **Audits** the current state with real file paths and line references
- **Specifies** exact CSS properties, token values, and pixel measurements
- **Provides** copy-paste-ready code blocks for each control
- **Explains** the *why* behind every design decision

## Chapters

| # | File | Title |
|---|------|-------|
| 1 | [01-current-state-audit.md](./01-current-state-audit.md) | Where We Stand — Auditing the Current Visual State |
| 2 | [02-css-architecture.md](./02-css-architecture.md) | The CSS Architecture Revolution |
| 3 | [03-interaction-states.md](./03-interaction-states.md) | The Five Interaction States |
| 4 | [04-control-specs.md](./04-control-specs.md) | Control-by-Control Transformation Specs |
| 5 | [05-typography-spacing.md](./05-typography-spacing.md) | Typography, Spacing & The 8px Grid |
| 6 | [06-colour-system.md](./06-colour-system.md) | Colour System & Palette Engineering |
| 7 | [07-motion-animation.md](./07-motion-animation.md) | Motion & Micro-Animation |
| 8 | [08-dark-mode.md](./08-dark-mode.md) | Dark Mode Done Right |
| 9 | [09-css-pipeline.md](./09-css-pipeline.md) | From Inline Strings to a Proper CSS Pipeline |
| 10 | [10-sprint-plan.md](./10-sprint-plan.md) | The 30-Day Sprint Plan |
| 11 | [11-missing-enterprise-controls.md](./11-missing-enterprise-controls.md) | Controls Not Yet Built — Enterprise & Application |
| 12 | [12-missing-dataviz-creative.md](./12-missing-dataviz-creative.md) | Controls Not Yet Built — Data Visualisation & Creative |
| 13 | [13-completing-core-form.md](./13-completing-core-form.md) | Completing Existing Controls — Core & Form |
| 14 | [14-completing-data-layout-nav.md](./14-completing-data-layout-nav.md) | Completing Existing Controls — Data, Layout & Navigation |
| 15 | [15-testing-strategy.md](./15-testing-strategy.md) | Testing Strategy — Unit, Visual & E2E |
| 16 | [16-test-harnesses.md](./16-test-harnesses.md) | Test Harness Specifications |

## How This Relates to the Existing Design Book

```
Existing Design Book (01–10)     This Volume (visual-advancement/)
───────────────────────────      ──────────────────────────────────
Philosophy & Vision              → Concrete audit & gap analysis
Visual Modes (catalogue)         → Exact CSS specs per control
Theming Architecture (how)       → CSS pipeline overhaul plan
Platform Advancement (tiers)     → Day-by-day sprint schedule
AI Methodology (process)         → Copy-paste-ready code blocks
```

## Prerequisites

- Familiarity with the jsgui3-html control hierarchy
- Understanding of `themeable()`, `apply_token_map()`, and `variants.js`
- The existing Design Book chapters 03 (theming) and 05 (control catalogue)
