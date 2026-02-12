/**
 * Tooltip — Contextual hover/focus tip anchored to a trigger element.
 *
 * Features:
 *   - Positions relative to target via getBoundingClientRect()
 *   - Supports top / bottom / left / right placement
 *   - Collision detection: flips to opposite side when overflowing viewport
 *   - CSS arrow pointing at trigger element
 *   - Configurable show/hide delay (default 400 ms / 100 ms)
 *   - Theme tokens: var(--j-tooltip-bg), var(--j-tooltip-fg)
 *   - Max-width with word-wrap
 *   - Smooth slide-in animation
 *   - Rich content support (HTML strings)
 *   - ARIA: role="tooltip", aria-hidden, aria-describedby on target
 *
 * @example
 *   const tip = new Tooltip({
 *       message: 'Save your changes',
 *       placement: 'top',     // top | bottom | left | right
 *       target: button_ctrl,  // Control instance, CSS selector, or DOM element
 *       delay: 300,           // show delay in ms (default 400)
 *       max_width: 260        // px (default 280)
 *   });
 */

const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const ARROW_OFFSET = 6; // arrow size in px
const DEFAULT_SHOW_DELAY = 400;
const DEFAULT_HIDE_DELAY = 100;
const DEFAULT_MAX_WIDTH = 280;

class Tooltip extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'tooltip';
        super(spec);

        this.add_class('jsgui-tooltip');
        this.dom.tagName = 'div';
        this.dom.attributes.role = 'tooltip';
        this.dom.attributes['aria-hidden'] = 'true';
        this.dom.attributes.id = this._id();

        // Config
        this.message = is_defined(spec.message)
            ? String(spec.message)
            : (is_defined(spec.text) ? String(spec.text) : '');
        this.placement = is_defined(spec.placement) ? String(spec.placement) : 'top';
        this.target = spec.target;
        this.show_delay = is_defined(spec.delay) ? Number(spec.delay) : DEFAULT_SHOW_DELAY;
        this.hide_delay = is_defined(spec.hide_delay) ? Number(spec.hide_delay) : DEFAULT_HIDE_DELAY;
        this.max_width = is_defined(spec.max_width) ? Number(spec.max_width) : DEFAULT_MAX_WIDTH;
        this.rich = !!spec.rich; // If true, message is treated as HTML

        // Internal state
        this._show_timer = null;
        this._hide_timer = null;
        this._current_placement = this.placement;

        // Placement class
        this.add_class(`jsgui-tooltip--${this.placement}`);

        // Set initial content
        if (!spec.el && this.message) {
            this.add(this.message);
        }
    }

    /**
     * Set the tooltip message.
     * @param {string} message - The message to set.
     */
    set_message(message) {
        this.message = is_defined(message) ? String(message) : '';
        this.clear();
        if (this.message) {
            this.add(this.message);
        }
    }

    /**
     * Show the tooltip with optional delay.
     * @param {boolean} [immediate=false] - Skip the delay.
     */
    show(immediate) {
        this._clear_timers();

        const do_show = () => {
            this.add_class('is-visible');
            this.dom.attributes['aria-hidden'] = 'false';
            if (this.dom.el) {
                this.dom.el.setAttribute('aria-hidden', 'false');
                this._position();
            }
        };

        if (immediate || this.show_delay <= 0) {
            do_show();
        } else {
            this._show_timer = setTimeout(do_show, this.show_delay);
        }
    }

    /**
     * Hide the tooltip with optional delay.
     * @param {boolean} [immediate=false] - Skip the delay.
     */
    hide(immediate) {
        this._clear_timers();

        const do_hide = () => {
            this.remove_class('is-visible');
            this.dom.attributes['aria-hidden'] = 'true';
            if (this.dom.el) {
                this.dom.el.setAttribute('aria-hidden', 'true');
            }
        };

        if (immediate || this.hide_delay <= 0) {
            do_hide();
        } else {
            this._hide_timer = setTimeout(do_hide, this.hide_delay);
        }
    }

    /**
     * Calculate and set position relative to target element.
     * Flips placement if tooltip overflows viewport.
     */
    _position() {
        if (typeof document === 'undefined') return;

        const el = this.dom.el;
        const target_el = this._resolve_target();
        if (!el || !target_el) return;

        const target_rect = target_el.getBoundingClientRect();
        const tip_rect = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const gap = ARROW_OFFSET + 4; // arrow + spacing

        let placement = this.placement;

        // Check if preferred placement overflows, flip if needed
        if (placement === 'top' && target_rect.top - tip_rect.height - gap < 0) {
            placement = 'bottom';
        } else if (placement === 'bottom' && target_rect.bottom + tip_rect.height + gap > vh) {
            placement = 'top';
        } else if (placement === 'left' && target_rect.left - tip_rect.width - gap < 0) {
            placement = 'right';
        } else if (placement === 'right' && target_rect.right + tip_rect.width + gap > vw) {
            placement = 'left';
        }

        // Update placement class if flipped
        if (placement !== this._current_placement) {
            el.classList.remove(`jsgui-tooltip--${this._current_placement}`);
            el.classList.add(`jsgui-tooltip--${placement}`);
            this._current_placement = placement;
        }

        // Calculate position
        let top, left;
        const scroll_top = window.pageYOffset || document.documentElement.scrollTop;
        const scroll_left = window.pageXOffset || document.documentElement.scrollLeft;

        switch (placement) {
            case 'top':
                top = target_rect.top + scroll_top - tip_rect.height - gap;
                left = target_rect.left + scroll_left + (target_rect.width - tip_rect.width) / 2;
                break;
            case 'bottom':
                top = target_rect.bottom + scroll_top + gap;
                left = target_rect.left + scroll_left + (target_rect.width - tip_rect.width) / 2;
                break;
            case 'left':
                top = target_rect.top + scroll_top + (target_rect.height - tip_rect.height) / 2;
                left = target_rect.left + scroll_left - tip_rect.width - gap;
                break;
            case 'right':
                top = target_rect.top + scroll_top + (target_rect.height - tip_rect.height) / 2;
                left = target_rect.right + scroll_left + gap;
                break;
        }

        // Clamp to viewport edges
        left = Math.max(8, Math.min(left, vw + scroll_left - tip_rect.width - 8));

        el.style.top = `${Math.round(top)}px`;
        el.style.left = `${Math.round(left)}px`;
    }

    /**
     * Resolve the target to a DOM element.
     * @returns {HTMLElement|null}
     */
    _resolve_target() {
        if (!this.target) return null;
        if (typeof document === 'undefined') return null;

        // DOM element directly
        if (this.target.nodeType) return this.target;

        // jsgui Control instance
        if (this.target.dom && this.target.dom.el) return this.target.dom.el;

        // CSS selector string
        if (typeof this.target === 'string') {
            return document.querySelector(this.target);
        }

        // Context-based lookup
        if (this.context && typeof this.context.get_ctrl_el === 'function') {
            return this.context.get_ctrl_el(this.target);
        }

        return null;
    }

    _clear_timers() {
        if (this._show_timer) { clearTimeout(this._show_timer); this._show_timer = null; }
        if (this._hide_timer) { clearTimeout(this._hide_timer); this._hide_timer = null; }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (typeof document === 'undefined') return;

            const target_el = this._resolve_target();
            if (!target_el) return;

            // ARIA link
            target_el.setAttribute('aria-describedby', this._id());

            // Set max-width on the element
            if (this.dom.el) {
                this.dom.el.style.maxWidth = `${this.max_width}px`;
            }

            // Mouse events
            target_el.addEventListener('mouseenter', () => this.show());
            target_el.addEventListener('mouseleave', () => this.hide());

            // Keyboard events
            target_el.addEventListener('focus', () => this.show());
            target_el.addEventListener('blur', () => this.hide());

            // Escape to dismiss
            const on_keydown = (e) => {
                if (e.key === 'Escape') this.hide(true);
            };
            target_el.addEventListener('keydown', on_keydown);
        }
    }
}

Tooltip.css = `
/* ── Tooltip ─────────────────────────────────────────────── */
.jsgui-tooltip {
    position: absolute;
    z-index: 9999;
    padding: 6px 10px;
    border-radius: var(--j-radius, 6px);
    background: var(--j-tooltip-bg, #1f2937);
    color: var(--j-tooltip-fg, #f9fafb);
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.4;
    max-width: 280px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    pointer-events: none;
    box-shadow: var(--j-shadow-md, 0 4px 6px rgba(0,0,0,0.12));

    /* Hidden by default */
    opacity: 0;
    visibility: hidden;
    transform: scale(0.96);
    transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
}

/* Visible state */
.jsgui-tooltip.is-visible {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
}

/* ── Slide direction per placement ───────────────────────── */
.jsgui-tooltip--top    { transform: translateY(4px) scale(0.96); }
.jsgui-tooltip--bottom { transform: translateY(-4px) scale(0.96); }
.jsgui-tooltip--left   { transform: translateX(4px) scale(0.96); }
.jsgui-tooltip--right  { transform: translateX(-4px) scale(0.96); }

.jsgui-tooltip--top.is-visible,
.jsgui-tooltip--bottom.is-visible,
.jsgui-tooltip--left.is-visible,
.jsgui-tooltip--right.is-visible {
    transform: translateY(0) translateX(0) scale(1);
}

/* ── Arrow ──────────────────────────────────────────────── */
.jsgui-tooltip::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;
}

.jsgui-tooltip--top::after {
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-top-color: var(--j-tooltip-bg, #1f2937);
}

.jsgui-tooltip--bottom::after {
    bottom: 100%;
    left: 50%;
    margin-left: -6px;
    border-bottom-color: var(--j-tooltip-bg, #1f2937);
}

.jsgui-tooltip--left::after {
    left: 100%;
    top: 50%;
    margin-top: -6px;
    border-left-color: var(--j-tooltip-bg, #1f2937);
}

.jsgui-tooltip--right::after {
    right: 100%;
    top: 50%;
    margin-top: -6px;
    border-right-color: var(--j-tooltip-bg, #1f2937);
}
`;

module.exports = Tooltip;
