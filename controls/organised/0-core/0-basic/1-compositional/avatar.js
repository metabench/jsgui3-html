const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Avatar — Displays a user image, initials, or fallback icon.
 * 
 * @param {Object} spec
 * @param {string} [spec.src] — Image URL
 * @param {string} [spec.initials] — Fallback initials (1-2 chars)
 * @param {string} [spec.alt] — Alt text for image
 * @param {string} [spec.avatar_size='md'] — Size: 'xs'|'sm'|'md'|'lg'|'xl'
 * @param {string} [spec.shape='circle'] — Shape: 'circle'|'square'
 * @param {string} [spec.status] — Status indicator: 'online'|'offline'|'busy'|'away'
 * @param {string} [spec.bg_color] — Background color for initials fallback
 */
class Avatar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'avatar';
        super(spec);
        this.add_class('avatar');
        this.add_class('jsgui-avatar');

        // Config
        this._src = spec.src || '';
        this._initials = spec.initials || '';
        this._alt = spec.alt || '';
        this._avatar_size = spec.avatar_size || 'md';
        this._shape = spec.shape || 'circle';
        this._status = spec.status || '';
        this._bg_color = spec.bg_color || '';

        this.dom.attributes['data-size'] = this._avatar_size;
        if (this._shape !== 'circle') {
            this.dom.attributes['data-shape'] = this._shape;
        }
        this.add_class(`avatar-${this._avatar_size}`);
        this.add_class(`avatar-${this._shape}`);

        if (!spec.el) {
            this.compose();
        }
    }

    // ---- Public API ----

    get src() { return this._src; }
    get initials() { return this._initials; }
    get avatar_size() { return this._avatar_size; }
    get shape() { return this._shape; }
    get status() { return this._status; }

    set_src(url) {
        this._src = url || '';
        this.recompose();
    }

    set_initials(text) {
        this._initials = text || '';
        this.recompose();
    }

    set_status(s) {
        // Remove old status
        if (this._status_ctrl) {
            this._status_ctrl.remove_class(`status-${this._status}`);
        }
        this._status = s || '';
        if (this._status_ctrl && this._status) {
            this._status_ctrl.add_class(`status-${this._status}`);
            this._status_ctrl.remove_class('hidden');
        } else if (this._status_ctrl) {
            this._status_ctrl.add_class('hidden');
        }
    }

    // ---- Internal ----

    compose() {
        const { context } = this;

        // Inner container (for the image or initials)
        this._inner = new Control({ context, tag_name: 'span' });
        this._inner.add_class('avatar-inner');

        if (this._bg_color) {
            this._inner.dom.attributes = this._inner.dom.attributes || {};
            this._inner.dom.attributes.style = `background-color: ${this._bg_color}`;
        }

        if (this._src) {
            // Image mode
            this._inner.add_class('avatar-img');
            this._inner.dom.attributes = this._inner.dom.attributes || {};
            this._inner.dom.attributes.style = (this._inner.dom.attributes.style || '') +
                `; background-image: url('${this._src}')`;
            if (this._alt) {
                this._inner.dom.attributes.title = this._alt;
            }
        } else if (this._initials) {
            // Initials mode
            this._inner.add_class('avatar-initials');
            this._inner.add(this._initials.substring(0, 2).toUpperCase());
        } else {
            // Fallback icon
            this._inner.add_class('avatar-fallback');
            this._inner.add('👤');
        }

        this.add(this._inner);

        // Status indicator (optional)
        this._status_ctrl = new Control({ context, tag_name: 'span' });
        this._status_ctrl.add_class('avatar-status');
        if (this._status) {
            this._status_ctrl.add_class(`status-${this._status}`);
        } else {
            this._status_ctrl.add_class('hidden');
        }
        this.add(this._status_ctrl);
    }

}

Avatar.css = `
.avatar {
    display: inline-flex;
    position: relative;
    flex-shrink: 0;
}

/* Inner */
.avatar .avatar-inner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    background: #94a3b8;
    color: #fff;
    font-weight: 600;
    background-size: cover;
    background-position: center;
}
.avatar.avatar-square .avatar-inner {
    border-radius: 6px;
}
.avatar .avatar-fallback {
    font-size: 1em;
}

/* Size presets */
.avatar.avatar-xs .avatar-inner { width: 24px; height: 24px; font-size: 10px; }
.avatar.avatar-sm .avatar-inner { width: 32px; height: 32px; font-size: 12px; }
.avatar.avatar-md .avatar-inner { width: 40px; height: 40px; font-size: 14px; }
.avatar.avatar-lg .avatar-inner { width: 56px; height: 56px; font-size: 18px; }
.avatar.avatar-xl .avatar-inner { width: 72px; height: 72px; font-size: 24px; }

/* Status dot */
.avatar .avatar-status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #fff;
}
.avatar .avatar-status.hidden { display: none; }
.avatar .avatar-status.status-online { background: #22c55e; }
.avatar .avatar-status.status-offline { background: #94a3b8; }
.avatar .avatar-status.status-busy { background: #ef4444; }
.avatar .avatar-status.status-away { background: #f59e0b; }

/* Adjust status dot for sizes */
.avatar.avatar-xs .avatar-status { width: 6px; height: 6px; border-width: 1px; }
.avatar.avatar-sm .avatar-status { width: 8px; height: 8px; border-width: 1.5px; }
.avatar.avatar-lg .avatar-status { width: 12px; height: 12px; }
.avatar.avatar-xl .avatar-status { width: 14px; height: 14px; border-width: 3px; }
`;

module.exports = Avatar;
