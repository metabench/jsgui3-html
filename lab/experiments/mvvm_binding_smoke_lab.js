module.exports = {
    name: 'mvvm_binding_smoke',
    description: 'Validate basic MVVM binding on a control.',
    /**
     * Run the MVVM binding smoke experiment.
     * @param {Object} tools - Lab utilities.
     * @returns {Promise<Object>} Result summary.
     */
    run: async (tools) => {
        const { create_lab_context, assert, wait_for, cleanup } = tools;
        const jsgui = require('../../html-core/html-core');
        const { Data_Object } = require('lang-tools');
        const context = create_lab_context();

        class Mvvm_Binding_Lab_Control extends jsgui.Control {
            constructor(spec = {}) {
                super(spec);
                this.data.model = new Data_Object({
                    value: 10
                });
                this.view.data.model = new Data_Object({
                    doubled: 0
                });
                this.bind({
                    'value': {
                        to: 'doubled',
                        transform: (val) => val * 2
                    }
                });
            }
        }

        const control = new Mvvm_Binding_Lab_Control({ context });
        await wait_for(25);
        assert.strictEqual(control.view.data.model.doubled, 20);

        cleanup();
        return { ok: true };
    }
};
