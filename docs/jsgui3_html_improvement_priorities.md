# JSGUI3-HTML Improvement Priorities

This document assigns priorities across the improvement workstreams and anchors the initial implementation focus.

Priority levels:
- P0: reliability and correctness, unblockers for real usage
- P1: major capability gaps with high user impact
- P2: quality and consistency improvements
- P3: foundation or future-facing enhancements

## P0
- Feature depth for existing controls (`docs/improvement_checklists/05_feature_depth_for_existing_controls.md`)
  - Fix known bugs (checkbox change handler, checked sync) and add baseline tests.
- Missing core controls (`docs/improvement_checklists/01_missing_core_controls.md`)
  - Add native HTML parity controls for common form inputs.
- Accessibility and semantics (`docs/improvement_checklists/06_accessibility_and_semantics.md`)
  - Establish a11y helpers and keyboard patterns for core controls.

## P1
- Form and editor features (`docs/improvement_checklists/04_form_and_editor_features.md`)
  - Validation flow, masking, and editor improvements.
- Data and collection controls (`docs/improvement_checklists/02_data_and_collection_controls.md`)
  - Data table and virtual list as primary capability gaps.

## P2
- Consistency and packaging (`docs/improvement_checklists/08_consistency_and_packaging.md`)
  - Naming normalization and explicit export stability.
- Layout and navigation expansion (`docs/improvement_checklists/03_layout_and_navigation_expansion.md`)
  - Split panes, accordion, drawer, stepper.

## P3
- Theming and styling system (`docs/improvement_checklists/07_theming_and_styling_system.md`)
  - Theme tokens, theme context, and swaps strategy.

## Current focus (P2)
- Layout and navigation expansion: split pane, drawer, accordion, tab variants, stepper, and layout primitives.
