/**
 * Theme Parameters Unit Tests
 */

const { expect } = require('chai');
const {
    resolve_params,
    validate_param,
    derive_hooks,
    apply_hooks
} = require('../../control_mixins/theme_params');
const {
    get_variant_params,
    register_variant,
    get_variant_names,
    window_variants
} = require('../../themes/variants');

describe('Theme Variants', () => {
    describe('get_variant_params', () => {
        it('returns default variant when no name specified', () => {
            const params = get_variant_params('window');
            expect(params.button_position).to.equal('right');
            expect(params.button_style).to.equal('icons');
        });

        it('returns macos variant with left buttons', () => {
            const params = get_variant_params('window', 'macos');
            expect(params.button_position).to.equal('left');
            expect(params.button_style).to.equal('traffic-light');
            expect(params.button_order).to.deep.equal(['close', 'minimize', 'maximize']);
        });

        it('returns windows-11 variant', () => {
            const params = get_variant_params('window', 'windows-11');
            expect(params.button_position).to.equal('right');
            expect(params.button_style).to.equal('segoe');
        });

        it('returns minimal variant with only close button', () => {
            const params = get_variant_params('window', 'minimal');
            expect(params.show_minimize).to.equal(false);
            expect(params.show_maximize).to.equal(false);
            expect(params.show_close).to.equal(true);
        });

        it('returns empty object for unknown control type', () => {
            const params = get_variant_params('unknown_control', 'default');
            expect(params).to.deep.equal({});
        });

        it('normalizes control type to lowercase', () => {
            const params = get_variant_params('Window', 'macos');
            expect(params.button_position).to.equal('left');
        });
    });

    describe('register_variant', () => {
        it('registers a custom variant', () => {
            register_variant('window', 'custom', {
                button_position: 'left',
                button_style: 'outlined'
            });
            const params = get_variant_params('window', 'custom');
            expect(params.button_position).to.equal('left');
            expect(params.button_style).to.equal('outlined');
        });

        it('registers variant for new control type', () => {
            register_variant('dialog', 'centered', {
                position: 'center',
                modal: true
            });
            const params = get_variant_params('dialog', 'centered');
            expect(params.position).to.equal('center');
            expect(params.modal).to.equal(true);
        });
    });

    describe('get_variant_names', () => {
        it('returns all window variant names', () => {
            const names = get_variant_names('window');
            expect(names).to.include('default');
            expect(names).to.include('macos');
            expect(names).to.include('windows-11');
            expect(names).to.include('minimal');
        });

        it('returns empty array for unknown control type', () => {
            const names = get_variant_names('nonexistent');
            expect(names).to.deep.equal([]);
        });
    });
});

describe('Theme Params Resolution', () => {
    describe('resolve_params', () => {
        it('returns default variant params when no overrides', () => {
            const { params } = resolve_params('window', {}, {});
            expect(params.button_position).to.equal('right');
            expect(params.button_style).to.equal('icons');
        });

        it('uses variant from spec.variant', () => {
            const { params } = resolve_params('window', { variant: 'macos' }, {});
            expect(params.button_position).to.equal('left');
            expect(params.button_style).to.equal('traffic-light');
        });

        it('uses variant from context.theme.extends', () => {
            const context = { theme: { extends: 'macos' } };
            const { params } = resolve_params('window', {}, context);
            expect(params.button_position).to.equal('left');
        });

        it('spec.variant takes precedence over context.theme.extends', () => {
            const context = { theme: { extends: 'macos' } };
            const spec = { variant: 'windows-11' };
            const { params } = resolve_params('window', spec, context);
            expect(params.button_style).to.equal('segoe');
        });

        it('merges theme params over variant defaults', () => {
            const context = {
                theme: {
                    params: {
                        window: {
                            button_style: 'outlined'
                        }
                    }
                }
            };
            const { params } = resolve_params('window', {}, context);
            expect(params.button_position).to.equal('right'); // from default
            expect(params.button_style).to.equal('outlined'); // from theme
        });

        it('merges spec.params over theme params', () => {
            const context = {
                theme: {
                    params: {
                        window: {
                            button_style: 'outlined',
                            button_position: 'left'
                        }
                    }
                }
            };
            const spec = {
                params: {
                    button_style: 'icons'
                }
            };
            const { params } = resolve_params('window', spec, context);
            expect(params.button_position).to.equal('left'); // from theme
            expect(params.button_style).to.equal('icons'); // from spec (overrides)
        });
    });

    describe('validate_param', () => {
        it('returns value if valid', () => {
            const result = validate_param('pos', 'left', ['left', 'right'], 'right');
            expect(result).to.equal('left');
        });

        it('returns fallback if invalid', () => {
            const warnings = [];
            const warn = (msg) => warnings.push(msg);
            const result = validate_param('pos', 'center', ['left', 'right'], 'right', warn);
            expect(result).to.equal('right');
            expect(warnings.length).to.equal(1);
            expect(warnings[0]).to.include('center');
        });

        it('returns fallback if value is undefined', () => {
            const result = validate_param('pos', undefined, ['left', 'right'], 'right');
            expect(result).to.equal('right');
        });
    });

    describe('derive_hooks', () => {
        it('derives window hooks correctly', () => {
            const params = {
                button_style: 'traffic-light',
                button_position: 'left',
                title_alignment: 'center'
            };
            const { attrs, classes } = derive_hooks('window', params);
            expect(attrs['data-button-style']).to.equal('traffic-light');
            expect(attrs['data-button-position']).to.equal('left');
            expect(attrs['data-title-align']).to.equal('center');
        });

        it('skips title_alignment attr if left (default)', () => {
            const params = { title_alignment: 'left' };
            const { attrs } = derive_hooks('window', params);
            expect(attrs['data-title-align']).to.be.undefined;
        });

        it('derives button classes', () => {
            const params = { variant: 'primary', size: 'large' };
            const { classes } = derive_hooks('button', params);
            expect(classes).to.include('btn-primary');
            expect(classes).to.include('btn-large');
        });
    });

    describe('apply_hooks', () => {
        it('applies attributes to control dom', () => {
            const ctrl = { dom: { attributes: {} }, add_class: () => { } };
            const hooks = {
                attrs: { 'data-test': 'value' },
                classes: ['test-class']
            };
            apply_hooks(ctrl, hooks);
            expect(ctrl.dom.attributes['data-test']).to.equal('value');
        });

        it('handles missing dom gracefully', () => {
            const ctrl = { add_class: () => { } };
            const hooks = { attrs: { 'data-test': 'value' } };
            // Should not throw
            apply_hooks(ctrl, hooks);
        });
    });
});
