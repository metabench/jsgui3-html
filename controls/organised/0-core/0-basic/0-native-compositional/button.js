const jsgui = require('../../../../../html-core/html-core');
const { themeable } = require('../../../../../control_mixins/themeable');
const { apply_token_map } = require('../../../../../themes/token_maps');

var Control = jsgui.Control;

/**
 * Button control with theme support.
 * 
 * Supports variants: default, primary, ghost, danger, success, outline, link
 * Supports sizes: small, medium, large, xlarge
 * 
 * @example
 * // Default button
 * new Button({ text: 'Click me' });
 * 
 * // Primary button
 * new Button({ text: 'Submit', variant: 'primary' });
 * 
 * // Large ghost button
 * new Button({ 
 *     text: 'Learn more', 
 *     variant: 'ghost',
 *     params: { size: 'large' }
 * });
 */
class Button extends Control {
    constructor(spec = {}, add, make) {
        spec.__type_name = spec.__type_name || 'button';
        spec.tag_name = 'button';
        super(spec);
        this.add_class('button');
        this.add_class('jsgui-button');

        // Apply themeable - resolves params and applies hooks
        const params = themeable(this, 'button', spec);

        // Apply token mappings (size -> CSS variables)
        apply_token_map(this, 'button', params);

        // Store text/label
        if (spec.text || spec.label) {
            this.text = spec.text || spec.label;
        }

        // Store icon if provided
        if (spec.icon) {
            this.icon = spec.icon;
        }

        if (!spec.el) {
            this.compose(params);
        }
    }

    /**
     * Compose the button contents based on params.
     * @param {Object} params - Resolved theme params
     */
    compose(params) {
        const { context } = this;
        const icon_position = params.icon_position || 'left';

        // Create icon element if needed
        let icon_element = null;
        if (this.icon && icon_position !== 'none') {
            icon_element = new jsgui.controls.span({ context });
            icon_element.add_class('button-icon');
            icon_element.add(this.icon);
        }

        // Create text element if needed
        let text_element = null;
        if (this.text && icon_position !== 'only') {
            text_element = new jsgui.controls.span({ context });
            text_element.add_class('button-text');
            text_element.add(this.text);
        }

        // Add in correct order based on icon_position
        if (icon_position === 'only' && icon_element) {
            this.add(icon_element);
        } else if (icon_position === 'right') {
            if (text_element) this.add(text_element);
            if (icon_element) this.add(icon_element);
        } else {
            // Default: left or no icon
            if (icon_element) this.add(icon_element);
            if (text_element) this.add(text_element);
        }

        // Fallback: if no icon and no text element, add raw text
        if (!icon_element && !text_element && this.text) {
            this.add(this.text);
        }
    }

    /**
     * Legacy compose method for backward compatibility.
     * @deprecated Use compose instead
     */
    'compose_button'() {
        // This is now handled by compose, but keep for subclass compatibility
        if (this.text && !this._theme_params) {
            this.add(this.text);
        }
    }

    'activate'() {
        super.activate();
    }

    /**
     * Set the button disabled state.
     * @param {boolean} disabled - Whether button is disabled
     */
    set_disabled(disabled) {
        this.dom.attributes = this.dom.attributes || {};
        if (disabled) {
            this.dom.attributes.disabled = 'disabled';
            this.add_class('disabled');
        } else {
            delete this.dom.attributes.disabled;
            this.remove_class('disabled');
        }
    }

    /**
     * Set loading state with optional spinner.
     * @param {boolean} loading - Whether button is loading
     */
    set_loading(loading) {
        if (loading) {
            this.add_class('loading');
            this.set_disabled(true);
        } else {
            this.remove_class('loading');
            this.set_disabled(false);
        }
    }
}

module.exports = Button;

// Test code
if (require.main === module) {
    class London_Button extends Button {
        constructor(spec = {}, add, make) {
            spec.text = "London, England";
            super(spec, add, make);
        }
    }
    const lbtn = new London_Button();
    console.log(lbtn.all_html_render());

    // Test themed button
    const primary_btn = new Button({
        text: 'Primary',
        variant: 'primary',
        params: { size: 'large' }
    });
    console.log('Primary button params:', primary_btn._theme_params);
}