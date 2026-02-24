const is_defined = value => value !== undefined && value !== null;

const parse_px = value => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

const get_ctrl_size = ctrl => {
    if (ctrl && Array.isArray(ctrl.size) && ctrl.size.length === 2) {
        const [width, height] = ctrl.size;
        if (is_defined(width) && is_defined(height)) {
            return [Number(width), Number(height)];
        }
    }
    const style = ctrl && ctrl.dom && ctrl.dom.attributes && ctrl.dom.attributes.style;
    if (style) {
        const width = parse_px(style.width);
        const height = parse_px(style.height);
        if (width || height) return [width, height];
    }
    if (ctrl && ctrl.dom && ctrl.dom.el && typeof ctrl.dom.el.getBoundingClientRect === 'function') {
        const rect = ctrl.dom.el.getBoundingClientRect();
        return [rect.width, rect.height];
    }
    return [0, 0];
};

const get_ctrl_pos = ctrl => {
    if (ctrl && typeof ctrl.left === 'number' && typeof ctrl.top === 'number') {
        return [ctrl.left, ctrl.top];
    }
    if (ctrl && Array.isArray(ctrl.pos) && ctrl.pos.length === 2) {
        return [Number(ctrl.pos[0]), Number(ctrl.pos[1])];
    }
    const style = ctrl && ctrl.dom && ctrl.dom.attributes && ctrl.dom.attributes.style;
    if (style) {
        const left = parse_px(style.left);
        const top = parse_px(style.top);
        return [left, top];
    }
    return [0, 0];
};

const reset_translate = ctrl => {
    if (ctrl && ctrl.ta && ctrl.ta.length >= 8) {
        ctrl.ta[6] = 0;
        ctrl.ta[7] = 0;
    }
};

class Window_Manager {
    constructor(options = {}) {
        this.windows = new Set();
        this.next_z = options.base_z || 1000;
        this.snap_threshold = options.snap_threshold || 24;
    }

    register(window_ctrl) {
        if (!window_ctrl) return;
        this.windows.add(window_ctrl);
        window_ctrl.manager = this;
        this.ensure_z(window_ctrl);
    }

    unregister(window_ctrl) {
        if (!window_ctrl) return;
        this.windows.delete(window_ctrl);
    }

    ensure_z(window_ctrl) {
        if (!window_ctrl || !window_ctrl.dom || !window_ctrl.dom.attributes) return;
        const style = window_ctrl.dom.attributes.style;
        if (!is_defined(style['z-index'])) {
            style['z-index'] = this.next_z++;
        }
    }

    bring_to_front(window_ctrl) {
        if (!window_ctrl || !window_ctrl.dom || !window_ctrl.dom.attributes) return;
        const style = window_ctrl.dom.attributes.style;
        style['z-index'] = this.next_z++;
    }

    get_parent_bounds(window_ctrl) {
        const parent = window_ctrl && window_ctrl.parent;
        if (!parent) {
            return {
                pos: [0, 0],
                size: [0, 0]
            };
        }
        const size = get_ctrl_size(parent);
        const pos = get_ctrl_pos(parent);
        return {
            pos,
            size
        };
    }

    dock(window_ctrl, edge, options = {}) {
        if (!window_ctrl) return;
        const bounds = this.get_parent_bounds(window_ctrl);
        const [parent_left, parent_top] = bounds.pos;
        const [parent_width, parent_height] = bounds.size;
        if (!parent_width || !parent_height) return;

        const dock_edge = edge || 'left';
        if (!window_ctrl._pre_dock_state) {
            window_ctrl._pre_dock_state = {
                pos: get_ctrl_pos(window_ctrl),
                size: get_ctrl_size(window_ctrl)
            };
        }

        const size_override = options.size;
        let next_pos = [parent_left, parent_top];
        let next_size = [parent_width, parent_height];

        if (dock_edge === 'left') {
            next_size = size_override || [Math.round(parent_width / 2), parent_height];
            next_pos = [parent_left, parent_top];
        } else if (dock_edge === 'right') {
            next_size = size_override || [Math.round(parent_width / 2), parent_height];
            next_pos = [parent_left + parent_width - next_size[0], parent_top];
        } else if (dock_edge === 'top') {
            next_size = size_override || [parent_width, Math.round(parent_height / 2)];
            next_pos = [parent_left, parent_top];
        } else if (dock_edge === 'bottom') {
            next_size = size_override || [parent_width, Math.round(parent_height / 2)];
            next_pos = [parent_left, parent_top + parent_height - next_size[1]];
        } else if (dock_edge === 'fill') {
            next_size = size_override || [parent_width, parent_height];
            next_pos = [parent_left, parent_top];
        }

        reset_translate(window_ctrl);
        window_ctrl.pos = next_pos;
        window_ctrl.size = next_size;
        window_ctrl.docked_edge = dock_edge;
        if (window_ctrl.add_class) {
            window_ctrl.add_class(`docked-${dock_edge}`);
        }
    }

    undock(window_ctrl) {
        if (!window_ctrl || !window_ctrl._pre_dock_state) return;
        const {pos, size} = window_ctrl._pre_dock_state;
        reset_translate(window_ctrl);
        if (pos) window_ctrl.pos = pos;
        if (size) window_ctrl.size = size;
        if (window_ctrl.docked_edge && window_ctrl.remove_class) {
            window_ctrl.remove_class(`docked-${window_ctrl.docked_edge}`);
        }
        window_ctrl.docked_edge = null;
        window_ctrl._pre_dock_state = null;
    }

    snap(window_ctrl, options = {}) {
        const threshold = is_defined(options.threshold) ? options.threshold : this.snap_threshold;
        const bounds = this.get_parent_bounds(window_ctrl);
        const [parent_left, parent_top] = bounds.pos;
        const [parent_width, parent_height] = bounds.size;
        if (!parent_width || !parent_height) return false;

        const pos = get_ctrl_pos(window_ctrl);
        const size = get_ctrl_size(window_ctrl);
        const [left, top] = pos;
        const [width, height] = size;
        const right = left + width;
        const bottom = top + height;

        const dist_left = Math.abs(left - parent_left);
        const dist_right = Math.abs(right - (parent_left + parent_width));
        const dist_top = Math.abs(top - parent_top);
        const dist_bottom = Math.abs(bottom - (parent_top + parent_height));

        if (dist_left <= threshold) {
            this.dock(window_ctrl, 'left', options);
            return true;
        }
        if (dist_right <= threshold) {
            this.dock(window_ctrl, 'right', options);
            return true;
        }
        if (dist_top <= threshold) {
            this.dock(window_ctrl, 'top', options);
            return true;
        }
        if (dist_bottom <= threshold) {
            this.dock(window_ctrl, 'bottom', options);
            return true;
        }
        return false;
    }
}

const get_window_manager = context => {
    if (context && context.window_manager) return context.window_manager;
    if (context) {
        context.window_manager = new Window_Manager();
        return context.window_manager;
    }
    if (!get_window_manager._singleton) {
        get_window_manager._singleton = new Window_Manager();
    }
    return get_window_manager._singleton;
};

module.exports = {
    Window_Manager,
    get_window_manager
};
