const { each, tof } = require('lang-tools');

/**
 * BindingDebugger - Tools for debugging and inspecting data bindings
 */
class BindingDebugger {
    constructor(control) {
        this.control = control;
        this.logs = [];
        this.maxLogs = 100;
        this.enabled = false;
    }
    
    /**
     * Enable debugging for this control
     */
    enable() {
        this.enabled = true;
        this.log('Debugging enabled');
    }
    
    /**
     * Disable debugging
     */
    disable() {
        this.enabled = false;
        this.log('Debugging disabled');
    }
    
    /**
     * Log a debug message
     */
    log(message, data) {
        const entry = {
            timestamp: new Date(),
            message,
            data
        };
        
        this.logs.push(entry);
        
        // Keep only the last N logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        if (this.enabled) {
            console.log(`[BindingDebugger] ${message}`, data || '');
        }
    }
    
    /**
     * Get recent logs
     */
    getLogs(count = 10) {
        return this.logs.slice(-count);
    }
    
    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
    }
    
    /**
     * Get a summary of all bindings
     */
    getBindingSummary() {
        if (!this.control._binding_manager) {
            return { error: 'No binding manager found' };
        }
        
        const inspection = this.control._binding_manager.inspect();
        
        return {
            totalBinders: inspection.binders.length,
            totalComputed: inspection.computed.length,
            totalWatchers: inspection.watchers.length,
            details: inspection
        };
    }
    
    /**
     * Trace data flow for a specific property
     */
    traceProperty(model, propertyName) {
        const traces = [];
        
        // Find all bindings involving this property
        if (this.control._binding_manager) {
            const inspection = this.control._binding_manager.inspect();
            
            inspection.binders.forEach((binder, binderIndex) => {
                each(binder, (binding, sourceProp) => {
                    if (sourceProp === propertyName) {
                        traces.push({
                            type: 'binding',
                            binderIndex,
                            source: sourceProp,
                            target: binding.target,
                            bidirectional: binding.bidirectional
                        });
                    }
                });
            });
            
            inspection.computed.forEach((computed, index) => {
                if (computed.dependencies.includes(propertyName)) {
                    traces.push({
                        type: 'computed',
                        index,
                        property: computed.propertyName,
                        dependencies: computed.dependencies
                    });
                }
            });
            
            inspection.watchers.forEach((watcher, index) => {
                if (watcher.property === propertyName) {
                    traces.push({
                        type: 'watcher',
                        index,
                        property: watcher.property,
                        active: watcher.active
                    });
                }
            });
        }
        
        return traces;
    }
    
    /**
     * Visualize binding graph
     */
    visualizeBindings() {
        if (!this.control._binding_manager) {
            return 'No binding manager found';
        }
        
        const inspection = this.control._binding_manager.inspect();
        const lines = [];
        
        lines.push('=== Data Bindings ===');
        
        inspection.binders.forEach((binder, index) => {
            lines.push(`\nBinder #${index}:`);
            each(binder, (binding, sourceProp) => {
                const arrow = binding.bidirectional ? '⇄' : '→';
                lines.push(`  ${sourceProp} ${arrow} ${binding.target}`);
                if (binding.hasTransform) {
                    lines.push(`    [with transformation]`);
                }
            });
        });
        
        if (inspection.computed.length > 0) {
            lines.push('\n=== Computed Properties ===');
            inspection.computed.forEach((computed, index) => {
                lines.push(`  ${computed.propertyName} = f(${computed.dependencies.join(', ')})`);
                lines.push(`    Current value: ${JSON.stringify(computed.value)}`);
            });
        }
        
        if (inspection.watchers.length > 0) {
            lines.push('\n=== Watchers ===');
            inspection.watchers.forEach((watcher, index) => {
                const status = watcher.active ? '✓' : '✗';
                lines.push(`  ${status} ${watcher.property}`);
            });
        }
        
        return lines.join('\n');
    }
    
    /**
     * Get model state snapshot
     */
    snapshotModels() {
        const snapshot = {
            timestamp: new Date()
        };
        
        if (this.control.data && this.control.data.model) {
            snapshot.dataModel = this._modelToObject(this.control.data.model);
        }
        
        if (this.control.view && this.control.view.data && this.control.view.data.model) {
            snapshot.viewDataModel = this._modelToObject(this.control.view.data.model);
        }
        
        if (this.control.view && this.control.view.model) {
            snapshot.viewModel = this._modelToObject(this.control.view.model);
        }
        
        return snapshot;
    }
    
    /**
     * Compare two model snapshots
     */
    compareSnapshots(snapshot1, snapshot2) {
        const differences = [];
        
        const compareObjects = (obj1, obj2, path = '') => {
            const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
            
            keys.forEach(key => {
                if (key.startsWith('_')) return; // Skip private properties
                
                const fullPath = path ? `${path}.${key}` : key;
                const val1 = obj1 ? obj1[key] : undefined;
                const val2 = obj2 ? obj2[key] : undefined;
                
                if (val1 !== val2) {
                    differences.push({
                        path: fullPath,
                        oldValue: val1,
                        newValue: val2
                    });
                }
            });
        };
        
        if (snapshot1.dataModel && snapshot2.dataModel) {
            compareObjects(snapshot1.dataModel, snapshot2.dataModel, 'dataModel');
        }
        
        if (snapshot1.viewDataModel && snapshot2.viewDataModel) {
            compareObjects(snapshot1.viewDataModel, snapshot2.viewDataModel, 'viewDataModel');
        }
        
        if (snapshot1.viewModel && snapshot2.viewModel) {
            compareObjects(snapshot1.viewModel, snapshot2.viewModel, 'viewModel');
        }
        
        return differences;
    }
    
    /**
     * Convert a model to a plain object
     * @private
     */
    _modelToObject(model) {
        const result = {};
        
        // Try different ways to get model properties
        if (model._) {
            // Data_Object style
            Object.keys(model._).forEach(key => {
                if (!key.startsWith('_')) {
                    result[key] = model._[key];
                }
            });
        } else {
            // Direct properties
            Object.keys(model).forEach(key => {
                if (!key.startsWith('_') && typeof model[key] !== 'function') {
                    result[key] = model[key];
                }
            });
        }
        
        return result;
    }
}

/**
 * Global debugging utilities
 */
const BindingDebugTools = {
    /**
     * Enable debugging for a control
     */
    enableFor(control) {
        if (!control._binding_debugger) {
            control._binding_debugger = new BindingDebugger(control);
        }
        control._binding_debugger.enable();
        return control._binding_debugger;
    },
    
    /**
     * Disable debugging for a control
     */
    disableFor(control) {
        if (control._binding_debugger) {
            control._binding_debugger.disable();
        }
    },
    
    /**
     * Get debugger for a control
     */
    getDebugger(control) {
        if (!control._binding_debugger) {
            control._binding_debugger = new BindingDebugger(control);
        }
        return control._binding_debugger;
    },
    
    /**
     * Print binding summary to console
     */
    inspect(control) {
        const dbg = this.getDebugger(control);
        console.log(dbg.visualizeBindings());
        return dbg.getBindingSummary();
    },
    
    /**
     * Monitor changes to a control's models
     */
    monitor(control, duration = 5000) {
        const dbg = this.getDebugger(control);
        const snapshots = [];
        
        console.log(`Monitoring ${control.__type_name || 'control'} for ${duration}ms...`);
        
        // Take initial snapshot
        snapshots.push(dbg.snapshotModels());
        
        // Take snapshots at intervals
        const interval = 500;
        const count = Math.floor(duration / interval);
        let current = 0;
        
        const timer = setInterval(() => {
            snapshots.push(dbg.snapshotModels());
            current++;
            
            if (current >= count) {
                clearInterval(timer);
                
                console.log('Monitoring complete. Analyzing changes...');
                
                // Compare consecutive snapshots
                const allDifferences = [];
                for (let i = 1; i < snapshots.length; i++) {
                    const diffs = dbg.compareSnapshots(snapshots[i - 1], snapshots[i]);
                    if (diffs.length > 0) {
                        allDifferences.push({
                            time: snapshots[i].timestamp,
                            differences: diffs
                        });
                    }
                }
                
                if (allDifferences.length === 0) {
                    console.log('No changes detected during monitoring period');
                } else {
                    console.log(`Detected ${allDifferences.length} change events:`);
                    allDifferences.forEach((event, index) => {
                        console.log(`\nChange #${index + 1} at ${event.time.toLocaleTimeString()}:`);
                        event.differences.forEach(diff => {
                            console.log(`  ${diff.path}: ${JSON.stringify(diff.oldValue)} → ${JSON.stringify(diff.newValue)}`);
                        });
                    });
                }
            }
        }, interval);
        
        return () => clearInterval(timer);
    }
};

module.exports = {
    BindingDebugger,
    BindingDebugTools
};
