module.exports = {
    name: 'mvvm_two_way_binding',
    description: 'Validate bidirectional bindings with transform and reverse.',
    /**
     * Run the MVVM two-way binding experiment.
     * @param {Object} tools - Lab utilities.
     * @returns {Promise<Object>} Result summary.
     */
    run: async (tools) => {
        const { create_lab_context, assert, wait_for, cleanup } = tools;
        const jsgui = require('../../html-core/html-core');
        const { Data_Object } = require('lang-tools');
        const context = create_lab_context();

        class Mvvm_Two_Way_Binding_Lab_Control extends jsgui.Control {
            constructor(spec = {}) {
                spec.__type_name = spec.__type_name || 'mvvm_two_way_binding_lab_control';
                super(spec);
                this.data.model = new Data_Object({
                    amount: 12
                });
                this.view.data.model = new Data_Object({
                    amount_text: ''
                });

                this.bind({
                    amount: {
                        to: 'amount_text',
                        transform: (amount) => `${amount}`,
                        reverse: (amount_text) => {
                            const parsed = parseFloat(amount_text);
                            return Number.isNaN(parsed) ? 0 : parsed;
                        }
                    }
                }, {
                    bidirectional: true
                });
            }
        }

        const control = new Mvvm_Two_Way_Binding_Lab_Control({ context });

        await wait_for(25);
        assert.strictEqual(control.view.data.model.amount_text, '12');

        control.view.data.model.amount_text = '42';
        await wait_for(25);
        assert.strictEqual(control.data.model.amount, 42);

        cleanup();
        return { ok: true };
    }
};
