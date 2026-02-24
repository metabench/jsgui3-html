const jsgui = require('../../../../../html-core/html-core');
const {Control} = jsgui;
const Scrollbar = require('./Scrollbar');
const H_Scrollbar = Scrollbar.H;
const V_Scrollbar = Scrollbar.V;

class Scroll_View extends Control {
    constructor(spec = {}) {
        super(spec);
        this.__type_name = 'scroll_view';
        this.add_class('scroll-view');

        this.show_horizontal = spec.show_horizontal !== false;
        this.show_vertical = spec.show_vertical !== false;
        this.inertia = !!spec.inertia;
        this.inertia_friction = spec.inertia_friction !== undefined ? spec.inertia_friction : 0.9;
        this.scroll_state = {
            scroll_left: 0,
            scroll_top: 0,
            scroll_width: 0,
            scroll_height: 0,
            viewport_width: 0,
            viewport_height: 0
        };

        if (!spec.el) {
            this.compose_scroll_view();
        }
    }

    compose_scroll_view() {
        const {context} = this;
        const viewport = new Control({
            context
        });
        viewport.add_class('scroll-view-viewport');
        viewport.dom.attributes.style.overflow = 'auto';

        const content = new Control({
            context
        });
        content.add_class('scroll-view-content');
        viewport.add(content);

        this.inner_control = content;
        this.viewport = viewport;

        this.add(viewport);

        if (this.show_horizontal) {
            this.h_scrollbar = new H_Scrollbar({context});
            this.add(this.h_scrollbar);
        }
        if (this.show_vertical) {
            this.v_scrollbar = new V_Scrollbar({context});
            this.add(this.v_scrollbar);
        }

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.viewport = viewport;
        this._ctrl_fields.inner_control = content;
        this._ctrl_fields.h_scrollbar = this.h_scrollbar;
        this._ctrl_fields.v_scrollbar = this.v_scrollbar;
    }

    /**
     * Update scroll state values.
     * @param {Object} next_state - New scroll state.
     */
    set_scroll_state(next_state = {}) {
        Object.assign(this.scroll_state, next_state);
        this.sync_scrollbars();
    }

    /**
     * Set scroll position.
     * @param {Object} position - Scroll positions.
     */
    set_scroll_position(position = {}) {
        const {scroll_left, scroll_top} = position;
        if (this.viewport && this.viewport.dom && this.viewport.dom.el) {
            const viewport_el = this.viewport.dom.el;
            if (scroll_left !== undefined) viewport_el.scrollLeft = scroll_left;
            if (scroll_top !== undefined) viewport_el.scrollTop = scroll_top;
            this.update_scroll_state_from_dom();
        } else {
            this.set_scroll_state({
                scroll_left: scroll_left !== undefined ? scroll_left : this.scroll_state.scroll_left,
                scroll_top: scroll_top !== undefined ? scroll_top : this.scroll_state.scroll_top
            });
        }
    }

    update_scroll_state_from_dom() {
        if (!this.viewport || !this.viewport.dom || !this.viewport.dom.el) return;
        const viewport_el = this.viewport.dom.el;
        this.scroll_state.scroll_left = viewport_el.scrollLeft;
        this.scroll_state.scroll_top = viewport_el.scrollTop;
        this.scroll_state.scroll_width = viewport_el.scrollWidth;
        this.scroll_state.scroll_height = viewport_el.scrollHeight;
        this.scroll_state.viewport_width = viewport_el.clientWidth;
        this.scroll_state.viewport_height = viewport_el.clientHeight;
        this.sync_scrollbars();
    }

    sync_scrollbars() {
        const state = this.scroll_state;
        if (this.h_scrollbar) {
            this.h_scrollbar.sync_from_scroll(
                state.scroll_left,
                state.scroll_width,
                state.viewport_width
            );
        }
        if (this.v_scrollbar) {
            this.v_scrollbar.sync_from_scroll(
                state.scroll_top,
                state.scroll_height,
                state.viewport_height
            );
        }
    }

    attach_inertia_scroll(viewport_el) {
        let velocity_x = 0;
        let velocity_y = 0;
        let frame = null;
        const friction = this.inertia_friction;

        const step = () => {
            if (!viewport_el) return;
            velocity_x *= friction;
            velocity_y *= friction;
            if (Math.abs(velocity_x) < 0.1 && Math.abs(velocity_y) < 0.1) {
                velocity_x = 0;
                velocity_y = 0;
                frame = null;
                return;
            }
            viewport_el.scrollLeft += velocity_x;
            viewport_el.scrollTop += velocity_y;
            this.update_scroll_state_from_dom();
            frame = requestAnimationFrame(step);
        };

        viewport_el.addEventListener('wheel', e_wheel => {
            e_wheel.preventDefault();
            velocity_x += e_wheel.deltaX;
            velocity_y += e_wheel.deltaY;
            if (!frame) {
                frame = requestAnimationFrame(step);
            }
        }, {passive: false});
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.viewport || !this.viewport.dom || !this.viewport.dom.el) return;
            const viewport_el = this.viewport.dom.el;
            viewport_el.addEventListener('scroll', () => {
                this.update_scroll_state_from_dom();
            });

            if (this.h_scrollbar && typeof this.h_scrollbar.on === 'function') {
                this.h_scrollbar.on('scroll', e_scroll => {
                    const state = this.scroll_state;
                    const scroll_range = Math.max(1, state.scroll_width - state.viewport_width);
                    const next_left = e_scroll.ratio * scroll_range;
                    this.set_scroll_position({scroll_left: next_left});
                });
            }
            if (this.v_scrollbar && typeof this.v_scrollbar.on === 'function') {
                this.v_scrollbar.on('scroll', e_scroll => {
                    const state = this.scroll_state;
                    const scroll_range = Math.max(1, state.scroll_height - state.viewport_height);
                    const next_top = e_scroll.ratio * scroll_range;
                    this.set_scroll_position({scroll_top: next_top});
                });
            }

            if (this.inertia) {
                this.attach_inertia_scroll(viewport_el);
            }
        }
    }
}

Scroll_View.css = `
.scroll-view {
    position: relative;
    display: block;
}
.scroll-view-viewport {
    width: 100%;
    height: 100%;
}
.scroll-view-content {
    min-width: 100%;
    min-height: 100%;
}
`;

module.exports = Scroll_View;
