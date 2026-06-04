'use strict';

const bootstrap_client_controls = (jsgui, custom_controls = {}, options = {}) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return null;
    }

    const bootstrap_key = options.bootstrap_key || '__jsgui_dev_example_context__';

    const start = () => {
        if (window[bootstrap_key]) {
            return window[bootstrap_key];
        }

        const context = new jsgui.Page_Context({ document });
        const register_controls = (controls_map) => {
            if (!controls_map || typeof controls_map !== 'object') return;
            Object.keys(controls_map).forEach((name) => {
                context.update_Controls(name, controls_map[name]);
            });
        };

        register_controls(jsgui.map_Controls);
        register_controls(custom_controls);

        jsgui.pre_activate(context);
        jsgui.activate(context);
        window[bootstrap_key] = context;
        return context;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
        return null;
    }

    return start();
};

module.exports = bootstrap_client_controls;
