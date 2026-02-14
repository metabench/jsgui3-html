'use strict';

/**
 * Tooltip Mixin
 *
 * Attaches a tooltip to any jsgui control on hover/focus.
 *
 * Usage:
 *   const tooltip = require('./tooltip');
 *   tooltip(my_control, { content: 'Hello!', position: 'top', delay: 300 });
 *
 * The mixin creates a Tooltip control anchored to the target control.
 * It manages show/hide on mouseenter/mouseleave/focus/blur.
 *
 * @param {Object} ctrl - The jsgui Control to attach a tooltip to.
 * @param {Object} opts
 * @param {string|Function} opts.content - Text content (or function returning text).
 * @param {'top'|'bottom'|'left'|'right'} [opts.position='top']
 * @param {number} [opts.delay=400] - Show delay in ms.
 * @returns {{ dispose: Function, set_content: Function }}
 */
const { create_mixin_cleanup } = require('./mixin_cleanup');

let Tooltip;
try {
    Tooltip = require('../controls/organised/1-standard/5-ui/tooltip');
} catch (e) {
    Tooltip = null;
}

const tooltip = (ctrl, opts = {}) => {
    // Guard against double-application
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.tooltip) return ctrl.__mx.tooltip;

    const cleanup = create_mixin_cleanup(ctrl, 'tooltip');
    ctrl.__mx.tooltip = cleanup;

    const position = opts.position || 'top';
    const delay = opts.delay !== undefined ? opts.delay : 400;
    let content = opts.content || '';

    let _tooltip_ctrl = null;
    let _attached = false;

    // Resolve content (may be function)
    const get_content = () => typeof content === 'function' ? content() : String(content);

    // Lazily create the Tooltip control when first needed
    const ensure_tooltip = () => {
        if (_tooltip_ctrl) return _tooltip_ctrl;
        if (!Tooltip) return null;

        _tooltip_ctrl = new Tooltip({
            context: ctrl.context,
            target: ctrl,
            message: get_content(),
            position,
            show_delay: delay,
            hide_delay: 100
        });
        return _tooltip_ctrl;
    };

    // Attach events
    const setup_dom = () => {
        if (_attached) return;
        _attached = true;

        const el = ctrl.dom && ctrl.dom.el;
        if (!el) return;

        // Fallback for simple title if Tooltip control unavailable
        if (!Tooltip) {
            el.setAttribute('title', get_content());
            cleanup.on_dispose(() => el.removeAttribute('title'));
            return;
        }

        const on_enter = () => {
            const tip = ensure_tooltip();
            if (tip) {
                tip.set_message(get_content());
                tip.show();
            }
        };

        const on_leave = () => {
            if (_tooltip_ctrl) _tooltip_ctrl.hide();
        };

        el.addEventListener('mouseenter', on_enter);
        el.addEventListener('mouseleave', on_leave);
        el.addEventListener('focus', on_enter);
        el.addEventListener('blur', on_leave);

        cleanup.track_dom_listener(el, 'mouseenter', on_enter);
        cleanup.track_dom_listener(el, 'mouseleave', on_leave);
        cleanup.track_dom_listener(el, 'focus', on_enter);
        cleanup.track_dom_listener(el, 'blur', on_leave);

        // ARIA
        if (_tooltip_ctrl && _tooltip_ctrl.dom) {
            el.setAttribute('aria-describedby', _tooltip_ctrl._id());
        }
    };

    // API
    ctrl.set_tooltip_content = (text) => {
        content = text;
        if (_tooltip_ctrl) _tooltip_ctrl.set_message(get_content());
        // Also update title fallback
        const el = ctrl.dom && ctrl.dom.el;
        if (el && !Tooltip) el.setAttribute('title', get_content());
    };

    // Hook up when DOM is available
    if (ctrl.dom && ctrl.dom.el) {
        setup_dom();
    } else if (typeof ctrl.once_active === 'function') {
        ctrl.once_active(setup_dom);
    }

    // Cleanup
    cleanup.on_dispose(() => {
        if (_tooltip_ctrl && typeof _tooltip_ctrl.hide === 'function') {
            _tooltip_ctrl.hide(true);
        }
        delete ctrl.set_tooltip_content;
        _tooltip_ctrl = null;
    });

    return cleanup;
};

module.exports = tooltip;
