/**
 * Generate Theme Showcase HTML
 * 
 * Generates a complete HTML file with all themed controls for visual inspection.
 */

const fs = require('fs');
const path = require('path');

// Setup DOM
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;

// Load jsgui
const jsgui = require('./html-core/html-core');
const Button = require('./controls/organised/0-core/0-basic/0-native-compositional/button');
const Panel = require('./controls/organised/1-standard/6-layout/panel');
const Control = jsgui.Control;

const context = new jsgui.Page_Context();

// Build the showcase
const root = new Control({ context, class: 'theme-showcase' });

// === Button Variants Section ===
const btn_section = new Control({ context, class: 'section' });
const btn_title = new jsgui.controls.h2({ context });
btn_title.add('Button Variants');
btn_section.add(btn_title);

const btn_container = new Control({ context, class: 'button-grid' });
const button_variants = ['default', 'primary', 'secondary', 'ghost', 'danger', 'success', 'outline', 'link'];

for (const variant of button_variants) {
    const btn = new Button({
        context,
        text: variant.charAt(0).toUpperCase() + variant.slice(1),
        variant
    });
    btn_container.add(btn);
}
btn_section.add(btn_container);
root.add(btn_section);

// === Button Sizes Section ===
const size_section = new Control({ context, class: 'section' });
const size_title = new jsgui.controls.h2({ context });
size_title.add('Button Sizes');
size_section.add(size_title);

const size_container = new Control({ context, class: 'size-grid' });
const sizes = ['small', 'medium', 'large', 'xlarge'];

for (const size of sizes) {
    const btn = new Button({
        context,
        text: size,
        variant: 'primary',
        params: { size }
    });
    size_container.add(btn);
}
size_section.add(size_container);
root.add(size_section);

// === Panel Variants Section ===
const panel_section = new Control({ context, class: 'section' });
const panel_title = new jsgui.controls.h2({ context });
panel_title.add('Panel Variants');
panel_section.add(panel_title);

const panel_grid = new Control({ context, class: 'panel-grid' });
const panel_variants = ['default', 'card', 'elevated', 'well', 'glass', 'outline'];

for (const variant of panel_variants) {
    const panel = new Panel({
        context,
        title: variant.charAt(0).toUpperCase() + variant.slice(1),
        variant,
        content: `This is a ${variant} panel with themed styling.`
    });
    panel_grid.add(panel);
}
panel_section.add(panel_grid);
root.add(panel_section);

// === Icon Buttons Section ===
const icon_section = new Control({ context, class: 'section' });
const icon_title = new jsgui.controls.h2({ context });
icon_title.add('Icon Buttons');
icon_section.add(icon_title);

const icon_container = new Control({ context, class: 'icon-grid' });
const icon_buttons = [
    { text: 'Save', icon: '💾', variant: 'primary' },
    { text: 'Delete', icon: '🗑️', variant: 'danger' },
    { text: 'Settings', icon: '⚙️', variant: 'ghost' },
    { text: 'Next', icon: '→', variant: 'primary', params: { icon_position: 'right' } },
    { text: 'Previous', icon: '←', variant: 'outline' }
];

for (const config of icon_buttons) {
    const btn = new Button({ context, ...config });
    icon_container.add(btn);
}
icon_section.add(icon_container);
root.add(icon_section);

// === Mixed Controls Section ===
const mixed_section = new Control({ context, class: 'section' });
const mixed_title = new jsgui.controls.h2({ context });
mixed_title.add('Mixed Controls');
mixed_section.add(mixed_title);

const mixed_panel = new Panel({
    context,
    title: 'Card with Buttons',
    variant: 'card'
});

const btn_row = new Control({ context, class: 'button-grid' });
btn_row.add(new Button({ context, text: 'Cancel', variant: 'ghost' }));
btn_row.add(new Button({ context, text: 'Save Draft', variant: 'outline' }));
btn_row.add(new Button({ context, text: 'Publish', variant: 'primary' }));
mixed_panel.add_content(btn_row);

mixed_section.add(mixed_panel);
root.add(mixed_section);

// Render HTML
const controls_html = root.all_html_render();

// CSS for the showcase
const css = `
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 24px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    min-height: 100vh;
    color: #fff;
}

h2 {
    margin: 0 0 16px 0;
    font-weight: 600;
    font-size: 18px;
    color: #e0e0e0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 8px;
}

.section {
    margin-bottom: 32px;
}

.button-grid, .size-grid, .icon-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}

.panel-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

/* Button base styles - using CSS variables from theme tokens */
.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--btn-gap, 6px);
    height: var(--btn-height, 36px);
    padding: 0 var(--btn-padding-x, 16px);
    font-size: var(--btn-font-size, 14px);
    font-weight: 500;
    border: none;
    border-radius: var(--btn-border-radius, 6px);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

/* Button variants - targeting data-variant attribute */
.button[data-variant="default"],
.button[data-variant="secondary"] {
    background: #3d3d5c;
    color: #fff;
}
.button[data-variant="default"]:hover,
.button[data-variant="secondary"]:hover {
    background: #4a4a6a;
}

.button[data-variant="primary"] {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
.button[data-variant="primary"]:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.button[data-variant="ghost"] {
    background: transparent;
    color: #a0a0c0;
    border: 1px solid rgba(255,255,255,0.15);
}
.button[data-variant="ghost"]:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.25);
}

.button[data-variant="danger"] {
    background: linear-gradient(135deg, #ff6b6b 0%, #c44569 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.button[data-variant="success"] {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(56, 239, 125, 0.3);
}

.button[data-variant="outline"] {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
}
.button[data-variant="outline"]:hover {
    background: rgba(102, 126, 234, 0.1);
}

.button[data-variant="link"] {
    background: transparent;
    color: #667eea;
    padding: 0;
    height: auto;
}
.button[data-variant="link"]:hover {
    text-decoration: underline;
}

/* Panel base styles - using CSS variables from theme tokens */
.panel {
    padding: var(--panel-padding, 16px);
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: var(--radius, 8px);
    box-shadow: var(--shadow, none);
    min-height: 120px;
}

.panel.bordered {
    border: 1px solid rgba(255,255,255,0.1);
}

.panel-header {
    margin-bottom: 12px;
}

.panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
}

.panel-content {
    font-size: 13px;
    color: #a0a0c0;
    line-height: 1.5;
}

/* Panel variants via data attributes */
.panel[data-variant="card"] {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255,255,255,0.1);
}

.panel[data-variant="elevated"] {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.panel[data-variant="well"] {
    background: rgba(0, 0, 0, 0.2);
    box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
}

.panel[data-variant="glass"] {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.panel[data-variant="outline"] {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Icon styling */
.button-icon {
    font-size: var(--btn-icon-size, 16px);
}

.button-text {
    /* Text styling */
}

/* Footer */
.footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.1);
    font-size: 12px;
    color: #666;
    text-align: center;
}
`;

// Full HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>jsgui3-html Theme Showcase</title>
    <style>${css}</style>
</head>
<body>
    ${controls_html}
    <div class="footer">
        jsgui3-html Theme System • Generated ${new Date().toISOString()}
    </div>
</body>
</html>`;

// Write to file
const output_path = path.join(__dirname, 'lab/results/theme_showcase_full.html');
fs.writeFileSync(output_path, html, 'utf8');

console.log(`✅ Generated: ${output_path}`);
console.log(`   HTML size: ${html.length} bytes`);
console.log(`   Controls: ${button_variants.length} buttons, ${sizes.length} sizes, ${panel_variants.length} panels`);
