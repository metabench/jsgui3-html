module.exports = {
    name: 'control_text_render_fixtures',
    description: 'Render controls with text fixtures and verify HTML.',
    /**
     * Run control text render fixture experiment.
     * @param {Object} tools - Lab utilities.
     * @returns {Promise<Object>} Result summary.
     */
    run: async (tools) => {
        const { create_lab_context, assert, cleanup, load_fixture } = tools;
        const jsgui = require('../../html-core/html-core');
        const fixture_data = load_fixture('control_text_render_cases.json');
        const test_cases = fixture_data.cases || [];

        assert.ok(Array.isArray(test_cases) && test_cases.length > 0);

        for (const test_case of test_cases) {
            const context = create_lab_context();
            const control_spec = {
                context,
                tagName: test_case.tag_name,
                content: test_case.content
            };

            if (test_case.class_name) {
                control_spec.class = test_case.class_name;
            }

            const control = new jsgui.Control(control_spec);
            const html = control.html;
            const expected_contains = test_case.expected_contains || [];

            expected_contains.forEach(fragment => {
                assert.ok(
                    html.includes(fragment),
                    `${test_case.name} missing fragment: ${fragment}`
                );
            });
        }

        cleanup();
        return {
            ok: true,
            case_count: test_cases.length
        };
    }
};
