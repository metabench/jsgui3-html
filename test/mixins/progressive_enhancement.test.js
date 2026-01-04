const { expect } = require('chai');

const {
    register_swap,
    get_swap,
    swap_registry
} = require('../../control_mixins/swap_registry');
const { Activation_Manager } = require('../../control_mixins/activation');
const { enable_auto_enhancement } = require('../../control_mixins/auto_enhance');

class Test_Control {
    constructor(spec = {}) {
        this.spec = spec;
        this.activated = false;
        Test_Control.instances.push(this);
    }

    activate() {
        this.activated = true;
    }

    static reset_instances() {
        Test_Control.instances = [];
    }
}

Test_Control.instances = [];

describe('Progressive Enhancement Swaps', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
        swap_registry.clear();
        Test_Control.reset_instances();
    });

    afterEach(() => {
        swap_registry.clear();
        Test_Control.reset_instances();
    });

    it('registers and resolves swaps', () => {
        register_swap('input.test-swap', Test_Control, {
            enhancement_mode: 'enhance'
        });

        const element = document.createElement('input');
        element.classList.add('test-swap');

        const config = get_swap(element);
        expect(config).to.not.equal(null);
        expect(config.control_class).to.equal(Test_Control);
        expect(config.enhancement_mode).to.equal('enhance');
    });

    it('prefers higher priority swaps', () => {
        register_swap('input', Test_Control, { priority: 1 });
        register_swap('input.priority-swap', Test_Control, { priority: 10 });

        const element = document.createElement('input');
        element.classList.add('priority-swap');

        const config = get_swap(element);
        expect(config.priority).to.equal(10);
    });

    it('activates elements and extracts spec', () => {
        register_swap('input[data-swap="full"]', Test_Control, {
            enhancement_mode: 'full'
        });

        const element = document.createElement('input');
        element.setAttribute('data-swap', 'full');
        element.id = 'field-id';
        element.name = 'field_name';
        element.value = 'hello';
        element.placeholder = 'Enter text';
        element.required = true;
        element.disabled = true;
        element.setAttribute('data-jsgui-count', '5');
        element.setAttribute('data-jsgui-settings', '{"mode":"alpha"}');

        document.body.appendChild(element);

        const manager = new Activation_Manager(context);
        const activated_controls = manager.activate(document.body);

        expect(activated_controls.length).to.equal(1);
        expect(Test_Control.instances.length).to.equal(1);

        const instance = Test_Control.instances[0];
        expect(instance.activated).to.equal(true);
        expect(instance.spec.id).to.equal('field-id');
        expect(instance.spec.name).to.equal('field_name');
        expect(instance.spec.value).to.equal('hello');
        expect(instance.spec.placeholder).to.equal('Enter text');
        expect(instance.spec.required).to.equal(true);
        expect(instance.spec.disabled).to.equal(true);
        expect(instance.spec.count).to.equal(5);
        expect(instance.spec.settings).to.deep.equal({ mode: 'alpha' });
    });

    it('marks enhanced elements', () => {
        register_swap('input[data-swap="enhance"]', Test_Control, {
            enhancement_mode: 'enhance'
        });

        const element = document.createElement('input');
        element.setAttribute('data-swap', 'enhance');
        document.body.appendChild(element);

        const manager = new Activation_Manager(context);
        manager.activate(document.body);

        expect(element.getAttribute('data-jsgui-enhanced')).to.equal('true');
        expect(element.getAttribute('data-jsgui-enhanced-mode')).to.equal('enhance');
    });

    it('auto-enhances new nodes with MutationObserver', function() {
        const observer_class = typeof MutationObserver !== 'undefined'
            ? MutationObserver
            : (typeof window !== 'undefined' ? window.MutationObserver : undefined);

        if (!observer_class) {
            this.skip();
        }

        register_swap('input.jsgui-enhance', Test_Control, {
            enhancement_mode: 'enhance',
            predicate: (el) => el.classList.contains('jsgui-enhance')
        });

        const observer = enable_auto_enhancement(context, { immediate: false });
        if (!observer || typeof observer.disconnect !== 'function') {
            this.skip();
        }

        const element = document.createElement('input');
        element.classList.add('jsgui-enhance');
        document.body.appendChild(element);

        return waitFor(0).then(() => {
            expect(element.getAttribute('data-jsgui-enhanced')).to.equal('true');
            observer.disconnect();
        });
    });

    it('skips elements marked as no-enhance', () => {
        register_swap('input[data-swap="skip"]', Test_Control, {
            enhancement_mode: 'enhance'
        });

        const element = document.createElement('input');
        element.setAttribute('data-swap', 'skip');
        element.classList.add('jsgui-no-enhance');
        document.body.appendChild(element);

        const manager = new Activation_Manager(context);
        manager.activate(document.body);

        expect(Test_Control.instances.length).to.equal(0);
    });
});
