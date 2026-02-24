/**
 * @module controls/organised/1-standard/5-ui/filter_chips
 * @description A group of selectable pill-shaped chips for filtering data.
 *   Supports both single-select and multi-select modes. Each chip is a toggle
 *   button with `aria-pressed` tracking. Provides full keyboard navigation
 *   using roving tabindex and arrow keys.
 *
 * @example
 *   // Multi-select filter chips
 *   const chips = new Filter_Chips({
 *       context,
 *       items: [
 *           { id: 'all', label: 'All' },
 *           { id: 'active', label: 'Active' },
 *           { id: 'archived', label: 'Archived' }
 *       ],
 *       selected_ids: ['all']
 *   });
 *
 *   // Single-select mode
 *   const status = new Filter_Chips({
 *       context,
 *       multiple: false,
 *       items: [
 *           { id: 'open', label: 'Open' },
 *           { id: 'closed', label: 'Closed' }
 *       ]
 *   });
 *
 *   // With disabled chip
 *   const priority = new Filter_Chips({
 *       context,
 *       items: [
 *           { id: 'low', label: 'Low' },
 *           { id: 'high', label: 'High' },
 *           { id: 'critical', label: 'Critical', disabled: true }
 *       ]
 *   });
 *
 * @tier T3
 * @spec_version Control_Spec v1
 */
const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

/**
 * Filter_Chips control — a horizontal group of toggle-chip buttons.
 *
 * Each chip is a `<button>` with `aria-pressed` tracking. The group uses
 * `role="group"` with roving tabindex for keyboard navigation: the first
 * enabled chip is `tabindex=0`, all others are `tabindex=-1`. Arrow keys
 * cycle through chips.
 *
 * @extends Control
 *
 * @param {object}   spec
 * @param {object[]} [spec.items=[]]           - Chip definitions: `{ id, label?, disabled?, selected? }`
 * @param {string[]} [spec.selected_ids=[]]    - Initially selected chip IDs
 * @param {boolean}  [spec.multiple=true]      - Allow multiple selections (false = radio mode)
 * @param {string}   [spec.aria_label='Filter chips'] - Accessible group label
 *
 * @fires change  Emitted after toggle_chip. Payload: `{ selected_ids: string[] }`.
 *
 * @css .jsgui-filter-chips                        — Root group element
 * @css .jsgui-filter-chips .filter-chip           — Individual chip button
 * @css .jsgui-filter-chips .filter-chip-selected  — Active/selected chip
 * @css .jsgui-filter-chips .filter-chip-disabled  — Disabled chip
 *
 * @tokens --j-border, --j-bg-elevated, --j-fg, --j-bg-hover, --j-primary
 *
 * @keyboard ArrowRight/ArrowDown — Focus next chip (wraps)
 * @keyboard ArrowLeft/ArrowUp   — Focus previous chip (wraps)
 * @keyboard Home                — Focus first chip
 * @keyboard End                 — Focus last chip
 * @keyboard Enter/Space         — Toggle focused chip
 */
class Filter_Chips extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'filter_chips';
        super(spec);

        themeable(this, 'filter_chips', spec);

        this.add_class('filter-chips');
        this.add_class('jsgui-filter-chips');

        this.multiple = spec.multiple !== false;
        this.items = Array.isArray(spec.items) ? spec.items : [];
        this.selected_ids = new Set(Array.isArray(spec.selected_ids) ? spec.selected_ids : []);

        this.dom.attributes.role = 'group';
        this.dom.attributes['aria-label'] = spec.aria_label || 'Filter chips';
        this.dom.attributes['data-multiple'] = this.multiple ? 'true' : 'false';

        this.chip_controls = [];

        if (!spec.el) {
            this.compose();
        }
    }

    /**
     * Build chip buttons. First enabled chip gets `tabindex=0` (roving
     * tabindex pattern), all others get `tabindex=-1`.
     */
    compose() {
        const { context } = this;
        this.clear();
        this.chip_controls = [];

        let first_focusable_set = false;

        this.items.forEach((item) => {
            const chip_id = item && item.id ? String(item.id) : '';
            const chip_label = item && item.label ? String(item.label) : chip_id;
            const chip_disabled = !!(item && item.disabled);
            const chip_selected = this.selected_ids.has(chip_id) || !!(item && item.selected);

            if (chip_selected) this.selected_ids.add(chip_id);

            const chip = new Control({ context, tag_name: 'button' });
            chip.add_class('filter-chip');
            chip.dom.attributes.type = 'button';
            chip.dom.attributes['data-chip-id'] = chip_id;
            chip.dom.attributes['aria-pressed'] = chip_selected ? 'true' : 'false';
            chip.dom.attributes['aria-label'] = chip_label;

            // Roving tabindex — first enabled chip is focusable
            if (!chip_disabled && !first_focusable_set) {
                chip.dom.attributes.tabindex = '0';
                first_focusable_set = true;
            } else {
                chip.dom.attributes.tabindex = '-1';
            }

            if (chip_selected) chip.add_class('filter-chip-selected');
            if (chip_disabled) {
                chip.dom.attributes.disabled = true;
                chip.dom.attributes['aria-disabled'] = 'true';
                chip.add_class('filter-chip-disabled');
            }

            chip.add(chip_label);
            this.chip_controls.push(chip);
            this.add(chip);
        });
    }

    /**
     * Bind click and keyboard handlers. Click toggles a chip. Keyboard
     * navigation uses ArrowLeft/Right/Up/Down to cycle through chips,
     * Home/End to jump, and Enter/Space to toggle.
     */
    activate() {
        if (this.__active) return;
        super.activate();

        const el = this.dom && this.dom.el;
        if (!el) return;

        this.chip_controls.forEach(chip => {
            if (!chip.dom || !chip.dom.el) return;

            chip.dom.el.addEventListener('click', () => {
                const chip_id = chip.dom.attributes['data-chip-id'];
                if (!chip_id || chip.dom.attributes.disabled) return;
                this.toggle_chip(chip_id);
            });
        });

        // Keyboard navigation — ArrowLeft/Right + Enter/Space
        el.addEventListener('keydown', (e) => {
            const chips = el.querySelectorAll('.filter-chip:not([disabled])');
            const current = el.querySelector('.filter-chip:focus');
            if (!current || chips.length === 0) return;
            const idx = Array.from(chips).indexOf(current);

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown': {
                    e.preventDefault();
                    const next = (idx + 1) % chips.length;
                    this._set_roving_focus(chips, next);
                    break;
                }
                case 'ArrowLeft':
                case 'ArrowUp': {
                    e.preventDefault();
                    const prev = (idx - 1 + chips.length) % chips.length;
                    this._set_roving_focus(chips, prev);
                    break;
                }
                case 'Home': {
                    e.preventDefault();
                    this._set_roving_focus(chips, 0);
                    break;
                }
                case 'End': {
                    e.preventDefault();
                    this._set_roving_focus(chips, chips.length - 1);
                    break;
                }
                case 'Enter':
                case ' ': {
                    e.preventDefault();
                    const chip_id = current.getAttribute('data-chip-id');
                    if (chip_id) this.toggle_chip(chip_id);
                    break;
                }
            }
        });
    }

    /**
     * Set roving tabindex focus to a specific chip index.
     * Resets all chips to `tabindex=-1`, then sets the target to `0` and focuses it.
     *
     * @private
     * @param {NodeList} chips - Enabled chip elements
     * @param {number}   index - Index to focus
     */
    _set_roving_focus(chips, index) {
        chips.forEach(c => c.setAttribute('tabindex', '-1'));
        chips[index].setAttribute('tabindex', '0');
        chips[index].focus();
    }

    /**
     * Toggle a chip's selection state. In single-select mode, clears all
     * other selections first. Raises `change` event.
     *
     * @param {string} chip_id - The chip ID to toggle
     */
    toggle_chip(chip_id) {
        const id = String(chip_id);
        const currently_selected = this.selected_ids.has(id);

        if (currently_selected) {
            this.selected_ids.delete(id);
        } else {
            if (!this.multiple) {
                this.selected_ids.clear();
            }
            this.selected_ids.add(id);
        }

        this._sync_chip_state();
        this.raise('change', { selected_ids: this.get_selected_ids() });
    }

    /**
     * Sync the DOM state of all chip controls to match `this.selected_ids`.
     * @private
     */
    _sync_chip_state() {
        this.chip_controls.forEach(chip => {
            const chip_id = chip.dom.attributes['data-chip-id'];
            const selected = this.selected_ids.has(chip_id);
            chip.dom.attributes['aria-pressed'] = selected ? 'true' : 'false';
            if (selected) chip.add_class('filter-chip-selected');
            else chip.remove_class('filter-chip-selected');
        });
    }

    /**
     * Get the currently selected chip IDs.
     * @returns {string[]}
     */
    get_selected_ids() {
        return Array.from(this.selected_ids);
    }

    /**
     * Programmatically set selection. Replaces current selection.
     * @param {string[]} selected_ids
     */
    set_selected_ids(selected_ids) {
        this.selected_ids = new Set(Array.isArray(selected_ids) ? selected_ids.map(id => String(id)) : []);
        this._sync_chip_state();
    }
}

Filter_Chips.css = `
.jsgui-filter-chips {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
}

.jsgui-filter-chips .filter-chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--j-border, #d1d5db);
    background: var(--j-bg-elevated, #ffffff);
    color: var(--j-fg, #111827);
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease, box-shadow 80ms ease;
}

.jsgui-filter-chips .filter-chip:hover {
    background: var(--j-bg-hover, #f3f4f6);
}

.jsgui-filter-chips .filter-chip:focus-visible {
    outline: 2px solid var(--j-primary, #2563eb);
    outline-offset: 1px;
}

.jsgui-filter-chips .filter-chip.filter-chip-selected {
    background: color-mix(in srgb, var(--j-primary, #2563eb) 15%, white);
    border-color: var(--j-primary, #2563eb);
    color: var(--j-primary, #1d4ed8);
    font-weight: 500;
}

.jsgui-filter-chips .filter-chip.filter-chip-disabled {
    opacity: 0.55;
    cursor: not-allowed;
    pointer-events: none;
}
`;

module.exports = Filter_Chips;
