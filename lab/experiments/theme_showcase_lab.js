/**
 * Theme Showcase Lab Experiment
 * 
 * Creates a visual showcase of themed controls to verify:
 * - Button variants render correctly
 * - Panel variants render correctly
 * - Token mappings apply CSS variables
 * - Data attributes are set for CSS targeting
 */
module.exports = {
    name: 'theme_showcase',
    description: 'Visual showcase of themed controls for verification',

    /**
     * Run the experiment.
     * @param {Object} tools - Lab utilities.
     */
    run: async (tools) => {
        const { create_lab_context, assert, cleanup } = tools;
        const context = create_lab_context();

        console.log('🎨 Theme Showcase Lab Experiment');
        console.log('=================================\n');

        // Load controls
        const jsgui = require('../../html-core/html-core');
        const Button = require('../../controls/organised/0-core/0-basic/0-native-compositional/button');
        const Panel = require('../../controls/organised/1-standard/6-layout/panel');
        const Control = jsgui.Control;

        // Create root container
        const root = new Control({ context, class: 'theme-showcase' });
        root.dom.attributes.style = {
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        };

        // === SECTION 1: Button Variants ===
        const btn_section = new Control({ context, class: 'section' });
        const btn_title = new jsgui.controls.h2({ context });
        btn_title.add('Button Variants');
        btn_section.add(btn_title);

        const btn_container = new Control({ context, class: 'button-grid' });
        btn_container.dom.attributes.style = {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px'
        };

        const button_variants = ['default', 'primary', 'secondary', 'ghost', 'danger', 'success', 'outline', 'link'];
        const button_checks = [];

        for (const variant of button_variants) {
            const btn = new Button({
                context,
                text: variant.charAt(0).toUpperCase() + variant.slice(1),
                variant
            });
            btn_container.add(btn);

            // Verify theming applied
            button_checks.push({
                variant,
                has_params: !!btn._theme_params,
                variant_param: btn._theme_params?.variant,
                data_variant: btn.dom.attributes?.['data-variant']
            });
        }

        btn_section.add(btn_container);
        root.add(btn_section);

        // === SECTION 2: Button Sizes ===
        const size_section = new Control({ context, class: 'section' });
        const size_title = new jsgui.controls.h2({ context });
        size_title.add('Button Sizes');
        size_section.add(size_title);

        const size_container = new Control({ context, class: 'size-grid' });
        size_container.dom.attributes.style = {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
        };

        const sizes = ['small', 'medium', 'large', 'xlarge'];
        const size_checks = [];

        for (const size of sizes) {
            const btn = new Button({
                context,
                text: size,
                variant: 'primary',
                params: { size }
            });
            size_container.add(btn);

            size_checks.push({
                size,
                has_token: !!btn.dom.attributes?.style?.['--btn-height'],
                height_var: btn.dom.attributes?.style?.['--btn-height']
            });
        }

        size_section.add(size_container);
        root.add(size_section);

        // === SECTION 3: Panel Variants ===
        const panel_section = new Control({ context, class: 'section' });
        const panel_title = new jsgui.controls.h2({ context });
        panel_title.add('Panel Variants');
        panel_section.add(panel_title);

        const panel_grid = new Control({ context, class: 'panel-grid' });
        panel_grid.dom.attributes.style = {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '24px'
        };

        const panel_variants = ['default', 'card', 'elevated', 'well', 'glass', 'outline'];
        const panel_checks = [];

        for (const variant of panel_variants) {
            const panel = new Panel({
                context,
                title: variant.charAt(0).toUpperCase() + variant.slice(1),
                variant,
                content: `This is a ${variant} panel.`
            });
            panel.dom.attributes.style = panel.dom.attributes.style || {};
            panel.dom.attributes.style.minHeight = '100px';
            panel_grid.add(panel);

            panel_checks.push({
                variant,
                has_params: !!panel._theme_params,
                padding: panel._theme_params?.padding,
                shadow: panel._theme_params?.shadow,
                radius: panel._theme_params?.radius,
                has_header: !!panel._ctrl_fields?.header
            });
        }

        panel_section.add(panel_grid);
        root.add(panel_section);

        // === SECTION 4: Icon Buttons ===
        const icon_section = new Control({ context, class: 'section' });
        const icon_title = new jsgui.controls.h2({ context });
        icon_title.add('Icon Buttons');
        icon_section.add(icon_title);

        const icon_container = new Control({ context, class: 'icon-grid' });
        icon_container.dom.attributes.style = {
            display: 'flex',
            gap: '12px',
            marginBottom: '24px'
        };

        const icon_buttons = [
            { text: 'Save', icon: '💾', variant: 'primary' },
            { text: 'Delete', icon: '🗑️', variant: 'danger' },
            { text: 'Settings', icon: '⚙️', variant: 'ghost' },
            { text: 'Next', icon: '→', variant: 'primary', params: { icon_position: 'right' } }
        ];

        for (const config of icon_buttons) {
            const btn = new Button({ context, ...config });
            icon_container.add(btn);
        }

        icon_section.add(icon_container);
        root.add(icon_section);

        // === Render HTML ===
        const html = root.all_html_render();

        // === Log Results ===
        console.log('📋 Button Checks:');
        console.table(button_checks);

        console.log('\n📋 Size Checks:');
        console.table(size_checks);

        console.log('\n📋 Panel Checks:');
        console.table(panel_checks);

        // === Assertions ===
        console.log('\n🔍 Running Assertions...');

        // Button assertions
        for (const check of button_checks) {
            assert(check.has_params, `Button ${check.variant} has _theme_params`);
        }

        // Size assertions
        for (const check of size_checks) {
            assert(check.has_token, `Button size ${check.size} has --btn-height token`);
        }

        // Panel assertions
        for (const check of panel_checks) {
            assert(check.has_params, `Panel ${check.variant} has _theme_params`);
        }

        // Specific variant checks
        const card_check = panel_checks.find(p => p.variant === 'card');
        assert(card_check.shadow === 'small', 'Card panel has small shadow');
        assert(card_check.has_header, 'Card panel has header');

        const elevated_check = panel_checks.find(p => p.variant === 'elevated');
        assert(elevated_check.shadow === 'large', 'Elevated panel has large shadow');
        assert(elevated_check.padding === 'large', 'Elevated panel has large padding');

        console.log('\n✅ All assertions passed!');

        // === Output Stats ===
        const stats = {
            buttons_rendered: button_checks.length,
            sizes_rendered: size_checks.length,
            panels_rendered: panel_checks.length,
            icon_buttons_rendered: icon_buttons.length,
            html_length: html.length,
            assertions_passed: true
        };

        console.log('\n📊 Generation Stats:');
        console.log(JSON.stringify(stats, null, 2));

        cleanup();

        return {
            ok: true,
            html,
            stats,
            checks: {
                buttons: button_checks,
                sizes: size_checks,
                panels: panel_checks
            }
        };
    }
};
