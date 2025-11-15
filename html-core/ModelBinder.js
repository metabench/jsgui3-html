const { Data_Object, Data_Value, tof, each } = require('lang-tools');

/**
 * ModelBinder - Provides declarative two-way data binding between models
 * 
 * Key Features:
 * - Bidirectional binding between data model and view model
 * - Transformation functions for data conversion
 * - Support for computed properties
 * - Automatic cleanup of event listeners
 * - Debugging and inspection capabilities
 * 
 * @example
 * const binder = new ModelBinder(dataModel, viewModel, {
 *     'date': {
 *         to: 'formattedDate',
 *         transform: (date) => formatDate(date),
 *         reverse: (str) => parseDate(str)
 *     }
 * });
 */
class ModelBinder {
    constructor(sourceModel, targetModel, bindings = {}, options = {}) {
        if (typeof targetModel === 'string') {
            const [
                sourceProp,
                legacyTargetModel,
                targetProp,
                legacyOptions = {}
            ] = Array.prototype.slice.call(arguments, 1);
            const normalizedBindings = {
                [sourceProp]: Object.assign(
                    {to: targetProp},
                    legacyOptions.transform ? {transform: legacyOptions.transform} : {},
                    legacyOptions.reverse ? {reverse: legacyOptions.reverse} : {}
                )
            };
            const normalizedOptions = Object.assign({
                bidirectional: legacyOptions.twoWay || legacyOptions.bidirectional || !!legacyOptions.reverse,
                immediate: legacyOptions.immediate !== false,
                debug: legacyOptions.debug || false
            }, legacyOptions);
            return new ModelBinder(sourceModel, legacyTargetModel, normalizedBindings, normalizedOptions);
        }

        this.sourceModel = sourceModel;
        this.targetModel = targetModel;
        this.bindings = bindings;
        this.options = Object.assign({
            bidirectional: true,
            immediate: true,
            debug: false
        }, options);
        
        this._listeners = [];
        this._locks = new Set();
        this._active = false;
        
        if (this.options.immediate) {
            this.activate();
        }
    }
    
    /**
     * Activate all bindings
     */
    activate() {
        if (this._active) return;
        this._active = true;
        
        each(this.bindings, (binding, sourceProp) => {
            this._setupBinding(sourceProp, binding);
        });
        
        if (this.options.debug) {
            console.log('[ModelBinder] Activated bindings:', Object.keys(this.bindings));
        }
    }
    
    /**
     * Deactivate all bindings and cleanup listeners
     */
    deactivate() {
        if (!this._active) return;
        this._active = false;
        
        this._listeners.forEach(({ model, event, handler }) => {
            if (model && model.off) {
                model.off(event, handler);
            }
        });
        
        this._listeners = [];
        
        if (this.options.debug) {
            console.log('[ModelBinder] Deactivated bindings');
        }
    }
    
    /**
     * Setup a single binding between source and target properties
     * @private
     */
    _setupBinding(sourceProp, binding) {
        const targetProp = typeof binding === 'string' ? binding : binding.to;
        const transform = binding.transform;
        const reverse = binding.reverse;
        const condition = binding.condition;
        
        // Initial sync from source to target
        if (this.sourceModel[sourceProp] !== undefined) {
            const value = this.sourceModel[sourceProp];
            const transformedValue = transform ? transform(value) : value;
            
            if (!condition || condition(value)) {
                this.targetModel[targetProp] = transformedValue;
            }
        }
        
        // Setup source → target binding
        const sourceHandler = (e) => {
            if (e.name === sourceProp) {
                const value = e.value;
                const transformedValue = transform ? transform(value) : value;
                
                if (!condition || condition(value)) {
                    const lock_key = `${sourceProp}->${targetProp}`;
                    if (this._acquire(lock_key)) {
                        this.targetModel[targetProp] = transformedValue;
                        
                        if (this.options.debug) {
                            console.log(`[ModelBinder] ${sourceProp} → ${targetProp}:`, value, '→', transformedValue);
                        }
                        this._release(lock_key);
                    }
                }
            }
        };
        
        this.sourceModel.on('change', sourceHandler);
        this._listeners.push({
            model: this.sourceModel,
            event: 'change',
            handler: sourceHandler
        });
        
        // Setup target → source binding (if bidirectional)
        if (this.options.bidirectional && reverse) {
            const targetHandler = (e) => {
                if (e.name === targetProp) {
                    const value = e.value;
                    const reversedValue = reverse(value);
                    
                    if (!condition || condition(reversedValue)) {
                        const lock_key = `${targetProp}->${sourceProp}`;
                        if (this._acquire(lock_key)) {
                            this.sourceModel[sourceProp] = reversedValue;
                            
                            if (this.options.debug) {
                                console.log(`[ModelBinder] ${targetProp} → ${sourceProp}:`, value, '→', reversedValue);
                            }
                            this._release(lock_key);
                        }
                    }
                }
            };
            
            this.targetModel.on('change', targetHandler);
            this._listeners.push({
                model: this.targetModel,
                event: 'change',
                handler: targetHandler
            });
        }
    }
    
    _acquire(key) {
        if (!key) return true;
        if (this._locks.has(key)) {
            if (this.options.debug) {
                console.warn('[ModelBinder] Loop suppressed for', key);
            }
            return false;
        }
        this._locks.add(key);
        return true;
    }

    _release(key) {
        if (key) {
            this._locks.delete(key);
        }
    }

    unbind() {
        this.deactivate();
    }
    
    /**
     * Update a specific binding manually
     */
    updateBinding(sourceProp) {
        const binding = this.bindings[sourceProp];
        if (!binding) return;
        
        const targetProp = typeof binding === 'string' ? binding : binding.to;
        const transform = binding.transform;
        
        const value = this.sourceModel[sourceProp];
        const transformedValue = transform ? transform(value) : value;
        this.targetModel[targetProp] = transformedValue;
    }
    
    /**
     * Get current binding state for inspection
     */
    inspect() {
        const state = {};
        
        each(this.bindings, (binding, sourceProp) => {
            const targetProp = typeof binding === 'string' ? binding : binding.to;
            state[sourceProp] = {
                target: targetProp,
                sourceValue: this.sourceModel[sourceProp],
                targetValue: this.targetModel[targetProp],
                hasTransform: !!binding.transform,
                hasReverse: !!binding.reverse,
                bidirectional: this.options.bidirectional && !!binding.reverse
            };
        });
        
        return state;
    }
}

/**
 * ComputedProperty - A property that automatically updates based on dependencies
 * 
 * @example
 * const fullName = new ComputedProperty(
 *     model,
 *     ['firstName', 'lastName'],
 *     (first, last) => `${first} ${last}`
 * );
 */
class ComputedProperty {
    constructor(model, dependencies, computeFn, options = {}) {
        this.model = model;
        this.dependencies = Array.isArray(dependencies) ? dependencies : [dependencies];
        this.computeFn = computeFn;
        this.options = Object.assign({
            propertyName: 'computed',
            immediate: true,
            debug: false
        }, options);
        
        this._listeners = [];
        this._active = false;
        this._lastValue = undefined;
        
        if (this.options.immediate) {
            this.activate();
        }
    }
    
    activate() {
        if (this._active) return;
        this._active = true;
        
        // Compute initial value
        this.compute();
        
        // Setup listeners for dependencies
        const handler = (e) => {
            if (this.dependencies.includes(e.name)) {
                this.compute();
            }
        };
        
        this.model.on('change', handler);
        this._listeners.push({ model: this.model, event: 'change', handler });
        
        if (this.options.debug) {
            console.log('[ComputedProperty] Activated for dependencies:', this.dependencies);
        }
    }
    
    deactivate() {
        if (!this._active) return;
        this._active = false;
        
        this._listeners.forEach(({ model, event, handler }) => {
            if (model && model.off) {
                model.off(event, handler);
            }
        });
        
        this._listeners = [];
    }
    
    compute() {
        const args = this.dependencies.map(dep => this.model[dep]);
        const newValue = this.computeFn(...args);
        
        if (newValue !== this._lastValue) {
            this._lastValue = newValue;
            this.model[this.options.propertyName] = newValue;
            
            if (this.options.debug) {
                console.log('[ComputedProperty] Updated:', this.options.propertyName, '=', newValue);
            }
        }
        
        return newValue;
    }
    
    get value() {
        return this._lastValue;
    }

    destroy() {
        this.deactivate();
    }
}

/**
 * PropertyWatcher - Watch for changes to specific properties
 * 
 * @example
 * const watcher = new PropertyWatcher(model, 'selectedItem', (newVal, oldVal) => {
 *     console.log('Selection changed:', oldVal, '→', newVal);
 * });
 */
class PropertyWatcher {
    constructor(model, property, callback, options = {}) {
        this.model = model;
        this.properties = Array.isArray(property) ? property : [property];
        this.callback = callback;
        this.options = Object.assign({
            immediate: false,
            deep: false,
            debug: false
        }, options);
        
        this._handler = null;
        this._active = false;
        
        this.activate();
    }
    
    activate() {
        if (this._active) return;
        this._active = true;
        
        // Call immediately if requested
        if (this.options.immediate && this.properties.length > 0) {
            const prop = this.properties[0];
            this.callback(this.model[prop], undefined, prop);
        }
        
        // Setup change listener
        this._handler = (e) => {
            if (this.properties.includes(e.name)) {
                this.callback(e.value, e.old, e.name);
                
                if (this.options.debug) {
                    console.log('[PropertyWatcher] Property changed:', e.name, e.old, '→', e.value);
                }
            }
        };
        
        this.model.on('change', this._handler);
    }
    
    deactivate() {
        if (!this._active) return;
        this._active = false;
        
        if (this._handler && this.model.off) {
            this.model.off('change', this._handler);
        }
        
        this._handler = null;
    }

    unwatch() {
        this.deactivate();
    }
}

/**
 * BindingManager - Manages multiple bindings for a control
 */
class BindingManager {
    constructor(control) {
        this.control = control;
        this.binders = [];
        this.computed = [];
        this.watchers = [];
    }
    
    /**
     * Create a new binding between models
     */
    bind(sourceModel, targetModel, bindings, options) {
        const binder = new ModelBinder(sourceModel, targetModel, bindings, options);
        this.binders.push(binder);
        return binder;
    }

    bind_value(sourceModel, sourceProp, targetModel, targetProp = sourceProp, options = {}) {
        const bindings = {
            [sourceProp]: Object.assign(
                {to: targetProp},
                options.transform ? {transform: options.transform} : {},
                options.reverse ? {reverse: options.reverse} : {},
                options.condition ? {condition: options.condition} : {}
            )
        };
        const binder_options = {
            bidirectional: options.bidirectional !== undefined ? options.bidirectional : !!options.reverse,
            immediate: options.immediate !== undefined ? options.immediate : true,
            debug: options.debug || false
        };
        return this.bind(sourceModel, targetModel, bindings, binder_options);
    }

    bind_collection(sourceModel, sourceProp, targetModel, targetProp = sourceProp, options = {}) {
        const map_fn = options.map;
        const clone = options.clone !== false;
        const transform = (collection = []) => {
            const arr = Array.isArray(collection) ? collection : [];
            const mapped = map_fn ? arr.map(map_fn) : arr.slice();
            return clone ? mapped.slice() : mapped;
        };
        const reverse = options.reverse_map
            ? (collection = []) => {
                const arr = Array.isArray(collection) ? collection : [];
                return arr.map(options.reverse_map);
            }
            : undefined;

        return this.bind_value(sourceModel, sourceProp, targetModel, targetProp, Object.assign({}, options, {
            transform,
            reverse,
            bidirectional: options.bidirectional && !!reverse
        }));
    }
    
    /**
     * Create a computed property
     */
    createComputed(model, dependencies, computeFn, options) {
        const computed = new ComputedProperty(model, dependencies, computeFn, options);
        this.computed.push(computed);
        return computed;
    }
    
    /**
     * Watch a property for changes
     */
    watch(model, property, callback, options) {
        const watcher = new PropertyWatcher(model, property, callback, options);
        this.watchers.push(watcher);
        return watcher;
    }
    
    /**
     * Cleanup all bindings
     */
    cleanup() {
        this.binders.forEach(b => b.deactivate());
        this.computed.forEach(c => c.deactivate());
        this.watchers.forEach(w => w.deactivate());
        
        this.binders = [];
        this.computed = [];
        this.watchers = [];
    }
    
    /**
     * Get inspection data for all bindings
     */
    inspect() {
        return {
            binders: this.binders.map(b => b.inspect()),
            computed: this.computed.map(c => ({
                propertyName: c.options.propertyName,
                dependencies: c.dependencies,
                value: c.value
            })),
            watchers: this.watchers.map(w => ({
                property: w.property,
                active: w._active
            }))
        };
    }
}

module.exports = {
    ModelBinder,
    ComputedProperty,
    PropertyWatcher,
    BindingManager
};
