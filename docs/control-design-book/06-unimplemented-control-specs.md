# Chapter 6: Unimplemented Controls — Detailed Build Specs

This chapter defines a **single, AI-friendly spec format** and then uses it to specify the controls that were identified in the SVG/admin design review as not yet implemented.

---

## 6.1 Chosen Spec Format (for AI + humans)

### Format name

`Control_Spec v1`

### Why this format

This format is optimized for both:

1. **AI agents** (structured fields, explicit constraints, deterministic keys)
2. **Human maintainers** (readable YAML, inline rationale, acceptance criteria)

It uses:

- **YAML documents** for authoring readability
- A **JSON Schema 2020-12 contract** to validate each spec document
- Explicit sections for composition, accessibility, keyboard interaction, and E2E acceptance

This gives strong validation, clear diffability, and reliable code generation / implementation planning.

### Authoring rules

- One YAML document per control
- Use stable keys and keep order consistent
- Prefer concrete constraints over prose
- Every interactive control must include:
	- states
	- keyboard map
	- ARIA contract
	- event contract
	- E2E acceptance checklist

---

## 6.2 Control_Spec v1 JSON Schema

```json
{
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"$id": "https://jsgui3-html.local/schemas/control-spec-v1.json",
	"title": "Control_Spec v1",
	"type": "object",
	"required": [
		"spec_version",
		"control",
		"status",
		"purpose",
		"composition",
		"api",
		"interaction",
		"accessibility",
		"styling",
		"acceptance"
	],
	"properties": {
		"spec_version": { "const": "1.0" },
		"control": {
			"type": "object",
			"required": ["class_name", "type_name", "category", "priority"],
			"properties": {
				"class_name": { "type": "string", "pattern": "^[A-Z][A-Za-z0-9_]*$" },
				"type_name": { "type": "string", "pattern": "^[a-z0-9_]+$" },
				"category": { "type": "string" },
				"priority": { "enum": ["P0", "P1", "P2", "P3"] },
				"target_tier": { "enum": ["T1", "T2", "T3", "T4"] },
				"proposed_file": { "type": "string" },
				"dependencies": {
					"type": "array",
					"items": { "type": "string" }
				}
			},
			"additionalProperties": false
		},
		"status": {
			"type": "object",
			"required": ["implemented"],
			"properties": {
				"implemented": { "type": "boolean" },
				"notes": { "type": "string" }
			},
			"additionalProperties": false
		},
		"purpose": {
			"type": "object",
			"required": ["summary", "use_cases"],
			"properties": {
				"summary": { "type": "string" },
				"use_cases": {
					"type": "array",
					"items": { "type": "string" },
					"minItems": 1
				},
				"non_goals": {
					"type": "array",
					"items": { "type": "string" }
				}
			},
			"additionalProperties": false
		},
		"composition": {
			"type": "object",
			"required": ["children", "variants", "states"],
			"properties": {
				"children": { "type": "array", "items": { "type": "string" } },
				"variants": { "type": "array", "items": { "type": "string" } },
				"states": { "type": "array", "items": { "type": "string" } },
				"default_variant": { "type": "string" },
				"default_state": { "type": "string" }
			},
			"additionalProperties": false
		},
		"api": {
			"type": "object",
			"required": ["props", "events", "methods"],
			"properties": {
				"props": {
					"type": "array",
					"items": {
						"type": "object",
						"required": ["name", "type", "required", "description"],
						"properties": {
							"name": { "type": "string" },
							"type": { "type": "string" },
							"required": { "type": "boolean" },
							"default": {},
							"description": { "type": "string" }
						},
						"additionalProperties": false
					}
				},
				"events": {
					"type": "array",
					"items": {
						"type": "object",
						"required": ["name", "payload"],
						"properties": {
							"name": { "type": "string" },
							"payload": { "type": "string" },
							"when": { "type": "string" }
						},
						"additionalProperties": false
					}
				},
				"methods": {
					"type": "array",
					"items": {
						"type": "object",
						"required": ["name", "signature", "description"],
						"properties": {
							"name": { "type": "string" },
							"signature": { "type": "string" },
							"description": { "type": "string" }
						},
						"additionalProperties": false
					}
				}
			},
			"additionalProperties": false
		},
		"interaction": {
			"type": "object",
			"required": ["keyboard", "pointer"],
			"properties": {
				"keyboard": {
					"type": "array",
					"items": {
						"type": "object",
						"required": ["key", "behavior"],
						"properties": {
							"key": { "type": "string" },
							"behavior": { "type": "string" }
						},
						"additionalProperties": false
					}
				},
				"pointer": {
					"type": "array",
					"items": { "type": "string" }
				}
			},
			"additionalProperties": false
		},
		"accessibility": {
			"type": "object",
			"required": ["roles", "aria", "focus"],
			"properties": {
				"roles": { "type": "array", "items": { "type": "string" } },
				"aria": { "type": "array", "items": { "type": "string" } },
				"focus": { "type": "array", "items": { "type": "string" } }
			},
			"additionalProperties": false
		},
		"styling": {
			"type": "object",
			"required": ["css_classes", "tokens"],
			"properties": {
				"css_classes": { "type": "array", "items": { "type": "string" } },
				"tokens": { "type": "array", "items": { "type": "string" } },
				"density_support": { "type": "array", "items": { "type": "string" } }
			},
			"additionalProperties": false
		},
		"acceptance": {
			"type": "object",
			"required": ["e2e", "done_definition"],
			"properties": {
				"e2e": { "type": "array", "items": { "type": "string" } },
				"done_definition": { "type": "array", "items": { "type": "string" } }
			},
			"additionalProperties": false
		}
	},
	"additionalProperties": false
}
```

---

## 6.3 Detailed Specs

> Note: These controls were originally unimplemented but have since been built. Specs updated to reflect current implementations and define target acceptance criteria.

### 6.3.1 `Status_Bar`

```yaml
spec_version: "1.0"
control:
	class_name: Status_Bar
	type_name: status_bar
	category: 1-standard/5-ui
	priority: P1
	target_tier: T3
	proposed_file: controls/organised/1-standard/5-ui/status_bar.js
	dependencies: [Control, Badge, Indicator]
status:
	implemented: true
	notes: >
		104-line implementation with left/right text regions, data-status attribute,
		themeable mixin. Current tier ~T1. Missing center region, dynamic items,
		item_click events, keyboard navigation, show_clock, and density variants.
purpose:
	summary: Shows compact, persistent runtime status metrics and contextual hints.
	use_cases:
		- Admin dashboard footer with memory/cpu/request/error counters.
		- Console mode status updates (connected/disconnected, env, latency).
	non_goals:
		- Not a notification center.
		- Not a full charting component.
composition:
	children:
		- left_region (text / mode)
		- center_region (metrics)
		- right_region (connection + clock)
		- item_separator
	variants: [default, compact, dense, win32_classic]
	states: [normal, warning, error, disabled]
	default_variant: default
	default_state: normal
api:
	props:
		- name: text
			type: string
			required: false
			default: "Ready"
			description: Left-side contextual text.
		- name: meta_text
			type: string
			required: false
			default: ""
			description: Right-side metadata text.
		- name: status
			type: string
			required: false
			default: "info"
			description: "Visual status: info, success, warning, error."
		- name: items
			type: array<{id:string,label:string,value:string|number,state?:string,icon?:string}>
			required: false
			default: []
			description: Ordered status entries rendered in center/right regions.
		- name: dense
			type: boolean
			required: false
			default: false
			description: Reduces height and spacing.
		- name: show_clock
			type: boolean
			required: false
			default: false
			description: Shows live time in right region.
	events:
		- name: item_click
			payload: "{id:string, value:any}"
			when: User clicks an interactive status item.
		- name: status_change
			payload: "{id:string, previous:any, next:any}"
			when: An item value/state changes via set_item.
	methods:
		- name: set_text
			signature: set_text(text)
			description: Updates left-side contextual text.
		- name: set_meta_text
			signature: set_meta_text(meta_text)
			description: Updates right-side metadata text.
		- name: set_status
			signature: set_status(status)
			description: Updates visual status (info/success/warning/error).
		- name: set_item
			signature: set_item(id, patch)
			description: Updates value/state/icon for a single item.
		- name: clear_item
			signature: clear_item(id)
			description: Removes one item safely.
interaction:
	keyboard:
		- key: Tab
			behavior: Moves focus across interactive items left-to-right.
		- key: Enter
			behavior: Activates focused interactive item and emits item_click.
		- key: Space
			behavior: Same as Enter for interactive item.
	pointer:
		- Hover highlights interactive item.
		- Click emits item_click if item is clickable.
accessibility:
	roles:
		- role="status" on root when non-interactive
		- role="toolbar" on root when interactive items exist
	aria:
		- aria-label on root (default "Status bar")
		- aria-live="polite" for dynamic text updates
		- aria-disabled on disabled item
	focus:
		- Roving tabindex for interactive items.
		- Visible focus ring using theme token.
styling:
	css_classes: [jsgui-status-bar, status-bar-left, status-bar-right, status-bar-item, status-bar-separator]
	tokens:
		- --j-bg-muted
		- --j-border
		- --j-fg
		- --j-fg-muted
		- --j-primary
		- --j-danger
	density_support: [comfortable, compact]
acceptance:
	e2e:
		- Renders item order exactly as provided.
		- Dynamic set_item updates text without full rerender flicker.
		- Keyboard Tab + Enter activates items in order.
		- aria-live updates are announced.
		- Warning/error states change visual token usage.
	done_definition:
		- Exported from controls/controls.js.
		- Includes static css and theme token usage.
		- Includes self-contained Puppeteer E2E test.
```

### 6.3.2 `Group_Box`

```yaml
spec_version: "1.0"
control:
	class_name: Group_Box
	type_name: group_box
	category: 1-standard/6-layout
	priority: P1
	target_tier: T3
	proposed_file: controls/organised/1-standard/6-layout/group_box.js
	dependencies: [Control]
status:
	implemented: true
	notes: >
		145-line implementation with fieldset/div toggle, legend, content container,
		invalid/disabled states, legend_click event, themeable mixin. Current tier ~T1.
		Missing variants (subtle, elevated, win32_classic), density support.
purpose:
	summary: Visually and semantically groups related controls with optional legend.
	use_cases:
		- Form sections (customer info, shipping, billing).
		- Grouped settings in properties panel.
	non_goals:
		- Not a collapsible panel (use Titled_Panel/Accordion).
composition:
	children: [legend_slot, content_container]
	variants: [default, subtle, elevated, win32_classic]
	states: [normal, disabled, invalid]
	default_variant: default
	default_state: normal
api:
	props:
		- name: legend
			type: string
			required: false
			default: ""
			description: Group title shown as legend.
		- name: as_fieldset
			type: boolean
			required: false
			default: true
			description: Renders semantic fieldset/legend when true.
		- name: invalid
			type: boolean
			required: false
			default: false
			description: Applies invalid visual state.
	events:
		- name: legend_click
			payload: "{legend:string}"
			when: Legend is interactive and clicked.
	methods:
		- name: set_legend
			signature: set_legend(text)
			description: Updates legend text.
		- name: set_invalid
			signature: set_invalid(flag)
			description: Toggles invalid visual state and aria-invalid.
		- name: add_content
			signature: add_content(content)
			description: Appends a control or array of controls to the content container.
interaction:
	keyboard:
		- key: Tab
			behavior: Focus enters first tabbable child in content container.
	pointer:
		- Optional legend hover/click if legend_action enabled.
accessibility:
	roles:
		- Native fieldset/legend preferred
		- role="group" if non-fieldset mode
	aria:
		- aria-labelledby links group to legend id
		- aria-disabled when disabled
		- aria-invalid on group when invalid
	focus:
		- Group itself is not focusable by default.
		- Focus ring remains on child controls.
styling:
	css_classes: [jsgui-group-box, group-box-legend, group-box-content, group-box-invalid, group-box-disabled]
	tokens:
		- --j-border
		- --j-bg-elevated
		- --j-fg
		- --j-fg-muted
		- --j-danger
	density_support: [comfortable, compact]
acceptance:
	e2e:
		- Renders with and without legend.
		- Semantic fieldset/legend present when as_fieldset=true.
		- Invalid state uses danger token for border/legend accent.
		- Nested controls remain fully interactive.
	done_definition:
		- Exported in controls/controls.js.
		- SSR-safe (no unguarded DOM access in constructor).
```

### 6.3.3 `Separator`

```yaml
spec_version: "1.0"
control:
	class_name: Separator
	type_name: separator
	category: 0-core/0-basic/1-compositional
	priority: P2
	target_tier: T2
	proposed_file: controls/organised/0-core/0-basic/1-compositional/separator.js
	dependencies: [Control]
status:
	implemented: true
	notes: >
		Lightweight implementation in 0-core with horizontal/vertical orientation,
		aria-orientation support. Current tier ~T1. Missing variant styles (dashed,
		inset), density support.
purpose:
	summary: Provides visual separation in horizontal/vertical orientation.
	use_cases:
		- Toolbars between button groups.
		- Menus and forms between logical sections.
composition:
	children: [line]
	variants: [solid, dashed, inset, subtle]
	states: [normal]
	default_variant: subtle
	default_state: normal
api:
	props:
		- name: orientation
			type: string
			required: false
			default: horizontal
			description: horizontal or vertical.
		- name: inset
			type: boolean
			required: false
			default: false
			description: Applies start/end inset margins.
		- name: decorative
			type: boolean
			required: false
			default: true
			description: Marks separator as decorative for AT.
	events: []
	methods:
		- name: set_orientation
			signature: set_orientation(value)
			description: Switches horizontal/vertical rendering.
interaction:
	keyboard: []
	pointer: []
accessibility:
	roles:
		- role="separator" when semantic separation is required
	aria:
		- aria-orientation set when role=separator
		- aria-hidden=true when decorative=true
	focus:
		- Not focusable.
styling:
	css_classes: [jsgui-separator, separator-horizontal, separator-vertical, separator-inset]
	tokens:
		- --j-border
		- --j-fg-muted
	density_support: [comfortable, compact]
acceptance:
	e2e:
		- Horizontal and vertical render with correct dimensions.
		- Decorative mode uses aria-hidden.
		- Semantic mode has role and aria-orientation.
	done_definition:
		- Lightweight, zero activation logic.
```

### 6.3.4 `Split_Button`

```yaml
spec_version: "1.0"
control:
	class_name: Split_Button
	type_name: split_button
	category: 1-standard/5-ui
	priority: P1
	target_tier: T3
	proposed_file: controls/organised/1-standard/5-ui/split_button.js
	dependencies: [Button, Popup_Menu_Button, Context_Menu]
status:
	implemented: true
	notes: >
		182-line implementation with primary button, trigger button, popup menu,
		aria-haspopup/expanded, menu_open_change event, outside-click close.
		Current tier ~T1. Missing keyboard nav (ArrowDown, Escape), variants
		(primary, danger, toolbar), focus management.
purpose:
	summary: Combines a default action button with adjacent menu trigger.
	use_cases:
		- Save / Save As
		- Run / Run with options
composition:
	children: [primary_button, trigger_button, popup_menu]
	variants: [default, primary, danger, toolbar]
	states: [normal, hover, active, focus, disabled, menu_open]
	default_variant: default
	default_state: normal
api:
	props:
		- name: text
			type: string
			required: true
			description: Primary button label.
		- name: items
			type: array<{id:string,text:string,disabled?:boolean}>
			required: true
			description: Menu items.
		- name: default_action
			type: string
			required: true
			description: Action id for primary click.
		- name: disabled
			type: boolean
			required: false
			default: false
			description: Disables both segments.
	events:
		- name: action
			payload: "{id:string, source:'primary'|'menu'}"
			when: Primary clicked or menu item selected.
		- name: menu_open_change
			payload: "{open:boolean}"
			when: Menu opens/closes.
	methods:
		- name: open_menu
			signature: open_menu()
			description: Opens the dropdown menu.
		- name: close_menu
			signature: close_menu()
			description: Closes the dropdown menu.
		- name: set_items
			signature: set_items(items)
			description: Replaces menu items.
interaction:
	keyboard:
		- key: Enter
			behavior: Activates primary action when focus on primary segment.
		- key: ArrowDown
			behavior: Opens menu from either segment and focuses first item.
		- key: Space
			behavior: Activates focused segment.
		- key: Escape
			behavior: Closes menu and returns focus to trigger.
	pointer:
		- Click primary emits default action.
		- Click chevron opens menu.
		- Click outside closes menu.
accessibility:
	roles:
		- role="group" on root
		- role="button" on each segment
		- role="menu" and role="menuitem" inside popup
	aria:
		- aria-haspopup="menu" on trigger segment
		- aria-expanded reflects menu state
		- aria-controls links trigger to menu id
	focus:
		- Segments are individually tabbable or roving (configurable).
styling:
	css_classes: [jsgui-split-button, split-button-primary, split-button-trigger, split-button-menu, split-button-menu-item, split-button-open, split-button-disabled]
	tokens:
		- --j-primary
		- --j-border
		- --j-fg
		- --j-bg-hover
		- --j-danger
acceptance:
	e2e:
		- Primary segment emits default action.
		- Trigger opens menu and supports keyboard navigation.
		- Escape closes menu and restores focus.
		- Disabled state blocks both click and keyboard activation.
	done_definition:
		- Includes robust outside-click close behavior.
```

### 6.3.5 `Link_Button`

```yaml
spec_version: "1.0"
control:
	class_name: Link_Button
	type_name: link_button
	category: 1-standard/5-ui
	priority: P2
	target_tier: T2
	proposed_file: controls/organised/1-standard/5-ui/link_button.js
	dependencies: [Button]
status:
	implemented: true
	notes: >
		88-line implementation with text, underline modes (none/hover/always),
		disabled state, action event. Current tier ~T1. Missing variants (subtle,
		danger), icon support.
purpose:
	summary: A button that visually resembles a hyperlink while preserving button behavior.
	use_cases:
		- Inline “Learn more”, “Reset”, “View details”.
composition:
	children: [text, optional_icon]
	variants: [default, subtle, danger]
	states: [normal, hover, active, focus, disabled]
	default_variant: default
	default_state: normal
api:
	props:
		- name: text
			type: string
			required: true
			description: Link label text.
		- name: underline
			type: string
			required: false
			default: hover
			description: none|hover|always.
		- name: disabled
			type: boolean
			required: false
			default: false
			description: Disables interaction.
	events:
		- name: action
			payload: "{}"
			when: Activated by click/keyboard.
	methods:
		- name: set_disabled
			signature: set_disabled(flag)
			description: Toggles disabled state.
interaction:
	keyboard:
		- key: Enter
			behavior: Activates action.
		- key: Space
			behavior: Activates action.
	pointer:
		- Hover updates underline according to underline mode.
		- Click emits action when enabled.
accessibility:
	roles:
		- Native button element preferred
	aria:
		- aria-disabled when disabled
	focus:
		- Visible focus indicator independent of underline.
styling:
	css_classes: [jsgui-link-button, link-button-danger, link-button-disabled]
	tokens:
		- --j-primary
		- --j-fg
		- --j-danger
		- --j-fg-muted
acceptance:
	e2e:
		- Enter/Space activation parity with click.
		- Disabled prevents action.
		- Underline mode behavior works for none/hover/always.
	done_definition:
		- Keeps button semantics (not anchor-only hack).
```

### 6.3.6 `Icon_Button`

```yaml
spec_version: "1.0"
control:
	class_name: Icon_Button
	type_name: icon_button
	category: 1-standard/5-ui
	priority: P1
	target_tier: T3
	proposed_file: controls/organised/1-standard/5-ui/icon_button.js
	dependencies: [Button, Icon, Tooltip]
status:
	implemented: true
	notes: >
		122-line implementation with icon, aria-label, tooltip, toggle/pressed
		state, disabled state, action event. Current tier ~T1. Missing variants
		(filled, subtle, danger, toolbar), size variants (sm/md/lg), focus-visible
		styling improvements.
purpose:
	summary: Compact icon-only button with mandatory accessible labeling.
	use_cases:
		- Toolbar actions, row actions, window controls.
composition:
	children: [icon]
	variants: [ghost, filled, subtle, danger, toolbar]
	states: [normal, hover, active, focus, disabled, toggled]
	default_variant: ghost
	default_state: normal
api:
	props:
		- name: icon
			type: string
			required: true
			description: Icon name/glyph key.
		- name: aria_label
			type: string
			required: true
			description: Required accessible name.
		- name: tooltip
			type: string
			required: false
			default: ""
			description: Optional tooltip text.
		- name: toggle
			type: boolean
			required: false
			default: false
			description: Enables pressed state behavior.
		- name: pressed
			type: boolean
			required: false
			default: false
			description: Initial pressed state when toggle=true.
	events:
		- name: action
			payload: "{pressed?:boolean}"
			when: Activated by click/keyboard.
	methods:
		- name: set_pressed
			signature: set_pressed(flag)
			description: Sets toggle pressed state.
		- name: set_icon
			signature: set_icon(icon)
			description: Replaces icon glyph.
interaction:
	keyboard:
		- key: Enter
			behavior: Activates.
		- key: Space
			behavior: Activates.
	pointer:
		- Hover state and optional tooltip display.
accessibility:
	roles:
		- Native button element
	aria:
		- aria-label required
		- aria-pressed when toggle=true
		- aria-disabled when disabled
	focus:
		- Always visible focus ring; not color-only indication.
styling:
	css_classes: [jsgui-icon-button, icon-button-icon, icon-button-toolbar, icon-button-danger, icon-button-pressed, icon-button-disabled]
	tokens:
		- --j-primary
		- --j-border
		- --j-fg
		- --j-bg-hover
		- --j-danger
acceptance:
	e2e:
		- Fails validation if aria_label missing.
		- Toggle mode updates aria-pressed correctly.
		- Tooltip appears on hover/focus when configured.
	done_definition:
		- Includes icon size variants (sm/md/lg).
```

### 6.3.7 `Code_Editor`

```yaml
spec_version: "1.0"
control:
	class_name: Code_Editor
	type_name: code_editor
	category: 1-standard/1-editor
	priority: P0
	target_tier: T3
	proposed_file: controls/organised/1-standard/1-editor/code_editor.js
	dependencies: [Control, Scrollbar]
status:
	implemented: true
	notes: >
		~130-line implementation with line numbers, value management, language
		hint, basic selection. Current tier ~T1. Missing syntax highlighting,
		minimap, undo/redo stack, format_document, cursor_change event.
purpose:
	summary: Embedded code editing control with line numbers, selection, and change events.
	use_cases:
		- Form definition source editing.
		- JSON schema/event script preview.
	non_goals:
		- Not a full IDE replacement.
		- No requirement for full language server integration in v1.
composition:
	children: [gutter, code_surface, minimap_optional, status_row_optional]
	variants: [default, compact, read_only]
	states: [idle, focused, dirty, read_only, disabled]
	default_variant: default
	default_state: idle
api:
	props:
		- name: value
			type: string
			required: true
			default: ""
			description: Full editor text.
		- name: language
			type: string
			required: false
			default: plaintext
			description: json|js|ts|css|html|plaintext (tokenization hint).
		- name: tab_size
			type: number
			required: false
			default: 2
			description: Tab width.
		- name: read_only
			type: boolean
			required: false
			default: false
			description: Disables editing while allowing selection.
		- name: show_line_numbers
			type: boolean
			required: false
			default: true
			description: Toggles line number gutter.
	events:
		- name: change
			payload: "{value:string, selection:{start:number,end:number}, source:'user'|'api'}"
			when: Text content changes.
		- name: cursor_change
			payload: "{line:number,column:number,offset:number}"
			when: Cursor position changes.
		- name: save_request
			payload: "{value:string}"
			when: Ctrl+S pressed.
	methods:
		- name: set_value
			signature: set_value(text)
			description: Programmatic content replacement.
		- name: get_value
			signature: get_value()
			description: Returns current content string.
		- name: set_language
			signature: set_language(lang)
			description: Updates tokenization mode.
		- name: format_document
			signature: format_document()
			description: Formats text for supported languages (json baseline).
interaction:
	keyboard:
		- key: Tab
			behavior: Inserts indentation or shifts selection if Shift held.
		- key: Ctrl+S
			behavior: Emits save_request (no default browser action).
		- key: Ctrl+Z / Ctrl+Y
			behavior: Undo/redo.
		- key: Arrow keys
			behavior: Cursor movement preserving column intent.
	pointer:
		- Text selection by drag.
		- Gutter click positions cursor at line start.
accessibility:
	roles:
		- role="textbox" with aria-multiline="true"
	aria:
		- aria-label required from host context
		- aria-readonly reflects read_only
		- aria-describedby may point to syntax/help text
	focus:
		- Single internal focus target for keyboard editing.
styling:
	css_classes: [jsgui-code-editor, code-editor-gutter, code-editor-surface, code-editor-readonly, code-editor-dirty]
	tokens:
		- --j-bg-elevated
		- --j-fg
		- --j-fg-muted
		- --j-border
		- --j-primary
acceptance:
	e2e:
		- Typing emits change with source=user.
		- set_value emits change with source=api (configurable suppression allowed).
		- Ctrl+S emits save_request.
		- read_only blocks editing but allows selection and copy.
		- line number rendering tracks wrapped/non-wrapped mode correctly.
	done_definition:
		- Handles large documents without visible lag at typical form sizes.
```

### 6.3.8 `Console_Panel`

```yaml
spec_version: "1.0"
control:
	class_name: Console_Panel
	type_name: console_panel
	category: 1-standard/5-ui
	priority: P0
	target_tier: T3
	proposed_file: controls/organised/1-standard/5-ui/console_panel.js
	dependencies: [Control, Scroll_View, Text_Input, Button, Badge]
status:
	implemented: true
	notes: >
		~100-line implementation with output viewport, prompt input,
		append_line/clear methods, auto-scroll. Current tier ~T1. Missing
		command history, level-based styling, max_lines cap, batch append.
purpose:
	summary: Shows streaming log output and supports command entry/dispatch.
	use_cases:
		- Server admin console.
		- In-app diagnostics shell.
composition:
	children: [output_viewport, output_lines, prompt_row, prompt_symbol, input, optional_quick_actions]
	variants: [dark_terminal, light_terminal]
	states: [idle, connected, disconnected, busy]
	default_variant: dark_terminal
	default_state: idle
api:
	props:
		- name: lines
			type: array<{id:string,text:string,level?:'info'|'warn'|'error'|'debug',ts?:string}>
			required: false
			default: []
			description: Initial output line buffer.
		- name: prompt
			type: string
			required: false
			default: "$"
			description: Prompt symbol/prefix.
		- name: auto_scroll
			type: boolean
			required: false
			default: true
			description: Keeps view pinned to bottom when new lines arrive.
		- name: max_lines
			type: number
			required: false
			default: 5000
			description: Ring-buffer cap.
	events:
		- name: command_submit
			payload: "{command:string}"
			when: User submits prompt input.
		- name: auto_scroll_change
			payload: "{enabled:boolean}"
			when: Auto-scroll toggled.
	methods:
		- name: append_line
			signature: append_line(line)
			description: Adds one line and trims buffer to max_lines.
		- name: append_lines
			signature: append_lines(lines)
			description: Batch append for stream chunks.
		- name: clear
			signature: clear()
			description: Clears output buffer.
		- name: set_connected
			signature: set_connected(flag)
			description: Updates connected/disconnected state.
interaction:
	keyboard:
		- key: Enter
			behavior: Submits current command.
		- key: ArrowUp
			behavior: Recalls previous command history.
		- key: ArrowDown
			behavior: Moves forward in history.
		- key: Ctrl+L
			behavior: Clears output (optional, configurable).
	pointer:
		- Scroll output with wheel/drag.
		- Toggle auto-scroll control.
accessibility:
	roles:
		- role="log" for output container
		- role="textbox" aria-multiline="false" for prompt input
	aria:
		- aria-live="polite" for output appends
		- aria-label for prompt input
	focus:
		- Prompt input receives focus on panel activation by default.
styling:
	css_classes: [jsgui-console-panel, console-output, console-line, console-prompt, console-input, console-level-error, console-level-warn, console-level-info, console-level-debug]
	tokens:
		- --j-bg-elevated
		- --j-fg
		- --j-fg-muted
		- --j-danger
		- --j-success
		- --j-warning
acceptance:
	e2e:
		- Appending lines respects max_lines cap.
		- Auto-scroll behavior is correct when user manually scrolls up.
		- Enter submits command and clears input.
		- History navigation works after multiple submissions.
		- Level-based styling (warn/error/info) is visible and stable.
	done_definition:
		- Supports high-volume append without UI freeze in normal admin workloads.
```

### 6.3.9 `Form_Designer`

```yaml
spec_version: "1.0"
control:
	class_name: Form_Designer
	type_name: form_designer
	category: 1-standard/1-editor
	priority: P0
	target_tier: T4
	proposed_file: controls/organised/1-standard/1-editor/form_designer.js
	dependencies: [Control, Grid, Split_Pane, Toolbox, Property_Grid, Code_Editor]
status:
	implemented: true
	notes: >
		~170-line implementation with canvas region, palette region, properties
		region, basic drag/drop skeleton. Current tier ~T1. Missing schema sync,
		undo/redo, resize handles, code preview, snapping, selection_change.
purpose:
	summary: Author, edit, and inspect form definitions through visual and source modes.
	use_cases:
		- Drag/drop control composition.
		- Selection and resize/move on form canvas.
		- Property editing with model synchronization.
	non_goals:
		- Not a full general-purpose app/page builder in v1.
composition:
	children:
		- toolbar_region
		- palette_region
		- canvas_region
		- properties_region
		- code_preview_region_optional
	variants: [design_only, design_code_split]
	states: [idle, dragging, selecting, resizing, dirty, preview_mode]
	default_variant: design_only
	default_state: idle
api:
	props:
		- name: schema
			type: object
			required: true
			description: Canonical form definition model.
		- name: selected_id
			type: string|null
			required: false
			default: null
			description: Current selected node id.
		- name: snap_to_grid
			type: boolean
			required: false
			default: true
			description: Enables positional snapping.
		- name: grid_size
			type: number
			required: false
			default: 8
			description: Snap increment.
	events:
		- name: schema_change
			payload: "{schema:object, source:'canvas'|'properties'|'code'}"
			when: Any authoritative mutation is applied.
		- name: selection_change
			payload: "{id:string|null}"
			when: Selection changes.
		- name: drop_control
			payload: "{control_type:string, target_id:string|null, position:{x:number,y:number}}"
			when: Palette control dropped onto canvas.
	methods:
		- name: load_schema
			signature: load_schema(schema)
			description: Replaces current design model.
		- name: export_schema
			signature: export_schema()
			description: Returns canonical schema.
		- name: select_node
			signature: select_node(id)
			description: Programmatically select canvas node.
		- name: undo
			signature: undo()
			description: Reverts previous operation.
		- name: redo
			signature: redo()
			description: Reapplies reverted operation.
interaction:
	keyboard:
		- key: Delete
			behavior: Deletes selected node (if allowed).
		- key: Arrow keys
			behavior: Nudges selected node (Shift for larger step).
		- key: Ctrl+Z / Ctrl+Y
			behavior: Undo/redo.
		- key: Ctrl+D
			behavior: Duplicates selected node.
	pointer:
		- Drag control from palette to canvas.
		- Click to select node.
		- Drag handles to resize.
		- Drag node body to move.
accessibility:
	roles:
		- role="application" on designer root (optional, if needed for interaction model)
		- role="tree"/"treeitem" for hierarchy panel (if present)
	aria:
		- aria-selected for selected node representation.
		- aria-grabbed during drag operations.
		- descriptive labels for handles (resize north-east etc.).
	focus:
		- Keyboard selection and movement possible without mouse.
styling:
	css_classes: [jsgui-form-designer, form-designer-canvas, form-designer-node, form-designer-node-selected, form-designer-handle, form-designer-palette, form-designer-properties]
	tokens:
		- --j-bg-elevated
		- --j-border
		- --j-primary
		- --j-fg
		- --j-fg-muted
acceptance:
	e2e:
		- Drag/drop from palette creates expected schema node.
		- Selection handles appear only for selected node.
		- Resize updates schema dimensions and visual bounds.
		- Property edit panel updates selected node and canvas.
		- Code edit path updates canvas after valid parse.
		- Undo/redo restores both schema and visual state.
	done_definition:
		- Ships with deterministic schema serialization.
		- Has isolation tests for schema mutation operations.
		- Has integrated Puppeteer flow tests.
```

### 6.3.10 `Filter_Chips`

```yaml
spec_version: "1.0"
control:
	class_name: Filter_Chips
	type_name: filter_chips
	category: 1-standard/5-ui
	priority: P1
	target_tier: T3
	proposed_file: controls/organised/1-standard/5-ui/filter_chips.js
	dependencies: [Chip]
status:
	implemented: true
	notes: >
		~175-line implementation with single/multi-select modes, chip rendering,
		selection_change event, allow_none support. Current tier ~T1. Missing
		scrollable variant, roving tabindex keyboard navigation, count badges.
purpose:
	summary: Presents compact selectable filter options with optional multi-select behavior.
	use_cases:
		- Category filter strip (All/Input/Data/Nav).
		- Quick segmented filtering in list/grid headers.
composition:
	children: [chip_item*]
	variants: [single_select, multi_select, scrollable]
	states: [normal, hover, active, focus, disabled]
	default_variant: single_select
	default_state: normal
api:
	props:
		- name: options
			type: array<{id:string,label:string,count?:number,disabled?:boolean}>
			required: true
			description: Filter option definitions.
		- name: mode
			type: string
			required: false
			default: single
			description: single|multiple.
		- name: selected_ids
			type: string[]
			required: false
			default: []
			description: Initially selected options.
		- name: allow_none
			type: boolean
			required: false
			default: false
			description: In single mode, allows unselecting current chip.
	events:
		- name: selection_change
			payload: "{selected_ids:string[], changed_id:string, selected:boolean}"
			when: Selection updates.
	methods:
		- name: select
			signature: select(id)
			description: Selects chip by id.
		- name: unselect
			signature: unselect(id)
			description: Unselects chip by id.
		- name: set_selected
			signature: set_selected(ids)
			description: Replaces full selection.
interaction:
	keyboard:
		- key: ArrowLeft / ArrowRight
			behavior: Moves focus across chips.
		- key: Enter
			behavior: Toggles focused chip selection.
		- key: Space
			behavior: Toggles focused chip selection.
		- key: Home / End
			behavior: Focus first/last chip.
	pointer:
		- Click toggles chip according to mode.
accessibility:
	roles:
		- role="radiogroup" + role="radio" for single mode
		- role="group" + role="checkbox" for multiple mode
	aria:
		- aria-checked on each chip
		- aria-disabled on disabled chips
	focus:
		- Roving tabindex across chips.
styling:
	css_classes: [jsgui-filter-chips, filter-chip, filter-chip-selected, filter-chip-disabled]
	tokens:
		- --j-primary
		- --j-border
		- --j-fg
		- --j-fg-muted
		- --j-bg-hover
acceptance:
	e2e:
		- Single mode enforces one selected chip unless allow_none=true.
		- Multiple mode supports additive toggles.
		- Keyboard arrows + Enter/Space work.
		- Disabled chip cannot be selected.
		- selection_change payload is correct and ordered.
	done_definition:
		- Suitable for reuse in toolbox and dashboard filters.
```

---

## 6.4 Implementation Order Recommendation

Recommended order by dependency and product impact:

1. `Separator`
2. `Group_Box`
3. `Icon_Button`
4. `Link_Button`
5. `Split_Button`
6. `Filter_Chips`
7. `Status_Bar`
8. `Console_Panel`
9. `Code_Editor`
10. `Form_Designer`

---

## 6.5 Validation Workflow (AI/CI)

1. Validate each YAML spec against `control-spec-v1` schema.
2. Generate implementation checklist from `acceptance.done_definition`.
3. Generate E2E skeleton from `acceptance.e2e`.
4. Enforce naming conventions:
	 - class names `Camel_Case`
	 - methods/variables `snake_case`
	 - files `snake_case.js`

This chapter is intentionally strict and machine-readable so it can be consumed directly by implementation agents and review tooling.
