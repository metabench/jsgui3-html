
const Ctrl_Enh = require('./control-enh');

const { Data_Object } = require('lang-tools');
const { ModelBinder, ComputedProperty, PropertyWatcher, BindingManager } = require('./ModelBinder');
const { Transformations, Validators } = require('./Transformations');
const {
    apply_theme,
    apply_theme_overrides
} = require('../control_mixins/theme');

// Quite a lot of the standard controls should become this.
//   It should provide mechanisms for the app to efficiently process and pass on updates at the various different stages.
//   Want to work both with well defined app data models, as well has having them created simply / automatically to 
//     facilitate easy (to code) sharing of data between different parts of the app, and easy to code data persistance and update
//     operations.

// A server side data model could replay changes and then update the DB as necessary.
//   Could undo changes too (if history is stored).

// These two models would help a lot when it comes to the app state history.
//   eg don't undo maximising and minimising windows within the app, but also have a good way to save the state (automatically essentially).


// Can have fairly complex code on lower and especially mid levels, but the high level code should be simple and cleary express what's being done
//   though also allowing for shorthands that would not be as readable but would be more compact.
// Could maybe search and replace on building to use the shorthand forms instead, maybe even replace the functions with the
//   long form names (though that would likely be a day or two's work at least)

const Control_Data = require('./Control_Data');
const Control_View = require('./Control_View');
const { ensure_control_models } = require('./control_model_factory');

// Possibly not so much to do here right now???

// Maybe will use this to make some other controls more concise.

// Maybe make both Data_Model_View_Model_Control_Single_Value
//   and Data_Model_View_Model_Control_Multi_Value_Data_Object
//         so it would have properties available with string keys.
//   maybe also make some kind(s) of Collection or Array holding data models.



// Not totally sure what interface / conventions this should be using and expressing for the moment.
//   Would like to make it really easy to base controls that have both a data model and view model on this.

// May also be important sending or properly recreating the data / view model on the client-side.
//   Having them made in the constructor from lang-tools classes could be effective.
//     Then would be recreated automatically and identically on the client-side.

// Likely do want a Data_Value subclass that represents the application's Data_Model.
//   And this Data_Value subclass for the moment could just set up the functional data type as a validator.

// new Data_Value(value_to_wrap, data_type);






// Both want to get this Data base type control working, as well as get the pattern well finessed to implement
//   directly into a control.
// Then will be able to use either.
//   May then work on improved abstractions.


// Will make some kind of multi-model mixin.

// Data, View Data, Composition, Data Representation

// Maybe there are 5 different models there.



// Likely will deprecate this, and use the more complicated mixin, which currently is called in the ctrl-enh constructor.
//   Will try making it available and useful at a low level, but may later restrict when it gets used / set up for perf reasons.
//   However, the more complex system of multiple models may help controls to be specified and used much more easily.
//     Lower and mid levels will handle complexity, high level code can be really clear and concise about the data and its
//       representation using controls in the GUI.



// Likely want to retire this soon...?
// Possibly redo the Text_Field control or whichever controls use this for the moment.
//   Though making use of the compositional model makes a lot more sense for the moment.





/**
 * MVVM base class for data-bound controls.
 *
 * Adds a **data model** (`this.data.model`) and a **view data model**
 * (`this.view.data.model`) on top of {@link Ctrl_Enh}. Controls that
 * display or edit application data should extend this class.
 *
 * Key features provided by the constructor:
 * - Applies theme tokens (`spec.theme`, `spec.theme_tokens`, `spec.theme_overrides`)
 * - Initialises a {@link BindingManager} (`this._binding_manager`)
 * - Calls `ensure_control_models()` to set up `data.model` / `view.data.model`
 * - Syncs model IDs to `data-jsgui-data-model` / `data-jsgui-view-data-model`
 *   DOM attributes for client-side activation
 *
 * Binding helpers (available on instances):
 * - `this.bind(prop, model, opts, target)` — one-way or two-way binding
 * - `this.computed(model, deps, fn, opts)` — derived values
 * - `this.watch(model, prop, cb)` — change callbacks
 *
 * @param {Object} [spec={}]              - spec passed through to Ctrl_Enh
 * @param {Object} [spec.theme]           - theme context or token set
 * @param {Object} [spec.theme_tokens]    - direct token overrides
 * @param {Object} [spec.theme_overrides] - alias for theme_tokens
 * @param {Object} [spec.data]            - initial data model state
 * @param {Object} [spec.view]            - initial view model state
 * @extends Ctrl_Enh
 */
class Data_Model_View_Model_Control extends Ctrl_Enh {
    constructor(...a) {
        super(...a);

        const spec = a[0] || {};

        const theme_context = spec.theme || (this.context && this.context.theme);
        if (theme_context) {
            this.theme_context = theme_context;
            apply_theme(this, theme_context);
        }
        if (spec.theme_tokens) {
            apply_theme_overrides(this, spec.theme_tokens);
        }
        if (spec.theme_overrides) {
            apply_theme_overrides(this, spec.theme_overrides);
        }

        // Initialize binding manager
        this._binding_manager = new BindingManager(this);
        // Possibly set up both models here, but should look out for data and view models in the spec.

        // Also, look out for it in pre_activate I think. Would be good to reconnect those models here.

        // Would also need to add the appropriate .dom.attributes['data-jsgui-view-model']
        //                                        .dom.attributes['data-jsgui-data-model']

        // 
        //console.log('');
        //console.log('construct Data_Model_View_Model_Control');


        const { context } = this;

        // spec.view
        // spec.data

        // and would both need 'model' properties???
        //   does seem best for the moment to make it really explicit.

        // But then recognising and passing on changes...?
        //   Should work when not activated if possible.

        // Though seems like it would need a bit more code in the higher level classes.
        // Possibly more in intialisation, telling it what property names to use.
        //   Though could default to 'value' to allow easy sharing between 2 or more objects where it's just one
        //     value that gets shared.


        // Probably need to set up fields / change events on the model objects.

        // Could try it with 'value' hardcoded here???

        //  Or take the 'fields' in the spec???

        // With the Text_Field (and Text_Input) will need to have it change the Data Model appropriately.
        //   Maybe could have a decent default for it, but explicitly set it as well with a short string eg 'onexit' or 'exit' or 'leave'
        // But would more likely want an 'cancel | confirm' non-modal popup, and control the positioning of that popup.
        //   Likely to want it just below in this example.

        // This can likely be very effective....


        ensure_control_models(this, spec);

        if (this.data && this.data.model) {
            this.data.model.on('change', e => {
                // console.log('Data_Model_View_Model_Control this.data.model change e:', e);
            });

            if (this.dom && this.dom.attributes) {
                this.dom.attributes['data-jsgui-data-model'] = this.data.model._id();
            }
        }

        if (this.view && this.view.data && this.view.data.model) {
            this.view.data.model.on('change', e => {
                // console.log('Data_Model_View_Model_Control this.view.data.model change e:', e);
            });
            if (this.dom && this.dom.attributes) {
                this.dom.attributes['data-jsgui-view-data-model'] = this.view.data.model._id();
            }
        }

        if (spec.view && spec.view.model) {
            this.view.model = spec.view.model;
            this.view.model.on('change', e => {
                console.log('Data_Model_View_Model_Control this.view.model change e:', e);
            });
            if (this.dom && this.dom.attributes) {
                this.dom.attributes['data-jsgui-view-model'] = this.view.model._id();
            }
        }

        //console.log('Data_Model_View_Model_Control !!this.dom.el', !!this.dom.el);

        if (this.dom.el) {

            const context_keys = Array.from(Object.keys(this.context));
            //console.log('context_keys', context_keys);

            const context_map_controls_keys = Array.from(Object.keys(this.context.map_controls));
            //console.log('context_map_controls_keys', context_map_controls_keys);

            if (this.dom.el.hasAttribute('data-jsgui-data-model')) {
                const data_model_jsgui_id = this.dom.el.getAttribute('data-jsgui-data-model');

                //console.log('Data_Model_View_Model_Control data_model_jsgui_id:', data_model_jsgui_id);

                const data_model = this.context.map_controls[data_model_jsgui_id];

                //console.log('Data_Model_View_Model_Control !!data_model', !!data_model);

                if (data_model) {
                    this.data = this.data || new Control_Data({ context });

                    //console.log('Data_Model_View_Model_Control pre assign this.data.model');
                    //console.log('data_model', data_model);
                    this.data.model = data_model;
                    //console.log('post assign this.data.model\n');

                    // Then set up the syncing here????

                    //   If the data model changes, set the .value field....?


                    data_model.on('change', e => {
                        //console.log('Data_Model_View_Model_Control data_model change', e);
                    })
                }
            }


            // And if it does not have that attribute, create its own internal view model.




            if (this.dom.el.hasAttribute('data-jsgui-view-model')) {
                this.view = this.view || new Control_View({ context });
                const view_model_jsgui_id = this.dom.el.getAttribute('data-jsgui-view-model');

                //console.log('Data_Model_View_Model_Control view_model_jsgui_id:', view_model_jsgui_id);

                // then get it from the context.

                const view_model = this.context.map_controls[view_model_jsgui_id];

                if (!!view_model) {
                    this.view.model = view_model;

                    view_model.on('change', e => {
                        //console.log('Data_Model_View_Model_Control view_model change', e);
                    });
                } else {
                    //console.log('Data_Model_View_Model_Control missing view_model (not found at this.context.map_controls[view_model_jsgui_id])');
                }




                // Load the view model at the very beginning???


                // But in the activated part it would need to change the model???
                //   Not necessarily.
                //   It could change that in respond to the field changing.
                //     Then would change the view model in response to the that data model change.
                //     Then would update the DOM in response to the view model change (would have to be the responsibility of the
                //       specific control I think???)




            } else {
                //console.log('Data_Model_View_Model_Control with el lacks view model, need to make one');
                this.view = this.view || {};
                this.view.model = new Data_Object({
                    context
                });



            }
        }
    }
    pre_activate() {
        super.pre_activate();


        // re-assign the .data.model and .view.model if they are available....

        // These models would need to exist within the Page_Context.
        //   That probably should be the case, working isomorphically.
        //     Model creation would be within the Page_Context.





        // console.log('Data_Model_View_Model_Control pre_activate complete');

        // should be able to access own data_model???


    }

    /**
     * Shorthand for creating a model binding tuple/config.
     * Without options returns [this.data.model, property_name].
     * With options returns { model, prop, options }.
     * @param {string} property_name - The model property to bind.
     * @param {Object} [options] - Optional binding options (transform, reverse, bidirectional).
     * @returns {Array|Object} Binding tuple or config object.
     */
    mbind(property_name, options) {
        if (!options) {
            return [this.data.model, property_name];
        }
        return {
            model: this.data.model,
            prop: property_name,
            options: options
        };
    }

    /**
     * Create a binding between data model and view model
     * @param {Object} bindings - Property binding definitions
     * @param {Object} options - Binding options
     * @example
     * this.bind({
     *     'date': {
     *         to: 'formattedDate',
     *         transform: (date) => formatDate(date, 'YYYY-MM-DD'),
     *         reverse: (str) => parseDate(str)
     *     }
     * });
     */
    bind(bindings, options = {}) {
        if (!this.data || !this.data.model) {
            console.warn('Data_Model_View_Model_Control.bind: No data.model available');
            return null;
        }

        if (!this.view || !this.view.data || !this.view.data.model) {
            console.warn('Data_Model_View_Model_Control.bind: No view.data.model available');
            return null;
        }

        return this._binding_manager.bind(
            this.data.model,
            this.view.data.model,
            bindings,
            options
        );
    }

    /**
     * Create a computed property on a model
     * @param {Object} model - Target model (data.model or view.data.model)
     * @param {Array|string} dependencies - Property names to watch
     * @param {Function} compute_fn - Function to compute the value
     * @param {Object} options - Options including property_name
     * @example
     * this.computed(this.view.data.model, ['firstName', 'lastName'], 
     *     (first, last) => `${first} ${last}`,
     *     { property_name: 'fullName' }
     * );
     */
    computed(model, dependencies, compute_fn, options = {}) {
        return this._binding_manager.create_computed(model, dependencies, compute_fn, options);
    }

    /**
     * Watch a property for changes
     * @param {Object} model - Model to watch
     * @param {string} property - Property name to watch
     * @param {Function} callback - Callback function (newVal, oldVal) => void
     * @param {Object} options - Watch options
     * @example
     * this.watch(this.data.model, 'selectedItem', (newVal, oldVal) => {
     *     console.log('Selection changed:', oldVal, '→', newVal);
     * });
     */
    watch(model, property, callback, options = {}) {
        return this._binding_manager.watch(model, property, callback, options);
    }

    /**
     * Create a reactive collection with filter support and granular events.
     * @param {Array|Collection} source - Source data
     * @param {Object} options - { filter: fn }
     * @returns {ReactiveCollection}
     * @example
     * const visible = this.reactive_collection(this.data.model.get('rows'), {
     *     filter: row => row.active
     * });
     * visible.on('insert', ({ position, item }) => { ... });
     */
    reactive_collection(source, options = {}) {
        return this._binding_manager.create_reactive_collection(source, options);
    }

    /**
     * Bind a single value between models with optional transform/reverse
     * @param {Object} sourceModel - Source model
     * @param {string} sourceProp - Source property name
     * @param {Object} targetModel - Target model
     * @param {string} targetProp - Target property name (defaults to sourceProp)
     * @param {Object} options - Binding options (transform, reverse, condition, etc.)
     * @example
     * this.bind_value(this.data.model, 'date', this.view.data.model, 'formattedDate', {
     *     transform: (d) => formatDate(d),
     *     reverse: (s) => parseDate(s)
     * });
     */
    bind_value(sourceModel, sourceProp, targetModel, targetProp, options) {
        return this._binding_manager.bind_value(sourceModel, sourceProp, targetModel, targetProp, options);
    }

    /**
     * Bind a collection/array between models with optional map transform
     * @param {Object} sourceModel - Source model
     * @param {string} sourceProp - Source property name
     * @param {Object} targetModel - Target model
     * @param {string} targetProp - Target property name (defaults to sourceProp)
     * @param {Object} options - Binding options (map, reverse_map, clone, etc.)
     * @example
     * this.bind_collection(this.data.model, 'items', this.view.data.model, 'displayItems', {
     *     map: (item) => ({ ...item, label: item.name.toUpperCase() })
     * });
     */
    bind_collection(sourceModel, sourceProp, targetModel, targetProp, options) {
        return this._binding_manager.bind_collection(sourceModel, sourceProp, targetModel, targetProp, options);
    }

    /**
     * Get transformations library
     */
    get transforms() {
        return Transformations;
    }

    /**
     * Get validators library
     */
    get validators() {
        return Validators;
    }

    /**
     * Inspect all bindings for debugging
     */
    inspectBindings() {
        return this._binding_manager.inspect();
    }

    /**
     * Restore model state from a serialized data-jsgui-model-state DOM attribute.
     * Called during activation (when tpl.mount detects an already-active DOM element).
     */
    _restore_model_state_from_dom() {
        if (!this.dom || !this.dom.el) return;
        const raw = this.dom.el.getAttribute('data-jsgui-model-state');
        if (!raw || !this.data || !this.data.model) return;
        try {
            const state = JSON.parse(raw);
            const keys = Object.keys(state);
            for (let i = 0; i < keys.length; i++) {
                if (this.data.model.set) {
                    this.data.model.set(keys[i], state[keys[i]]);
                }
            }
        } catch (e) {
            console.error('[jsgui] Failed to restore model state:', e);
        }
    }

    /**
     * Activate tpl-declared bindings from serialized DOM data attributes.
     *
     * During SSR, parse-mount serializes binding metadata as data-jsgui-bind-*
     * attributes on child elements. This method re-establishes those bindings
     * against this control's data.model using direct DOM manipulation.
     *
     * Supports: bind-text, bind-value, bind-class, on-click (and other on-* events).
     */
    _activate_tpl_bindings() {
        if (!this.dom || !this.dom.el) return;
        if (this.__tpl_activated) return;
        this.__tpl_activated = true;

        const my_id = this._id();
        const el = this.dom.el;
        const model = this.data && this.data.model;
        if (!model) return;

        const unwrap = (v) => {
            if (!v) return v;
            if (typeof v.value === 'function') return v.value();
            if (v.value !== undefined) return v.value;
            if (v.get) return v.get();
            return v;
        };

        // Find all descendant elements whose bindings belong to this control
        const bound_elements = el.querySelectorAll('[data-jsgui-bind-owner="' + my_id + '"]');
        const self = this;

        for (let idx = 0; idx < bound_elements.length; idx++) {
            const bound_el = bound_elements[idx];

            // ── bind-text: one-way model → DOM textContent ──
            const bind_text_prop = bound_el.getAttribute('data-jsgui-bind-text');
            if (bind_text_prop) {
                const _update_text = () => {
                    const val = unwrap(model.get ? model.get(bind_text_prop) : model[bind_text_prop]);
                    bound_el.textContent = (val !== undefined && val !== null) ? String(val) : '';
                };
                _update_text();
                model.on('change', (e) => {
                    if (e.name === bind_text_prop) _update_text();
                });
            }

            // ── bind-value: two-way model ↔ DOM value ──
            const bind_value_prop = bound_el.getAttribute('data-jsgui-bind-value');
            if (bind_value_prop) {
                const tag_lower = bound_el.tagName.toLowerCase();
                const is_native_input = (tag_lower === 'input' || tag_lower === 'textarea' || tag_lower === 'select');

                // Find the actual input element (could be the element itself or nested)
                const input_el = is_native_input ? bound_el : bound_el.querySelector('input, textarea, select');

                if (input_el) {
                    const _update_value = () => {
                        const val = unwrap(model.get ? model.get(bind_value_prop) : model[bind_value_prop]);
                        input_el.value = (val !== undefined && val !== null) ? String(val) : '';
                    };
                    _update_value();
                    model.on('change', (e) => {
                        if (e.name === bind_value_prop) _update_value();
                    });
                    // DOM → Model (two-way)
                    const _on_input = (e) => {
                        let new_val = e.target.value;
                        if (input_el.type === 'number') {
                            const n = Number(new_val);
                            if (!isNaN(n)) new_val = n;
                        }
                        if (model.set) model.set(bind_value_prop, new_val);
                    };
                    input_el.addEventListener('input', _on_input);
                    input_el.addEventListener('change', _on_input);
                }
            }

            // ── bind-class: one-way model → DOM classList ──
            const bind_class_str = bound_el.getAttribute('data-jsgui-bind-class');
            if (bind_class_str) {
                const pairs = bind_class_str.split(',');
                for (let p = 0; p < pairs.length; p++) {
                    const sep_idx = pairs[p].indexOf(':');
                    if (sep_idx <= 0) continue;
                    const cls = pairs[p].substring(0, sep_idx);
                    const raw_prop = pairs[p].substring(sep_idx + 1);
                    const negate = raw_prop.charAt(0) === '!';
                    const prop = negate ? raw_prop.substring(1) : raw_prop;
                    (function (_cls, _prop, _negate) {
                        const _update_cls = () => {
                            let val = unwrap(model.get ? model.get(_prop) : model[_prop]);
                            if (_negate) val = !val;
                            if (val) bound_el.classList.add(_cls);
                            else bound_el.classList.remove(_cls);
                        };
                        _update_cls();
                        model.on('change', (e) => {
                            if (e.name === _prop) _update_cls();
                        });
                    })(cls, prop, negate);
                }
            }

            // ── on-* event handlers ──
            const attrs = bound_el.attributes;
            for (let a = 0; a < attrs.length; a++) {
                const attr_name = attrs[a].name;
                if (attr_name.startsWith('data-jsgui-on-')) {
                    const event_name = attr_name.substring(14); // after 'data-jsgui-on-'
                    const method_name = attrs[a].value;
                    if (self[method_name] && typeof self[method_name] === 'function') {
                        (function (_evt, _method) {
                            bound_el.addEventListener(_evt, (e) => {
                                self[_method]();
                            });
                        })(event_name, method_name);
                    }
                }
            }
        }
    }

    /**
     * Override activate to restore tpl bindings when present.
     */
    activate(el) {
        super.activate(el);
        if (this._needs_tpl_activation) {
            this._activate_tpl_bindings();
            this._needs_tpl_activation = false;
        }
    }

    /**
     * Cleanup bindings when control is destroyed
     */
    destroy() {
        if (this._binding_manager) {
            this._binding_manager.cleanup();
        }
        if (super.destroy) {
            super.destroy();
        }
    }
}

module.exports = Data_Model_View_Model_Control;
