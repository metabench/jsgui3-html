const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');
const Vertical_Expander = require('./vertical-expander');

const normalize_sections = sections => {
    if (!Array.isArray(sections)) return [];
    return sections.map((section, index) => {
        if (section && typeof section === 'object') {
            const id = is_defined(section.id) ? String(section.id) : `section-${index}`;
            return {
                id,
                title: is_defined(section.title) ? section.title : `Section ${index + 1}`,
                content: section.content,
                open: !!section.open
            };
        }
        return {
            id: `section-${index}`,
            title: String(section),
            content: undefined,
            open: false
        };
    });
};

class Accordion extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'accordion';
        super(spec);
        this.add_class('accordion');
        this.dom.tagName = 'div';

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this.allow_multiple = !!spec.allow_multiple;
        this.set_sections(spec.sections || []);
        if (Array.isArray(spec.open_ids)) {
            this.set_open_ids(spec.open_ids);
        } else {
            const initial_open = (this.sections || [])
                .filter(section => section.open)
                .map(section => section.id);
            this.set_open_ids(initial_open);
        }

        if (!spec.el) {
            this.compose_accordion();
        }

        this.bind_model();
    }

    bind_model() {
        if (!this.model || typeof this.model.on !== 'function') return;

        this.model.on('change', e_change => {
            if (e_change.name === 'sections') {
                this.sections = normalize_sections(e_change.value);
                this.render_sections();
            }
            if (e_change.name === 'open_ids') {
                this.open_ids = Array.isArray(e_change.value) ? e_change.value.map(String) : [];
                this.sync_open_state();
            }
        });
    }

    set_model_value(name, value) {
        if (this.model && typeof this.model.set === 'function') {
            this.model.set(name, value);
        } else if (this.model) {
            this.model[name] = value;
        }
    }

    /**
     * Set accordion sections.
     * @param {Array} sections - Sections to set.
     */
    set_sections(sections) {
        const normalized = normalize_sections(sections);
        this.set_model_value('sections', normalized);
        this.sections = normalized;
    }

    /**
     * Set open section ids.
     * @param {Array} open_ids - Ids to open.
     */
    set_open_ids(open_ids) {
        const ids = Array.isArray(open_ids) ? open_ids.map(String) : [];
        this.set_model_value('open_ids', ids);
        this.open_ids = ids;
    }

    /**
     * Get open section ids.
     * @returns {Array}
     */
    get_open_ids() {
        return this.open_ids || [];
    }

    /**
     * Toggle section by id.
     * @param {string} section_id - Section id to toggle.
     */
    toggle_section(section_id) {
        const id = String(section_id);
        const open_ids = this.get_open_ids().slice();
        const index = open_ids.indexOf(id);
        if (index >= 0) {
            open_ids.splice(index, 1);
        } else {
            if (!this.allow_multiple) {
                open_ids.length = 0;
            }
            open_ids.push(id);
        }
        this.set_open_ids(open_ids);
        this.raise('toggle', { open_ids });
    }

    compose_accordion() {
        this.render_sections();
    }

    render_sections() {
        this.clear();
        this.section_controls = [];

        (this.sections || []).forEach((section, index) => {
            const header_ctrl = new Control({ context: this.context, tag_name: 'button' });
            header_ctrl.add_class('accordion-header');
            header_ctrl.dom.attributes.type = 'button';
            header_ctrl.dom.attributes['data-section-id'] = section.id;
            header_ctrl.add(section.title);

            const expander_ctrl = new Vertical_Expander({
                context: this.context,
                state: section.open ? 'open' : 'closed'
            });
            expander_ctrl.add_class('accordion-expander');
            expander_ctrl.dom.attributes['data-section-id'] = section.id;

            const content_ctrl = new Control({ context: this.context, tag_name: 'div' });
            content_ctrl.add_class('accordion-content');
            if (is_defined(section.content)) {
                content_ctrl.add(section.content);
            }

            expander_ctrl.add(content_ctrl);

            const section_ctrl = new Control({ context: this.context, tag_name: 'div' });
            section_ctrl.add_class('accordion-section');
            section_ctrl.add(header_ctrl);
            section_ctrl.add(expander_ctrl);

            this.section_controls.push({
                id: section.id,
                header: header_ctrl,
                expander: expander_ctrl,
                section: section_ctrl
            });

            this.add(section_ctrl);
        });

        this.sync_open_state();
    }

    sync_open_state() {
        const open_ids = this.get_open_ids();
        (this.section_controls || []).forEach(section => {
            const is_open = open_ids.includes(section.id);
            if (section.header) {
                if (is_open) {
                    section.header.add_class('is-open');
                } else {
                    section.header.remove_class('is-open');
                }
            }
            if (section.expander) {
                section.expander.state = is_open ? 'open' : 'closed';
            }
        });
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            this.add_dom_event_listener('click', e_click => {
                const target = e_click.target;
                if (!target || !target.getAttribute) return;
                const section_id = target.getAttribute('data-section-id');
                if (!is_defined(section_id)) return;
                this.toggle_section(section_id);
            });
        }
    }
}

Accordion.css = `
.accordion {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.accordion-section {
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
}
.accordion-header {
    width: 100%;
    text-align: left;
    padding: 8px 12px;
    background: #f2f2f2;
    border: none;
    cursor: pointer;
}
.accordion-header.is-open {
    background: #e6e6e6;
}
.accordion-content {
    padding: 10px 12px;
    background: #fff;
}
`;

module.exports = Accordion;
