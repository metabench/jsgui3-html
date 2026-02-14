const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

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

    compose() {
        const { context } = this;
        this.clear();
        this.chip_controls = [];

        this.items.forEach(item => {
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

    activate() {
        if (this.__active) return;
        super.activate();

        this.chip_controls.forEach(chip => {
            if (!chip.dom || !chip.dom.el) return;

            const toggle_from_event = () => {
                const chip_id = chip.dom.attributes['data-chip-id'];
                if (!chip_id || chip.dom.attributes.disabled) return;
                this.toggle_chip(chip_id);
            };

            chip.dom.el.addEventListener('click', toggle_from_event);
            chip.dom.el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle_from_event();
                }
            });
        });
    }

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

    _sync_chip_state() {
        this.chip_controls.forEach(chip => {
            const chip_id = chip.dom.attributes['data-chip-id'];
            const selected = this.selected_ids.has(chip_id);
            chip.dom.attributes['aria-pressed'] = selected ? 'true' : 'false';
            if (selected) chip.add_class('filter-chip-selected');
            else chip.remove_class('filter-chip-selected');
        });
    }

    get_selected_ids() {
        return Array.from(this.selected_ids);
    }

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
    border: 1px solid var(--admin-border, #d1d5db);
    background: var(--admin-card-bg, #ffffff);
    color: var(--admin-text, #111827);
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
}

.jsgui-filter-chips .filter-chip:hover {
    background: var(--admin-hover, #f3f4f6);
}

.jsgui-filter-chips .filter-chip:focus-visible {
    outline: 2px solid var(--admin-accent, #2563eb);
    outline-offset: 1px;
}

.jsgui-filter-chips .filter-chip.filter-chip-selected {
    background: color-mix(in srgb, var(--admin-accent, #2563eb) 15%, white);
    border-color: var(--admin-accent, #2563eb);
    color: var(--admin-accent, #1d4ed8);
}

.jsgui-filter-chips .filter-chip.filter-chip-disabled {
    opacity: 0.55;
    cursor: not-allowed;
}
`;

module.exports = Filter_Chips;
