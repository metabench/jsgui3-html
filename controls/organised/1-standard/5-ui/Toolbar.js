/**
 * Toolbar - A horizontal container for tool buttons and controls
 * 
 * Features:
 * - Horizontal layout with flexible items
 * - Separators between groups
 * - Icon + text buttons
 * - Tooltips
 */

const Control = require('../../../../html-core/control');
const Button = require('../../0-core/0-basic/0-native-compositional/button');
const {
    apply_focus_ring,
    apply_label,
    ensure_sr_text
} = require('../../../../control_mixins/a11y');

class Toolbar extends Control {
    constructor(options = {}) {
        super(options);
        
        this.add_class('toolbar');
        
        if (options.orientation === 'vertical') {
            this.add_class('toolbar-vertical');
        } else {
            this.add_class('toolbar-horizontal');
        }
        
        this.items = [];
    }
    
    /**
     * Add a button to the toolbar
     */
    addButton(config) {
        const { context } = this;
        const button = new Button({ context });
        button.add_class('toolbar-button');
        apply_focus_ring(button);
        
        if (config.icon) {
            const icon = new Control({ context, tag_name: 'span' });
            icon.add_class('toolbar-button-icon');
            icon.add(config.icon);
            button.add(icon);
        }
        
        if (config.label) {
            const label = new Control({ context, tag_name: 'span' });
            label.add_class('toolbar-button-label');
            label.add(config.label);
            button.add(label);
        }

        if (config.aria_label) {
            apply_label(button, config.aria_label, {force: true});
        }

        if (!config.label && config.icon) {
            const sr_text = config.aria_label || config.tooltip || 'Toolbar action';
            ensure_sr_text(button, sr_text);
        }
        
        if (config.tooltip) {
            button.dom.attributes.title = config.tooltip;
        }
        
        if (config.onClick) {
            button.on('click', config.onClick);
        }
        
        this.add(button);
        this.items.push(button);
        
        return button;
    }
    
    /**
     * Add a separator
     */
    addSeparator() {
        const { context } = this;
        const separator = new Control({ context, tag_name: 'div' });
        separator.add_class('toolbar-separator');
        this.add(separator);
        this.items.push(separator);
        return separator;
    }
    
    /**
     * Add a spacer (flexible space)
     */
    addSpacer() {
        const { context } = this;
        const spacer = new Control({ context, tag_name: 'div' });
        spacer.add_class('toolbar-spacer');
        this.add(spacer);
        this.items.push(spacer);
        return spacer;
    }
    
    /**
     * Add any custom control
     */
    addControl(control) {
        control.add_class('toolbar-item');
        this.add(control);
        this.items.push(control);
        return control;
    }
    
    /**
     * Clear all items
     */
    clear() {
        this.content.clear();
        this.items = [];
    }
}

module.exports = Toolbar;
