
        const jsgui = require('../../html-core/html-core');
        const all_controls = require('../../controls/controls');

        // Client-side context
        const context = new jsgui.Page_Context();

        // Register all controls
        Object.keys(all_controls).forEach(name => {
            const C = all_controls[name];
            if (C && typeof C === 'function') {
                context.map_Controls[name] = C;
                // Register by _tag_name if available (standard jsgui pattern)
                if (C.prototype && C.prototype._tag_name) {
                    context.map_Controls[C.prototype._tag_name] = C;
                }
                // Also register by class name if different
                if (C.name && C.name !== name) {
                    context.map_Controls[C.name] = C;
                }
                
                // Register lowercase and hyphenated versions to ensure matching with data-jsgui-type
                const lower = name.toLowerCase();
                if (!context.map_Controls[lower]) context.map_Controls[lower] = C;
                
                const hyphenated = lower.replace(/_/g, '-');
                if (!context.map_Controls[hyphenated]) context.map_Controls[hyphenated] = C;
            }
        });

        // Activate
        console.log('Activating Gallery Controls...');
        try {
            jsgui.pre_activate(context);
            jsgui.activate(context);
            console.log('Gallery Active ✅');
        } catch (e) {
            console.error('Activation failed:', e);
        }

        // Expose for debug
        window.jsgui = jsgui;
        window.controls = all_controls;
        window.context = context;
    