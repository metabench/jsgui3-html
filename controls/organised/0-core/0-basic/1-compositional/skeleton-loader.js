const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Skeleton_Loader — Animated placeholder for loading states.
 * 
 * @param {Object} spec
 * @param {string} [spec.variant='text'] — Shape: 'text'|'circle'|'rect'|'card'
 * @param {string} [spec.width] — CSS width (e.g. '200px', '100%')
 * @param {string} [spec.height] — CSS height (e.g. '20px')
 * @param {number} [spec.lines=1] — Number of text lines (for variant='text')
 * @param {boolean} [spec.animate=true] — Enable shimmer animation
 */
class Skeleton_Loader extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'skeleton_loader';
        super(spec);
        this.add_class('skeleton-loader');
        this.add_class('jsgui-skeleton');

        // Config
        this._variant = spec.variant || 'text';
        this._width = spec.width || '';
        this._height = spec.height || '';
        this._lines = is_defined(spec.lines) ? Math.max(1, Math.floor(spec.lines)) : 1;
        this._animate = is_defined(spec.animate) ? !!spec.animate : true;

        this.dom.attributes['data-variant'] = this._variant;
        this.add_class(`skeleton-${this._variant}`);
        if (!this._animate) this.add_class('no-animate');

        if (!spec.el) {
            this.compose();
        }
    }

    // ---- Public API ----

    get variant() { return this._variant; }
    get lines() { return this._lines; }
    get animate() { return this._animate; }

    set_animate(v) {
        this._animate = !!v;
        if (this._animate) this.remove_class('no-animate');
        else this.add_class('no-animate');
    }

    // ---- Internal ----

    compose() {
        const { context } = this;

        const style_parts = [];
        if (this._width) style_parts.push(`width: ${this._width}`);
        if (this._height) style_parts.push(`height: ${this._height}`);

        if (this._variant === 'text' && this._lines > 1) {
            // Multiple text lines
            for (let i = 0; i < this._lines; i++) {
                const line = new Control({ context, tag_name: 'span' });
                line.add_class('skeleton-line');
                // Last line is typically shorter
                if (i === this._lines - 1 && this._lines > 1) {
                    line.add_class('skeleton-line-last');
                }
                if (style_parts.length > 0) {
                    line.dom.attributes = line.dom.attributes || {};
                    line.dom.attributes.style = style_parts.join('; ');
                }
                this.add(line);
            }
        } else {
            // Single element: circle, rect, card, or single text line
            const el = new Control({ context, tag_name: 'span' });
            el.add_class('skeleton-bone');
            if (style_parts.length > 0) {
                el.dom.attributes = el.dom.attributes || {};
                el.dom.attributes.style = style_parts.join('; ');
            }
            this.add(el);
        }
    }
}

Skeleton_Loader.css = `
.skeleton-loader {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* Bone (single placeholder element) */
.skeleton-loader .skeleton-bone,
.skeleton-loader .skeleton-line {
    display: block;
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
}
.skeleton-loader.no-animate .skeleton-bone,
.skeleton-loader.no-animate .skeleton-line {
    animation: none;
    background: #e2e8f0;
}

/* Text variant */
.skeleton-loader.skeleton-text .skeleton-line {
    height: 14px;
    width: 100%;
}
.skeleton-loader.skeleton-text .skeleton-line-last {
    width: 60%;
}
.skeleton-loader.skeleton-text .skeleton-bone {
    height: 14px;
    width: 100%;
}

/* Circle variant */
.skeleton-loader.skeleton-circle .skeleton-bone {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

/* Rect variant */
.skeleton-loader.skeleton-rect .skeleton-bone {
    width: 100%;
    height: 100px;
    border-radius: 6px;
}

/* Card variant */
.skeleton-loader.skeleton-card {
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
}
.skeleton-loader.skeleton-card .skeleton-bone {
    height: 120px;
    width: 100%;
    border-radius: 6px;
    margin-bottom: 12px;
}

@keyframes skeleton-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
`;

module.exports = Skeleton_Loader;
