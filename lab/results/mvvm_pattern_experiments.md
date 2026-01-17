# MVVM Pattern Experiments

## Experiment

- Name: mvvm_computed_watch, mvvm_two_way_binding
- Date: 2026-01-05
- Author: Codex

## Objective

- Validate MVVM computed properties targeting a separate model.
- Validate bidirectional bindings with transform and reverse functions.

## Setup

- Controls: `Mvvm_Computed_Watch_Lab_Control`, `Mvvm_Two_Way_Binding_Lab_Control`.
- Models: `Data_Object` instances for data and view models.
- Environment: lab runner with jsdom.

## Findings

- Computed properties update the target model as expected when data dependencies change.
- Bidirectional bindings apply transforms and reverse transforms without manual wiring.
- Changes propagate in both directions when `bidirectional: true` and `reverse` are supplied.

## Risks

- Computed properties rely on the dependency list; missing dependencies produce stale values.
- Reverse transforms should guard against invalid input to prevent noisy model updates.

## Control Improvements

- Consider adding lightweight helpers in jsgui3-html to standardize transform + reverse patterns.
- Add more binding coverage in `test/core` once MVVM helper APIs are finalized.

## Next Steps

- Add a fixture-driven lab for multi-field validation flows.
- Add a lab for computed dependencies across multiple models.
