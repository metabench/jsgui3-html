const { assert } = require('chai');
const jsgui = require('../../html.js');
const { Control, Data_Object, tpl } = jsgui;
const Data_Model_View_Model_Control = require('../../html-core/Data_Model_View_Model_Control');
const { ensure_control_models } = require('../../html-core/control_model_factory');

describe('Declarative Bindings in tpl', () => {

    class MockControl extends Control {
        constructor(spec) {
            super(spec);
            this.__type_name = 'mockcontrol';

            // Just simulate a field to bind to
            if (this.data && this.data.model) {
                if (this.view && this.view.data && this.view.data.model) {
                    this._binding_manager.bind_value(
                        this.data.model, 'val',
                        this.view.data.model, 'val',
                        { bidirectional: true }
                    );
                }
            }
        }
    }
    jsgui.controls['mockcontrol'] = MockControl;
    jsgui.controls['input'] = jsgui.input;

    let parent;

    beforeEach(() => {
        parent = new Control();
        parent.data = parent.data || {};
        parent.data.model = new Data_Object({
            parent_name: 'Parent Value',
            parent_age: 30
        });
    });

    const unwrap = (v) => v && v.value !== undefined ? v.value : v;

    it('should export tpl from the public namespace', () => {
        assert.strictEqual(typeof tpl, 'function');
        assert.strictEqual(jsgui.tpl, tpl);
    });

    it('should bind simple tuple using mbind()', () => {

        const ui = tpl`
            <div>
                <mockcontrol name="mock1" bind-val=${parent.mbind('parent_name')} />
            </div>
        `.mount(parent);

        const mock1 = parent.mock1;
        assert.isOk(mock1, 'Mock control should be created');

        // Let's assert the binding works!
        // The mock1 receives parent_name mapped into its own "val" property according to the attr: bind-val

        // 1. Initial sync test
        assert.strictEqual(unwrap(mock1.data.model.get('val')), 'Parent Value', 'Child data model should have initial mapped value');

        // 2. Downstream sync
        parent.data.model.set('parent_name', 'Downstream Update');
        assert.strictEqual(unwrap(mock1.data.model.get('val')), 'Downstream Update', 'Downstream sync failed');

        // 3. Upstream sync (because mbind is bidirectional by default for array tuples)
        mock1.data.model.set('val', 'Upstream Update');
        assert.strictEqual(unwrap(parent.data.model.get('parent_name')), 'Upstream Update', 'Upstream sync failed');
    });

    it('should bind advanced options using mbind()', () => {
        const advanced_cfg = parent.mbind('parent_age', {
            transform: val => parseInt(unwrap(val)) + 10,
            reverse: val => parseInt(unwrap(val)) - 10,
            bidirectional: true
        });

        const ui = tpl`
            <div>
                <mockcontrol name="mock2" bind-val=${advanced_cfg} />
            </div>
        `.mount(parent);

        const mock2 = parent.mock2;

        // 1. Initial sync with transform
        assert.strictEqual(unwrap(mock2.data.model.get('val')), 40, 'Initial sync with transform failed');

        // 2. Upstream sync with reverse
        mock2.data.model.set('val', 100);
        assert.strictEqual(unwrap(parent.data.model.get('parent_age')), 90, 'Upstream sync with reverse failed');
    });

    it('should attach event listeners using on-*', () => {
        let clicked = false;
        const handler = () => { clicked = true; };

        const ui = tpl`
            <div>
                <mockcontrol name="mock3" on-click=${handler} />
            </div>
        `.mount(parent);

        const mock3 = parent.mock3;
        assert.isOk(mock3, 'Mock control should be created');

        // Simulate click
        mock3.raise('click');
        assert.isTrue(clicked, 'Event hook failed to wire up');
    });

    it('should dynamically toggle CSS classes with bind-class', () => {
        parent.data.model.set('isActive', true);
        parent.data.model.set('hasError', false);

        const ui = tpl`
            <div>
                <mockcontrol name="mockClass" bind-class=${{ 'is-active': parent.mbind('isActive'), 'error': [parent.data.model, 'hasError'] }} />
            </div>
        `.mount(parent);

        const mock = parent.mockClass;
        assert.isTrue(!!mock.has_class('is-active'), 'Should have active class initially');
        assert.isNotOk(mock.has_class('error'), 'Should not have error class initially');

        // Toggle properties
        parent.data.model.set('isActive', false);
        parent.data.model.set('hasError', true);

        assert.isNotOk(mock.has_class('is-active'), 'Should reactively remove active class');
        assert.isTrue(!!mock.has_class('error'), 'Should reactively add error class');
    });

    it('should support explicit data-model object binding', () => {
        parent.data.model.set('user_email', 'admin@local');

        const ui = tpl`
            <div data-model=${parent.data.model}>
                <mockcontrol name="mockEmail" bind-val=${parent.mbind('user_email')} />
            </div>
        `.mount(parent);

        const mock = parent.mockEmail;
        assert.strictEqual(unwrap(mock.data.model.get('val')), 'admin@local', 'Should implicitly bind to contextual data.model via mbind');

        mock.data.model.set('val', 'new@local');
        assert.strictEqual(unwrap(parent.data.model.get('user_email')), 'new@local', 'Bidirectional sync should work via contextual evaluation');
    });

    it('should reactively render array items via bind-list', () => {
        const { Collection } = require('lang-tools');
        parent.data.model.set('items', new Collection([
            { id: 1, name: 'Item A' },
            { id: 2, name: 'Item B' }
        ]));

        const ui = tpl`
            <div name="listContainer" 
                 bind-list=${parent.mbind('items')} 
                 template=${(item) => tpl`<mockcontrol data-id=${item.id} />`} />
        `.mount(parent);

        const container = parent.listContainer;
        const arr = container.content._arr || container.content; // fallback
        assert.lengthOf(arr, 2, 'Should initially render 2 items');

        // Verify content mapping
        assert.strictEqual(arr[0].dom.attributes['data-id'], 1);
        assert.strictEqual(arr[1].dom.attributes['data-id'], 2);

        // Add an item
        const items = parent.data.model.get('items');
        items.push({ id: 3, name: 'Item C' });

        const arr_after = container.content._arr || container.content;
        assert.lengthOf(arr_after, 3, 'Should reactively render items when collection expands');
        assert.strictEqual(arr_after[2].dom.attributes['data-id'], 3);
    });

    // ── Refactoring Pattern Example ──
    // Demonstrates how controls that used imperative add_class/remove_class
    // (like Search_Bar.set_loading, Chip.set_selected, Filter_Chips._sync_chip_state)
    // can be replaced with declarative bind-class syntax.

    it('should replace imperative class toggling with declarative bind-class', () => {
        // BEFORE: Imperative pattern (found in Search_Bar, Chip, etc.)
        //   set_loading(v) {
        //       this._loading = !!v;
        //       if (this._loading) this.add_class('loading');
        //       else this.remove_class('loading');
        //   }

        // AFTER: Declarative pattern using bind-class
        parent.data.model.set('loading', false);
        parent.data.model.set('has_value', true);
        parent.data.model.set('disabled', false);

        const ui = tpl`
            <div name="searchBar" class="search-bar"
                bind-class=${{
                'loading': parent.mbind('loading'),
                'has-value': parent.mbind('has_value'),
                'disabled': parent.mbind('disabled')
            }} />
        `.mount(parent);

        const bar = parent.searchBar;

        // Initial state
        assert.isNotOk(bar.has_class('loading'), 'Should not have loading initially');
        assert.isTrue(!!bar.has_class('has-value'), 'Should have has-value initially');
        assert.isNotOk(bar.has_class('disabled'), 'Should not have disabled initially');

        // Simulate state changes — no imperative set_loading() needed!
        parent.data.model.set('loading', true);
        assert.isTrue(!!bar.has_class('loading'), 'Should reactively add loading class');

        parent.data.model.set('has_value', false);
        assert.isNotOk(bar.has_class('has-value'), 'Should reactively remove has-value class');

        parent.data.model.set('disabled', true);
        assert.isTrue(!!bar.has_class('disabled'), 'Should reactively add disabled class');

        // Toggle back
        parent.data.model.set('loading', false);
        assert.isNotOk(bar.has_class('loading'), 'Should reactively remove loading class');
    });

    it('should dynamically update inline styles with bind-style', () => {
        parent.data.model.set('width', '50%');
        parent.data.model.set('bgColor', 'red');

        const ui = tpl`
            <div>
                <mockcontrol name="mockStyle" bind-style=${{
                'width': parent.mbind('width'),
                'background-color': parent.mbind('bgColor')
            }} />
            </div>
        `.mount(parent);

        const mock = parent.mockStyle;
        assert.strictEqual(mock.dom.attributes.style['width'], '50%', 'Should set initial width style');
        assert.strictEqual(mock.dom.attributes.style['background-color'], 'red', 'Should set initial background-color style');

        // Update properties
        parent.data.model.set('width', '100%');
        parent.data.model.set('bgColor', null);

        assert.strictEqual(mock.dom.attributes.style['width'], '100%', 'Should reactively update width style');
        assert.isUndefined(mock.dom.attributes.style['background-color'], 'Should reactively remove background-color style when null');
    });

    it('should conditionally render elements with bind-visible', () => {
        parent.data.model.set('isVisible', true);

        const ui = tpl`
            <div>
                <mockcontrol name="mockVisible" bind-visible=${parent.mbind('isVisible')} />
            </div>
        `.mount(parent);

        const mock = parent.mockVisible;
        assert.isNotOk(mock.dom.attributes.style && mock.dom.attributes.style.display === 'none', 'Should be visible initially (no display: none)');

        // Toggle to hidden
        parent.data.model.set('isVisible', false);
        assert.strictEqual(mock.dom.attributes.style.display, 'none', 'Should reactively add display: none');

        // Toggle to visible
        parent.data.model.set('isVisible', true);
        assert.isUndefined(mock.dom.attributes.style.display, 'Should reactively remove display: none');
    });

    it('should intercept bind-value on native input tags and enable bidirectional binding natively', () => {
        parent.data.model.set('username', 'Alice');

        const ui = tpl`
            <div name="form">
                <input name="nativeInput" type="text" bind-value=${parent.mbind('username')} />
            </div>
        `.mount(parent);

        const input = parent.nativeInput;

        // Initial state from model to DOM
        assert.strictEqual(input.dom.attributes.value, 'Alice', 'Should set initial attribute value');

        // Test Model -> DOM update
        parent.data.model.set('username', 'Bob');
        assert.strictEqual(input.dom.attributes.value, 'Bob', 'Should reactively update DOM on model change');

        // Test DOM -> Model update (simulate user input event)
        if (input.raise_event) { // If it's a wrapped basic control
            // Simulate firing dom event
            const mockEvent = { target: { value: 'Charlie' } };
            input.raise_event('input', mockEvent);
            assert.strictEqual(unwrap(parent.data.model.get('username')), 'Charlie', 'Should update model on DOM input event');
        }
    });

    it('should restore SSR declarative bindings during activation', () => {
        class Activation_Editor extends Data_Model_View_Model_Control {
            constructor(spec = {}) {
                spec.__type_name = spec.__type_name || 'activation_editor';
                super(spec);

                ensure_control_models(this, spec);

                this.data.model.set('first_name', spec.first_name !== undefined ? spec.first_name : 'Jane');
                this.data.model.set('accent_color', spec.accent_color !== undefined ? spec.accent_color : 'red');
                this.data.model.set('is_active', spec.is_active !== undefined ? spec.is_active : true);
                this.data.model.set('is_visible', spec.is_visible !== undefined ? spec.is_visible : true);
                this.data.model.set('items', spec.items !== undefined ? spec.items : []);

                this.computed(this.data.model, ['first_name'],
                    first_name => first_name || '',
                    { propertyName: 'full_name' }
                );

                this.compose_ui();
            }

            compose_ui() {
                tpl`
                    <div class="card"
                        bind-class=${{ 'active-card': this.mbind('is_active') }}
                        bind-style=${{ 'border-color': this.mbind('accent_color') }}
                        bind-visible=${this.mbind('is_visible')}>
                        <h2 bind-text=${this.mbind('full_name')}></h2>
                        <input name="name_input" type="text" bind-value=${this.mbind('first_name')} />
                        <ul bind-list=${this.mbind('items')} template=${(item) => tpl`<li class="item">${item}</li>`}></ul>
                        <button name="toggle_btn" on-click=${this.toggle_status.bind(this)}>Toggle</button>
                    </div>
                `.mount(this, jsgui.controls);
            }

            toggle_status() {
                const is_active = unwrap(this.data.model.get('is_active'));
                this.data.model.set('is_active', !is_active);
                this.data.model.set('is_visible', is_active ? false : true);
            }
        }

        jsgui.controls.activation_editor = Activation_Editor;
        jsgui.controls.Activation_Editor = Activation_Editor;

        const ssr_context = new jsgui.Page_Context();
        const ssr_editor = new Activation_Editor({
            context: ssr_context,
            first_name: 'John',
            accent_color: 'green',
            is_active: true,
            is_visible: true,
            items: ['One', 'Two']
        });

        const html = ssr_editor.all_html_render();
        assert.include(html, 'data-jsgui-bind-style="border-color:accent_color"');
        assert.include(html, 'data-jsgui-bind-visible="is_visible"');
        assert.include(html, 'data-jsgui-bind-list="items"');
        assert.include(html, 'data-jsgui-on-click="toggle_status"');

        document.body.innerHTML = html;
        const root_el = document.body.firstElementChild;
        const client_context = new jsgui.Page_Context({ document });
        const client_editor = new Activation_Editor({
            context: client_context,
            el: root_el,
            first_name: 'Wrong',
            accent_color: 'orange',
            is_active: false,
            is_visible: false,
            items: []
        });

        client_editor.activate(root_el);

        const card = root_el.querySelector('.card');
        const heading = root_el.querySelector('h2');
        const input = root_el.querySelector('input');
        const list = root_el.querySelector('ul');
        const button = root_el.querySelector('button');

        assert.strictEqual(heading.textContent, 'John', 'bind-text should restore SSR state');
        assert.strictEqual(input.value, 'John', 'bind-value should restore SSR state');
        assert.isTrue(card.classList.contains('active-card'), 'bind-class should restore SSR state');
        assert.strictEqual(card.style.getPropertyValue('border-color'), 'green', 'bind-style should restore SSR state');
        assert.strictEqual(card.style.display, '', 'bind-visible should restore SSR state');
        assert.lengthOf(list.querySelectorAll('li'), 2, 'bind-list should restore SSR state');

        client_editor.data.model.set('first_name', 'Jane');
        client_editor.data.model.set('accent_color', 'blue');
        client_editor.data.model.set('items', ['One', 'Two', 'Three']);

        assert.strictEqual(heading.textContent, 'Jane', 'bind-text should update after activation');
        assert.strictEqual(input.value, 'Jane', 'bind-value should update after activation');
        assert.strictEqual(card.style.getPropertyValue('border-color'), 'blue', 'bind-style should update after activation');
        assert.lengthOf(list.querySelectorAll('li'), 3, 'bind-list should update after activation');

        button.click();
        assert.isFalse(unwrap(client_editor.data.model.get('is_active')), 'bound on-click handler should update the model');
        assert.isFalse(card.classList.contains('active-card'), 'bind-class should react to activated click handler');
        assert.strictEqual(card.style.display, 'none', 'bind-visible should react to activated click handler');

        client_editor.data.model.set('is_visible', true);
        assert.strictEqual(card.style.display, '', 'bind-visible should restore display when visible again');
    });

});
