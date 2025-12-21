module.exports = {
    name: 'control_render_smoke',
    description: 'Render a basic control and verify HTML output.',
    /**
     * Run the control render smoke test.
     * @param {Object} tools - Lab utilities.
     * @returns {Promise<Object>} Result summary.
     */
    run: async (tools) => {
        const { create_lab_context, assert, cleanup } = tools;
        const jsgui = require('../../html-core/html-core');
        const context = create_lab_context();

        const control = new jsgui.Control({
            context,
            tagName: 'div',
            class: 'lab-smoke',
            content: 'Lab Smoke'
        });

        const html = control.html;
        assert.ok(typeof html === 'string');
        assert.ok(html.includes('lab-smoke'));
        assert.ok(html.includes('Lab Smoke'));

        cleanup();
        return { ok: true };
    }
};
