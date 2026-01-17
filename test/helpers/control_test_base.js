/**
 * Control Test Base Utilities
 * 
 * Reusable test helpers for comprehensive control testing.
 * Covers SSR, client-side activation, theme integration, and accessibility.
 */

const { expect } = require('chai');

/**
 * Test that a control can be instantiated without errors.
 * @param {Function} ControlClass - The control constructor
 * @param {Object} spec - Control specification
 * @returns {Object} The instantiated control
 */
function test_control_instantiation(ControlClass, spec = {}) {
    const context = global.createTestContext();
    const control = new ControlClass({ context, ...spec });

    expect(control).to.exist;
    expect(control.__type_name).to.be.a('string');

    return control;
}

/**
 * Test that a control renders valid HTML.
 * @param {Object} control - Control instance
 * @returns {string} The rendered HTML
 */
function test_ssr_render(control) {
    const html = control.all_html_render();

    expect(html).to.be.a('string');
    expect(html.length).to.be.greaterThan(0);
    expect(html).to.include('<'); // Should contain HTML tags

    return html;
}

/**
 * Test that rendered HTML contains expected structure.
 * @param {string} html - Rendered HTML string
 * @param {Object} expectations - Structure expectations
 * @param {string[]} expectations.contains - Strings that should be in HTML
 * @param {string[]} expectations.not_contains - Strings that should NOT be in HTML
 * @param {Object} expectations.attributes - Attribute key/values to check
 */
function test_html_structure(html, expectations = {}) {
    const { contains = [], not_contains = [], attributes = {} } = expectations;

    for (const expected of contains) {
        expect(html).to.include(expected, `HTML should contain: ${expected}`);
    }

    for (const unexpected of not_contains) {
        expect(html).to.not.include(unexpected, `HTML should NOT contain: ${unexpected}`);
    }

    for (const [attr, value] of Object.entries(attributes)) {
        expect(html).to.include(`${attr}="${value}"`, `HTML should have ${attr}="${value}"`);
    }
}

/**
 * Test that theme params are resolved correctly.
 * @param {Object} control - Control instance
 * @param {Object} expected_params - Expected theme param values
 */
function test_theme_params(control, expected_params) {
    expect(control._theme_params).to.exist;

    for (const [key, value] of Object.entries(expected_params)) {
        expect(control._theme_params[key]).to.equal(value,
            `Theme param ${key} should be ${value}`);
    }
}

/**
 * Test that CSS variables are applied to control.
 * @param {Object} control - Control instance
 * @param {Object} expected_vars - Expected CSS variable values
 */
function test_css_variables(control, expected_vars) {
    const style = control.dom.attributes.style;
    expect(style).to.exist;

    for (const [varName, value] of Object.entries(expected_vars)) {
        expect(style[varName]).to.equal(value,
            `CSS variable ${varName} should be ${value}`);
    }
}

/**
 * Test that data attributes are applied to control.
 * @param {Object} control - Control instance
 * @param {Object} expected_attrs - Expected data attribute values
 */
function test_data_attributes(control, expected_attrs) {
    for (const [attr, value] of Object.entries(expected_attrs)) {
        expect(control.dom.attributes[attr]).to.equal(value,
            `Data attribute ${attr} should be ${value}`);
    }
}

/**
 * Test that control has expected CSS classes in rendered output.
 * @param {string} html - Rendered HTML
 * @param {string[]} expected_classes - CSS classes that should be present
 */
function test_css_classes(html, expected_classes) {
    for (const className of expected_classes) {
        expect(html).to.include(className,
            `HTML should include class: ${className}`);
    }
}

/**
 * Mount a control to the test DOM and activate it.
 * @param {Object} control - Control instance
 * @returns {HTMLElement} The mounted DOM element
 */
function mount_and_activate(control) {
    const html = control.all_html_render();
    document.body.innerHTML = html;

    const el = document.body.firstElementChild;
    control.dom.el = el;

    if (typeof control.activate === 'function') {
        control.activate();
    }

    return el;
}

/**
 * Simulate a click event on an element.
 * @param {HTMLElement} element - Element to click
 */
function simulate_click(element) {
    const event = new Event('click', { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
}

/**
 * Simulate a keyboard event on an element.
 * @param {HTMLElement} element - Element target
 * @param {string} key - Key name (e.g., 'Enter', 'ArrowDown')
 * @param {string} type - Event type ('keydown', 'keyup', 'keypress')
 */
function simulate_keyboard(element, key, type = 'keydown') {
    const event = new KeyboardEvent(type, {
        key,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(event);
}

/**
 * Wait for a specified amount of time (async helper).
 * @param {number} ms - Milliseconds to wait
 */
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a test context with optional theme settings.
 * @param {Object} theme_options - Optional theme configuration
 * @returns {Object} Page context
 */
function create_themed_context(theme_options = {}) {
    const context = global.createTestContext();
    context.theme = theme_options;
    return context;
}

/**
 * Run a standard control lifecycle test suite.
 * @param {string} description - Test suite description
 * @param {Function} ControlClass - Control constructor
 * @param {Object} options - Test options
 */
function describe_control_lifecycle(description, ControlClass, options = {}) {
    const { default_spec = {}, expected_type_name } = options;

    describe(`${description} - Lifecycle`, () => {
        let context;

        beforeEach(() => {
            context = global.createTestContext();
        });

        afterEach(() => {
            global.cleanup();
        });

        it('instantiates without errors', () => {
            const control = new ControlClass({ context, ...default_spec });
            expect(control).to.exist;
        });

        if (expected_type_name) {
            it(`has __type_name set to "${expected_type_name}"`, () => {
                const control = new ControlClass({ context, ...default_spec });
                expect(control.__type_name).to.equal(expected_type_name);
            });
        }

        it('renders valid HTML', () => {
            const control = new ControlClass({ context, ...default_spec });
            const html = control.all_html_render();
            expect(html).to.be.a('string');
            expect(html.length).to.be.greaterThan(10);
        });

        it('can be mounted to DOM', () => {
            const control = new ControlClass({ context, ...default_spec });
            const el = mount_and_activate(control);
            expect(el).to.exist;
        });
    });
}

module.exports = {
    // Instantiation helpers
    test_control_instantiation,
    create_themed_context,

    // SSR testing
    test_ssr_render,
    test_html_structure,
    test_css_classes,

    // Theme testing
    test_theme_params,
    test_css_variables,
    test_data_attributes,

    // Client-side testing
    mount_and_activate,
    simulate_click,
    simulate_keyboard,
    wait,

    // Full lifecycle helper
    describe_control_lifecycle
};
