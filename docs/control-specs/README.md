# Data View Control Specs — T4 Target

This directory contains Control_Spec v1 YAML specifications for the three
data view controls being upgraded to T4 (world-class) quality.

## Schema

All specs follow the `Control_Spec v1` JSON Schema defined in
[`docs/control-design-book/06-unimplemented-control-specs.md`](../control-design-book/06-unimplemented-control-specs.md).

## Controls

| Control | Spec File | Current Tier | Target |
|---------|-----------|-------------|--------|
| Data_Grid | [Data_Grid.spec.yaml](./Data_Grid.spec.yaml) | T2 | **T4** |
| Data_Table | [Data_Table.spec.yaml](./Data_Table.spec.yaml) | T2 | **T4** |
| Data_Filter | [Data_Filter.spec.yaml](./Data_Filter.spec.yaml) | T1 | **T4** |

## Tier Definitions

- **T1** — Functional stub. Constructor, basic rendering, static CSS.
- **T2** — Working implementation. Events, model binding, basic accessibility.
- **T3** — Production-ready. Full ARIA, keyboard nav, density variants, E2E tests.
- **T4** — World-class. Server-side data support, virtual rendering, comprehensive
  E2E suite, visual verification, JSDoc, edge case handling, adaptive layout.
