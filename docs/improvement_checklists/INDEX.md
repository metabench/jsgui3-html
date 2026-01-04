# Improvement Checklists Index

This directory contains per-workstream issue checklists for the jsgui3-html improvement plan.

Conventions to apply to every item:
- snake_case for variables, methods, file names; Camel_Case for class names.
- isomorphic controls: guard DOM access, wire events in `activate()`.
- public methods include JSDoc.
- models use `Data_Object`.
- export new controls from `controls/controls.js`.
- add dev-examples and E2E tests for interactive controls.
- document new behavior in `docs/` and update README when relevant.

Checklists:
- [01 Missing Core Controls](01_missing_core_controls.md)
- [02 Data and Collection Controls](02_data_and_collection_controls.md)
- [03 Layout and Navigation Expansion](03_layout_and_navigation_expansion.md)
- [04 Form and Editor Features](04_form_and_editor_features.md)
- [05 Feature Depth for Existing Controls](05_feature_depth_for_existing_controls.md)
- [06 Accessibility and Semantics](06_accessibility_and_semantics.md)
- [07 Theming and Styling System](07_theming_and_styling_system.md)
- [08 Consistency and Packaging](08_consistency_and_packaging.md)

## Detailed Implementation Plans

For in-depth technical specifications, code patterns, and implementation guides, see the detailed plans directory:

**[Detailed Plans Index](../detailed_plans/INDEX.md)**

Key detailed plans:
- [Consistency and Packaging](../detailed_plans/01_consistency_and_packaging.md) - Naming normalization, export stability
- [Progressive Enhancement](../detailed_plans/02_progressive_enhancement_swaps.md) - Swaps and activation strategy
- [Control Quality Audit](../detailed_plans/03_control_quality_audit.md) - Per-control improvement tracking
- [Data Controls Deep Dive](../detailed_plans/04_data_controls_deep_dive.md) - Advanced data control features
- [Window Management System](../detailed_plans/05_window_management_system.md) - Window/panel enhancements
- [Input System Unification](../detailed_plans/06_input_system_unification.md) - Shared input base patterns
- [Validation System Architecture](../detailed_plans/07_validation_system_architecture.md) - Form validation infrastructure
- [Performance Optimization](../detailed_plans/08_performance_optimization.md) - Rendering and virtualization
