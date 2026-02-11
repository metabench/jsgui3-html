const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Rating_Stars — A star-rating input control.
 * 
 * @param {Object} spec
 * @param {number} [spec.max=5] — Maximum number of stars
 * @param {number} [spec.value=0] — Initial rating value
 * @param {boolean} [spec.half=false] — Allow half-star ratings
 * @param {boolean} [spec.readonly=false] — Disable interaction
 * @param {number} [spec.star_size=24] — Star size in px
 * 
 * Events:
 *   'change' { value: number } — Fired when rating changes
 */
class Rating_Stars extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'rating_stars';
        super(spec);
        this.add_class('rating-stars');

        // Config
        this._max = is_defined(spec.max) ? Math.max(1, Math.floor(spec.max)) : 5;
        this._half = !!spec.half;
        this._readonly = !!spec.readonly;
        this._star_size = is_defined(spec.star_size) ? spec.star_size : 24;

        // State
        this._value = 0;
        this._hover_value = null; // null = not hovering
        this._stars = [];

        if (this._readonly) this.add_class('readonly');

        // Set size CSS variable
        this.dom.style = this.dom.style || {};

        if (!spec.el) {
            this._compose_stars();
        }

        // Set initial value after compose so stars exist
        if (is_defined(spec.value)) {
            this.value = spec.value;
        }
    }

    // ---- Public API ----

    get value() { return this._value; }
    set value(v) {
        v = Number(v) || 0;
        v = Math.max(0, Math.min(v, this._max));
        if (!this._half) v = Math.round(v);
        else v = Math.round(v * 2) / 2; // snap to 0.5
        this._value = v;
        this._update_display();
    }

    get max() { return this._max; }
    get readonly() { return this._readonly; }

    set_value(v) { this.value = v; }
    get_value() { return this._value; }

    set_readonly(v) {
        this._readonly = !!v;
        if (this._readonly) this.add_class('readonly');
        else this.remove_class('readonly');
    }

    // ---- Internal ----

    _compose_stars() {
        const { context } = this;

        for (let i = 0; i < this._max; i++) {
            const star = new Control({ context, tag_name: 'span' });
            star.add_class('star');
            star.add('☆'); // empty star initially
            star._star_index = i;
            this._stars.push(star);
            this.add(star);
        }
    }

    _update_display() {
        const display_value = this._hover_value !== null ? this._hover_value : this._value;

        for (let i = 0; i < this._stars.length; i++) {
            const star = this._stars[i];
            const star_num = i + 1;

            // Remove all state classes
            star.remove_class('filled');
            star.remove_class('half-filled');
            star.remove_class('hover');

            if (this._hover_value !== null) {
                star.add_class('hover');
            }

            if (star_num <= display_value) {
                // Fully filled
                star.add_class('filled');
                this._set_star_text(star, '★');
            } else if (this._half && star_num - 0.5 === display_value) {
                // Half filled
                star.add_class('half-filled');
                this._set_star_text(star, '★');
            } else {
                // Empty
                star.remove_class('hover');
                this._set_star_text(star, '☆');
            }
        }
    }

    _set_star_text(star, text) {
        // Clear and re-add text content
        star.clear();
        star.add(text);
    }

    _get_click_value(star_index, is_left_half) {
        const base = star_index + 1;
        if (this._half && is_left_half) {
            return base - 0.5;
        }
        return base;
    }

    // ---- Activation (events) ----

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        if (this._readonly) return;

        this._stars.forEach((star, i) => {
            const el = star.dom.el;
            if (!el) return;

            el.addEventListener('mouseenter', () => {
                if (this._readonly) return;
                this._hover_value = i + 1;
                this._update_display();
            });

            el.addEventListener('mousemove', (e) => {
                if (this._readonly || !this._half) return;
                const rect = el.getBoundingClientRect();
                const is_left = (e.clientX - rect.left) < rect.width / 2;
                this._hover_value = this._get_click_value(i, is_left);
                this._update_display();
            });

            el.addEventListener('mouseleave', () => {
                this._hover_value = null;
                this._update_display();
            });

            el.addEventListener('click', (e) => {
                if (this._readonly) return;
                let new_value;
                if (this._half) {
                    const rect = el.getBoundingClientRect();
                    const is_left = (e.clientX - rect.left) < rect.width / 2;
                    new_value = this._get_click_value(i, is_left);
                } else {
                    new_value = i + 1;
                }

                // Toggle off if clicking same value
                if (new_value === this._value) {
                    new_value = 0;
                }

                this._value = new_value;
                this._hover_value = null;
                this._update_display();
                this.raise('change', { value: this._value });
            });
        });

        // Mouse leave on container
        const container_el = this.dom.el;
        if (container_el) {
            container_el.addEventListener('mouseleave', () => {
                this._hover_value = null;
                this._update_display();
            });
        }
    }
}

Rating_Stars.css = `
.rating-stars {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    user-select: none;
    -webkit-user-select: none;
}
.rating-stars .star {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    color: #d1d5db;
    transition: color 0.15s ease, transform 0.15s ease;
}
.rating-stars .star.filled {
    color: #f59e0b;
}
.rating-stars .star.half-filled {
    background: linear-gradient(90deg, #f59e0b 50%, #d1d5db 50%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
.rating-stars .star.hover {
    transform: scale(1.15);
}
.rating-stars .star.hover.filled {
    color: #fbbf24;
}
.rating-stars:not(.readonly) .star:hover {
    transform: scale(1.2);
}
.rating-stars.readonly .star {
    cursor: default;
}
`;

module.exports = Rating_Stars;
