# Date I18N Experiments

## Experiment

- Name: date_i18n_transform, date_i18n_mvvm
- Date: 2025-12-18
- Author: Codex

## Objective

- Validate parsing of localized date strings into ISO storage.
- Validate UI formatting from ISO into primary (international) and optional secondary formats.
- Confirm MVVM bindings update view models when input and format selections change.

## Setup

- Transformations: `Transformations.date.parse_i18n_to_iso`, `format_iso_to_locale`
- Locales: en-US, en-GB, de-DE, ja-JP, sv-SE
- MVVM: Data_Object models with bind/computed/watch on a control derived from jsgui.Control
- Fixtures: `lab/fixtures/date_i18n_cases.json`

## Findings

- Locale-specific inputs normalize to ISO `YYYY-MM-DD` consistently.
- Primary UI display can safely use ISO string directly.
- Secondary UI display updates correctly from optional locale/format selection.

## Risks

- Ambiguous inputs (e.g. 01/02/2025) still require explicit locale selection.
- Time zone handling is not modeled; date-only strings avoid DST shifts but need clear guidance.

## Control Improvements

- Add a Date_Field (or Date_I18n_Field) control that:
  - Stores ISO date string in data model.
  - Exposes primary (ISO) display and optional secondary display in view model.
  - Uses Transformations.date i18n helpers for parsing/formatting.
- Add validation for invalid day/month boundaries and locale mismatch.

## Next Steps

- Create a control in `controls/organised/1-standard/1-editor/` using the MVVM approach.
- Add unit tests for new Transformations.date helpers.
- Add E2E tests for locale switching and UI rendering.
