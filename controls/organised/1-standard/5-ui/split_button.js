const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

class Split_Button extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'split_button';
        super(spec);

        themeable(this, 'split_button', spec);

        this.add_class('split-button');
        this.add_class('jsgui-split-button');

        this.text = spec.text || 'Action';
        this.items = Array.isArray(spec.items) ? spec.items : [];
        this.default_action = spec.default_action || (this.items[0] && this.items[0].id) || 'default';
        this.disabled = !!spec.disabled;
        this.open = false;

        if (this.disabled) {
            this.dom.attributes['aria-disabled'] = 'true';
            this.add_class('split-button-disabled');
        }

        if (!spec.el) {
            this.compose();
        }
    }

    compose() {
        const { context } = this;

        this.primary_btn = new Control({ context, tag_name: 'button' });
        this.primary_btn.add_class('split-button-primary');
        this.primary_btn.dom.attributes.type = 'button';
        this.primary_btn.add(this.text);

        this.trigger_btn = new Control({ context, tag_name: 'button' });
        this.trigger_btn.add_class('split-button-trigger');
        this.trigger_btn.dom.attributes.type = 'button';
        this.trigger_btn.dom.attributes['aria-haspopup'] = 'menu';
        this.trigger_btn.dom.attributes['aria-expanded'] = 'false';
        this.trigger_btn.add('▾');

        this.menu = new Control({ context, tag_name: 'ul' });
        this.menu.add_class('split-button-menu');
        this.menu.dom.attributes.role = 'menu';

        this.items.forEach(item => {
            const li = new Control({ context, tag_name: 'li' });
            li.add_class('split-button-menu-item');
            li.dom.attributes.role = 'menuitem';
            li.dom.attributes['data-action-id'] = item.id;
            li.add(item.text || item.id);
            this.menu.add(li);
        });

        this.add(this.primary_btn);
        this.add(this.trigger_btn);
        this.add(this.menu);
    }

    activate() {
        if (this.__active) return;
        super.activate();

        if (this.disabled) return;

        if (this.primary_btn && this.primary_btn.dom && this.primary_btn.dom.el) {
            this.primary_btn.dom.el.addEventListener('click', () => {
                this.raise('action', { id: this.default_action, source: 'primary' });
            });
        }

        if (this.trigger_btn && this.trigger_btn.dom && this.trigger_btn.dom.el) {
            this.trigger_btn.dom.el.addEventListener('click', () => {
                if (this.open) this.close_menu();
                else this.open_menu();
            });
        }

        if (this.menu && this.menu.dom && this.menu.dom.el) {
            this.menu.dom.el.addEventListener('click', (event) => {
                const target = event.target && event.target.closest ? event.target.closest('[data-action-id]') : null;
                if (!target) return;
                const id = target.getAttribute('data-action-id');
                this.raise('action', { id, source: 'menu' });
                this.close_menu();
            });
        }
    }

    open_menu() {
        this.open = true;
        this.add_class('split-button-open');
        if (this.trigger_btn) {
            this.trigger_btn.dom.attributes['aria-expanded'] = 'true';
        }
        this.raise('menu_open_change', { open: true });
    }

    close_menu() {
        this.open = false;
        this.remove_class('split-button-open');
        if (this.trigger_btn) {
            this.trigger_btn.dom.attributes['aria-expanded'] = 'false';
        }
        this.raise('menu_open_change', { open: false });
    }

    set_items(items) {
        this.items = Array.isArray(items) ? items : [];
    }
}

Split_Button.css = `
.jsgui-split-button {
    position: relative;
    display: inline-flex;
    align-items: stretch;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--admin-border, #d1d5db);
}

.jsgui-split-button .split-button-primary,
.jsgui-split-button .split-button-trigger {
    border: none;
    background: var(--admin-card-bg, #fff);
    color: var(--admin-text, #111827);
    cursor: pointer;
    font: inherit;
    padding: 8px 10px;
}

.jsgui-split-button .split-button-trigger {
    border-left: 1px solid var(--admin-border, #d1d5db);
    min-width: 32px;
}

.jsgui-split-button .split-button-primary:hover,
.jsgui-split-button .split-button-trigger:hover {
    background: var(--admin-hover, #f3f4f6);
}

.jsgui-split-button .split-button-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 180px;
    margin: 0;
    padding: 4px;
    list-style: none;
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #d1d5db);
    border-radius: 6px;
    display: none;
    z-index: 10;
}

.jsgui-split-button.split-button-open .split-button-menu {
    display: block;
}

.jsgui-split-button .split-button-menu-item {
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
}

.jsgui-split-button .split-button-menu-item:hover {
    background: var(--admin-hover, #f3f4f6);
}

.jsgui-split-button.split-button-disabled {
    opacity: 0.55;
}
`;

module.exports = Split_Button;
