# Missing Core Controls

Each checklist item should include tests and documentation updates.

## Textarea control
- [x] Create `controls/organised/0-core/0-basic/0-native-compositional/textarea.js` with class `Textarea`.
- [x] Implement `value`, `placeholder`, `rows`, `cols`, `disabled`, `readonly` bindings.
- [x] Add `focus()` and `select()` methods with DOM guards.
- [x] Add `input` and `change` event normalization.
- [x] Export from `controls/controls.js`.
- [x] Add dev-example and E2E test (value round-trip, SSR guard).
- [x] Add docs entry and update README if needed.

## Typed text inputs
- [x] Add `Email_Input` with `type=\"email\"`.
- [x] Add `Password_Input` with `type=\"password\"`.
- [x] Add `Url_Input` with `type=\"url\"`.
- [x] Add `Tel_Input` with `type=\"tel\"`.

## Number input with stepper
- [x] Create `controls/organised/0-core/0-basic/0-native-compositional/number_input.js` with class `Number_Input`.
- [x] Support `min`, `max`, `step`, `inputmode`, `value`.
- [x] Normalize `change` and `input` events.
- [x] Add compositional `number_stepper` wrapper.
- [x] Export, example, E2E tests for min/max/step.

## Range slider and stepped slider
- [x] Create `controls/organised/0-core/0-basic/0-native-compositional/range_input.js` with class `Range_Input`.
- [x] Support `min`, `max`, `step`, `value`, `ticks`.
- [x] Add a compositional `stepped_slider` wrapper under `1-compositional`.
- [x] A11y attributes: `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.
- [x] Export, example, E2E tests for step behavior.

## Progress bar and meter
- [x] Create `controls/organised/0-core/0-basic/0-native-compositional/progress_bar.js` with class `Progress_Bar`.
- [x] Create `controls/organised/0-core/0-basic/0-native-compositional/meter.js` with class `Meter`.
- [x] Clamp `value` to min/max, expose `set_value` and `get_value`.
- [x] Export, example, and tests for value clamping.

## Toggle switch
- [x] Create `controls/organised/0-core/0-basic/1-compositional/toggle_switch.js` with class `Toggle_Switch`.
- [x] Compose checkbox control and keep `checked` in sync.
- [x] Provide `on_label` and `off_label` for screen readers.
- [x] Export, example, E2E tests for toggle behavior.

## Badge/pill
- [x] Create `controls/organised/0-core/0-basic/1-compositional/badge.js` with class `Badge`.
- [x] Support `status` variants (info, success, warn, error).
- [x] Export, example, test for rendering and class assignment.

## Inline validation message
- [x] Create `controls/organised/1-standard/1-editor/inline_validation_message.js` with class `Inline_Validation_Message`.
- [x] Support `status` variants and `message` text binding.
- [x] Allow linking via `aria-describedby` from inputs.
- [x] Export, example, tests for status changes.

## Chip/tag input
- [x] Create `controls/organised/1-standard/1-editor/tag_input.js` with class `Tag_Input`.
- [x] Use `Data_Object` model with `items` and `input_value`.
- [x] Add add/remove behavior (enter/comma, backspace remove).
- [x] Compose `text_input` and `list` controls.
- [x] Export, example, E2E test for add/remove.

## Breadcrumbs
- [x] Create `controls/organised/1-standard/5-ui/breadcrumbs.js` with class `Breadcrumbs`.
- [x] Support `items` array with label + href/handler.
- [x] Emit `select` or `navigate` event on click.
- [x] Export, example, E2E test for selection.

## Pagination
- [x] Create `controls/organised/1-standard/5-ui/pagination.js` with class `Pagination`.
- [x] Support `page`, `page_count`, and `page_size`.
- [x] Emit `page_change` and update `aria-current`.
- [x] Export, example, E2E test for page changes.

## Tooltip and popover
- [x] Create `controls/organised/1-standard/5-ui/tooltip.js` with class `Tooltip`.
- [x] Support `target`, `placement`, and show/hide on hover/focus.
- [x] Provide `role="tooltip"` and `aria-describedby` wiring.
- [x] Export, example, E2E test for show/hide.
- [x] Add `Pop_Over` control with click toggle and `aria-expanded` updates.

## Notification/toast and alert banner
- [x] Create `controls/organised/1-standard/5-ui/toast.js` with class `Toast`.
- [x] Create `controls/organised/1-standard/5-ui/alert_banner.js` with class `Alert_Banner`.
- [x] Provide `show`, `dismiss`, and timeout support.
- [x] Export, example, E2E tests for queue and dismissal.
