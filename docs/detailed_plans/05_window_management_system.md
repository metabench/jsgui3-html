# Window Management System - Detailed Implementation Plan

## Objective

Enhance the Window and Panel controls with a comprehensive window management system including snap, dock, tiling, z-index management, and multi-window coordination.

## Current State Analysis

### Existing Implementation

From `controls/organised/1-standard/6-layout/window.js`:

- **Window class** with minimize, maximize, close
- **Window_Manager** for coordination (`window_manager.js`)
- **Snap support** via `snap_to_bounds()`
- **Dock support** via `dock_to(edge)`
- **Drag and resize** via mixins
- **Z-index management** via `bring_to_front_z()`

### Current Capabilities

| Feature | Status | Notes |
|---------|--------|-------|
| Basic window operations | Complete | min/max/close |
| Dragging | Complete | Via dragable mixin |
| Resizing | Complete | Via resizable mixin |
| Z-index stacking | Partial | Basic implementation |
| Snap to edges | Partial | Through manager |
| Dock to edges | Partial | Through manager |
| Tiling | Not implemented | |
| Cascade/tile arrangement | Not implemented | |
| Window groups | Not implemented | |
| Keyboard shortcuts | Not implemented | |

---

## Enhancement Specifications

### 1. Window Manager Enhancements

#### 1.1 Complete Window Manager API

```javascript
// window_manager.js

class Window_Manager {
    constructor(context, options = {}) {
        this.context = context;
        this.windows = new Map(); // id -> Window
        this.z_index_stack = []; // Window IDs in z-order
        this.active_window = null;

        // Configuration
        this.snap_threshold = options.snap_threshold || 20;
        this.dock_sizes = options.dock_sizes || {
            left: '50%',
            right: '50%',
            top: '50%',
            bottom: '50%'
        };
        this.tiling_gap = options.tiling_gap || 4;
        this.taskbar_height = options.taskbar_height || 0;
    }

    // Registration
    register(window) {}
    unregister(window) {}

    // Z-index management
    bring_to_front(window) {}
    send_to_back(window) {}
    get_z_order() {}

    // Window operations
    minimize(window) {}
    maximize(window) {}
    restore(window) {}
    close(window) {}
    close_all() {}

    // Positioning
    snap(window, options) {}
    dock(window, edge, options) {}
    undock(window) {}
    center(window) {}
    cascade() {}
    tile_horizontal() {}
    tile_vertical() {}
    tile_grid() {}

    // Groups
    create_group(windows) {}
    minimize_group(group) {}

    // State
    save_state() {}
    restore_state(state) {}

    // Events
    // 'window_open', 'window_close', 'window_focus', 'window_blur'
    // 'arrangement_change', 'state_change'
}
```

#### 1.2 Z-Index Stack Management

```javascript
class Window_Manager {
    constructor(context, options = {}) {
        // ...
        this._base_z_index = options.base_z_index || 1000;
        this._modal_z_index = options.modal_z_index || 10000;
    }

    bring_to_front(window) {
        const id = window.id || window;

        // Remove from current position
        const index = this.z_index_stack.indexOf(id);
        if (index > -1) {
            this.z_index_stack.splice(index, 1);
        }

        // Add to top
        this.z_index_stack.push(id);

        // Update z-indices
        this._update_z_indices();

        // Update active window
        this._set_active(id);

        this.raise('window_focus', { window_id: id });
    }

    send_to_back(window) {
        const id = window.id || window;

        const index = this.z_index_stack.indexOf(id);
        if (index > -1) {
            this.z_index_stack.splice(index, 1);
        }

        this.z_index_stack.unshift(id);
        this._update_z_indices();
    }

    _update_z_indices() {
        this.z_index_stack.forEach((id, index) => {
            const win = this.windows.get(id);
            if (win && win.dom && win.dom.el) {
                win.dom.el.style.zIndex = this._base_z_index + index;
            }
        });
    }

    _set_active(window_id) {
        if (this.active_window) {
            const prev = this.windows.get(this.active_window);
            if (prev) {
                prev.remove_class('active');
                prev.raise('blur');
            }
        }

        this.active_window = window_id;
        const win = this.windows.get(window_id);
        if (win) {
            win.add_class('active');
            win.raise('focus');
        }
    }

    cycle_windows(direction = 1) {
        if (this.z_index_stack.length < 2) return;

        if (direction > 0) {
            // Alt+Tab: bring back window to front
            const back = this.z_index_stack.shift();
            this.z_index_stack.push(back);
        } else {
            // Alt+Shift+Tab: send front to back
            const front = this.z_index_stack.pop();
            this.z_index_stack.unshift(front);
        }

        this._update_z_indices();
        this._set_active(this.z_index_stack[this.z_index_stack.length - 1]);
    }
}
```

### 2. Snap and Dock System

#### 2.1 Enhanced Snap Detection

```javascript
class Window_Manager {
    snap(window, options = {}) {
        const threshold = options.threshold || this.snap_threshold;
        const win_rect = window.bcr();
        const bounds = this._get_bounds();

        const snaps = [];

        // Check each edge
        const edges = ['left', 'right', 'top', 'bottom'];

        for (const edge of edges) {
            const distance = this._distance_to_edge(win_rect, bounds, edge);
            if (distance <= threshold) {
                snaps.push({ edge, distance });
            }
        }

        // Check corners
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

        for (const corner of corners) {
            const [v_edge, h_edge] = corner.split('-');
            const v_dist = this._distance_to_edge(win_rect, bounds, v_edge);
            const h_dist = this._distance_to_edge(win_rect, bounds, h_edge);

            if (v_dist <= threshold && h_dist <= threshold) {
                snaps.push({
                    corner,
                    distance: Math.max(v_dist, h_dist)
                });
            }
        }

        if (snaps.length === 0) return false;

        // Apply closest snap
        snaps.sort((a, b) => a.distance - b.distance);
        const snap = snaps[0];

        if (snap.corner) {
            this._snap_to_corner(window, snap.corner, bounds, options);
        } else {
            this._snap_to_edge(window, snap.edge, bounds, options);
        }

        return true;
    }

    _snap_to_edge(window, edge, bounds, options) {
        const win_rect = window.bcr();
        const size = win_rect[2]; // [width, height]

        switch (edge) {
            case 'left':
                window.ta[6] = bounds.left;
                break;
            case 'right':
                window.ta[6] = bounds.right - size[0];
                break;
            case 'top':
                window.ta[7] = bounds.top;
                break;
            case 'bottom':
                window.ta[7] = bounds.bottom - size[1];
                break;
        }
    }

    _snap_to_corner(window, corner, bounds, options) {
        const win_rect = window.bcr();
        const size = win_rect[2];

        switch (corner) {
            case 'top-left':
                window.ta[6] = bounds.left;
                window.ta[7] = bounds.top;
                break;
            case 'top-right':
                window.ta[6] = bounds.right - size[0];
                window.ta[7] = bounds.top;
                break;
            case 'bottom-left':
                window.ta[6] = bounds.left;
                window.ta[7] = bounds.bottom - size[1];
                break;
            case 'bottom-right':
                window.ta[6] = bounds.right - size[0];
                window.ta[7] = bounds.bottom - size[1];
                break;
        }
    }
}
```

#### 2.2 Dock System

```javascript
class Window_Manager {
    dock(window, edge, options = {}) {
        const bounds = this._get_bounds();
        const size = options.size || this.dock_sizes[edge];

        // Store pre-dock state
        window._pre_dock_state = {
            position: [window.ta[6], window.ta[7]],
            size: window.size,
            docked_edge: null
        };

        // Calculate dock position and size
        let new_pos, new_size;

        switch (edge) {
            case 'left':
                new_pos = [bounds.left, bounds.top];
                new_size = [this._parse_size(size, bounds.width), bounds.height];
                break;

            case 'right':
                const width = this._parse_size(size, bounds.width);
                new_pos = [bounds.right - width, bounds.top];
                new_size = [width, bounds.height];
                break;

            case 'top':
                new_pos = [bounds.left, bounds.top];
                new_size = [bounds.width, this._parse_size(size, bounds.height)];
                break;

            case 'bottom':
                const height = this._parse_size(size, bounds.height);
                new_pos = [bounds.left, bounds.bottom - height];
                new_size = [bounds.width, height];
                break;

            case 'fill':
                new_pos = [bounds.left, bounds.top];
                new_size = [bounds.width, bounds.height];
                break;
        }

        // Apply with animation
        window.add_class(`docked-${edge}`);
        window.dragable = (edge !== 'fill');

        window.glide_to_pos([
            new_pos[0] - parseInt(window.dom.attributes.style.left || 0),
            new_pos[1] - parseInt(window.dom.attributes.style.top || 0)
        ]).then(() => {
            window.size = new_size;
        });

        window._pre_dock_state.docked_edge = edge;

        this.raise('window_dock', {
            window_id: window.id,
            edge
        });
    }

    undock(window) {
        if (!window._pre_dock_state) return;

        const { position, size, docked_edge } = window._pre_dock_state;

        window.remove_class(`docked-${docked_edge}`);
        window.dragable = true;
        window.size = size;

        window.glide_to_pos([
            position[0] - parseInt(window.dom.attributes.style.left || 0),
            position[1] - parseInt(window.dom.attributes.style.top || 0)
        ]);

        window._pre_dock_state = null;

        this.raise('window_undock', { window_id: window.id });
    }

    _parse_size(size, total) {
        if (typeof size === 'number') return size;
        if (typeof size === 'string' && size.endsWith('%')) {
            return total * parseInt(size) / 100;
        }
        return total / 2;
    }
}
```

### 3. Tiling Layout System

#### 3.1 Tile Arrangements

```javascript
class Window_Manager {
    tile_horizontal() {
        const windows = this._get_visible_windows();
        if (windows.length === 0) return;

        const bounds = this._get_bounds();
        const gap = this.tiling_gap;
        const count = windows.length;

        const tile_width = (bounds.width - gap * (count + 1)) / count;

        windows.forEach((win, i) => {
            const x = bounds.left + gap + i * (tile_width + gap);
            const y = bounds.top + gap;
            const w = tile_width;
            const h = bounds.height - gap * 2;

            this._tile_window(win, x, y, w, h);
        });

        this.raise('arrangement_change', { type: 'tile_horizontal' });
    }

    tile_vertical() {
        const windows = this._get_visible_windows();
        if (windows.length === 0) return;

        const bounds = this._get_bounds();
        const gap = this.tiling_gap;
        const count = windows.length;

        const tile_height = (bounds.height - gap * (count + 1)) / count;

        windows.forEach((win, i) => {
            const x = bounds.left + gap;
            const y = bounds.top + gap + i * (tile_height + gap);
            const w = bounds.width - gap * 2;
            const h = tile_height;

            this._tile_window(win, x, y, w, h);
        });

        this.raise('arrangement_change', { type: 'tile_vertical' });
    }

    tile_grid() {
        const windows = this._get_visible_windows();
        if (windows.length === 0) return;

        const bounds = this._get_bounds();
        const gap = this.tiling_gap;
        const count = windows.length;

        // Calculate grid dimensions
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);

        const tile_width = (bounds.width - gap * (cols + 1)) / cols;
        const tile_height = (bounds.height - gap * (rows + 1)) / rows;

        windows.forEach((win, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const x = bounds.left + gap + col * (tile_width + gap);
            const y = bounds.top + gap + row * (tile_height + gap);

            this._tile_window(win, x, y, tile_width, tile_height);
        });

        this.raise('arrangement_change', { type: 'tile_grid' });
    }

    cascade() {
        const windows = this._get_visible_windows();
        if (windows.length === 0) return;

        const bounds = this._get_bounds();
        const offset = 30;
        const initial_width = Math.min(600, bounds.width * 0.6);
        const initial_height = Math.min(400, bounds.height * 0.6);

        windows.forEach((win, i) => {
            const x = bounds.left + offset * (i + 1);
            const y = bounds.top + offset * (i + 1);

            // Wrap if would go off screen
            const wrap_x = x + initial_width > bounds.right;
            const wrap_y = y + initial_height > bounds.bottom;

            const final_x = wrap_x ? bounds.left + offset : x;
            const final_y = wrap_y ? bounds.top + offset : y;

            this._tile_window(win, final_x, final_y, initial_width, initial_height);
        });

        this.raise('arrangement_change', { type: 'cascade' });
    }

    _tile_window(win, x, y, w, h) {
        // Clear dock state
        win._pre_dock_state = null;
        ['left', 'right', 'top', 'bottom', 'fill'].forEach(edge => {
            win.remove_class(`docked-${edge}`);
        });

        // Store pre-tile state if not already stored
        if (!win._pre_tile_state) {
            win._pre_tile_state = {
                position: [win.ta[6], win.ta[7]],
                size: win.size
            };
        }

        win.dragable = true;

        // Animate to position
        const ltpos = [
            parseInt(win.dom.attributes.style.left || 0),
            parseInt(win.dom.attributes.style.top || 0)
        ];

        setTimeout(() => {
            win.size = [w, h];
        }, 17);

        win.glide_to_pos([x - ltpos[0], y - ltpos[1]]);
    }

    restore_all() {
        for (const win of this.windows.values()) {
            if (win._pre_tile_state) {
                const { position, size } = win._pre_tile_state;
                win.size = size;

                const ltpos = [
                    parseInt(win.dom.attributes.style.left || 0),
                    parseInt(win.dom.attributes.style.top || 0)
                ];

                win.glide_to_pos([
                    position[0] - ltpos[0],
                    position[1] - ltpos[1]
                ]);

                win._pre_tile_state = null;
            }
        }

        this.raise('arrangement_change', { type: 'restore' });
    }

    _get_visible_windows() {
        return Array.from(this.windows.values()).filter(win => {
            return !win.has_class('minimized') &&
                   win.dom && win.dom.el &&
                   win.dom.el.style.display !== 'none';
        });
    }
}
```

### 4. Keyboard Navigation

#### 4.1 Global Shortcuts

```javascript
class Window_Manager {
    _setup_keyboard_shortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt+Tab: Cycle windows
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycle_windows(e.shiftKey ? -1 : 1);
            }

            // Alt+F4: Close active window
            if (e.altKey && e.key === 'F4') {
                e.preventDefault();
                if (this.active_window) {
                    this.close(this.windows.get(this.active_window));
                }
            }

            // Win+Arrow: Snap/dock
            if (e.metaKey || e.key === 'Meta') {
                const win = this.windows.get(this.active_window);
                if (!win) return;

                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.dock(win, 'left');
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.dock(win, 'right');
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.maximize(win);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        if (win.has_class('maximized')) {
                            this.restore(win);
                        } else {
                            this.minimize(win);
                        }
                        break;
                }
            }
        });
    }
}
```

#### 4.2 Window-Level Shortcuts

```javascript
class Window extends Control {
    activate() {
        // ...existing code...

        this._setup_window_shortcuts();
    }

    _setup_window_shortcuts() {
        this.on('keydown', (e) => {
            // Escape: Close window (if configured)
            if (e.key === 'Escape' && this.close_on_escape) {
                this.close();
            }

            // Enter: Default action (if configured)
            if (e.key === 'Enter' && this.default_button) {
                this.default_button.click();
            }
        });
    }
}
```

### 5. State Persistence

```javascript
class Window_Manager {
    save_state() {
        const state = {
            windows: [],
            z_order: [...this.z_index_stack],
            active: this.active_window
        };

        for (const [id, win] of this.windows) {
            state.windows.push({
                id,
                position: [win.ta[6], win.ta[7]],
                size: win.size,
                minimized: win.has_class('minimized'),
                maximized: win.has_class('maximized'),
                docked: win._pre_dock_state?.docked_edge || null
            });
        }

        return state;
    }

    restore_state(state) {
        for (const win_state of state.windows) {
            const win = this.windows.get(win_state.id);
            if (!win) continue;

            // Restore position and size
            win.ta[6] = win_state.position[0];
            win.ta[7] = win_state.position[1];
            win.size = win_state.size;

            // Restore state
            if (win_state.docked) {
                this.dock(win, win_state.docked);
            } else if (win_state.maximized) {
                this.maximize(win);
            } else if (win_state.minimized) {
                this.minimize(win);
            }
        }

        // Restore z-order
        this.z_index_stack = state.z_order.filter(id => this.windows.has(id));
        this._update_z_indices();

        // Restore active
        if (state.active && this.windows.has(state.active)) {
            this._set_active(state.active);
        }
    }
}
```

---

## CSS Enhancements

```css
/* Window states */
.window.active {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.window:not(.active) {
    opacity: 0.95;
}

.window.active .title.bar {
    background-image: linear-gradient(to right, #0D4F8B, #3fb0d9);
}

.window:not(.active) .title.bar {
    background-image: linear-gradient(to right, #4a4a4a, #6a6a6a);
}

/* Dock states */
.window.docked-left,
.window.docked-right,
.window.docked-top,
.window.docked-bottom {
    border-radius: 0;
    transition: none;
}

/* Snap preview */
.window-snap-preview {
    position: absolute;
    background: rgba(0, 102, 204, 0.2);
    border: 2px dashed rgba(0, 102, 204, 0.5);
    pointer-events: none;
    z-index: 9999;
}

/* Drag ghost */
.window.dragging {
    opacity: 0.8;
    cursor: grabbing;
}

/* Focus ring for accessibility */
.window:focus-within .title.bar {
    outline: 2px solid var(--jsgui-focus-color, #0066cc);
    outline-offset: -2px;
}
```

---

## Testing Strategy

### Unit Tests

```javascript
describe('Window_Manager', () => {
    describe('z-index management', () => {
        it('should bring window to front', () => {
            const manager = new Window_Manager(context);
            const win1 = create_window('win1');
            const win2 = create_window('win2');

            manager.register(win1);
            manager.register(win2);

            manager.bring_to_front(win1);

            expect(manager.z_index_stack[manager.z_index_stack.length - 1])
                .toBe('win1');
        });

        it('should cycle windows on Alt+Tab', () => {
            // ...
        });
    });

    describe('tiling', () => {
        it('should tile windows horizontally', () => {
            const manager = new Window_Manager(context);
            // Add windows
            manager.tile_horizontal();
            // Assert positions
        });

        it('should tile windows in grid', () => {
            // ...
        });
    });

    describe('dock', () => {
        it('should dock window to left edge', () => {
            // ...
        });

        it('should restore window from dock', () => {
            // ...
        });
    });
});
```

### E2E Tests

```javascript
describe('Window management E2E', () => {
    it('should snap window when dragged near edge', async () => {
        const page = await browser.newPage();
        await page.goto('/examples/windows.html');

        // Drag window to left edge
        await page.mouse.move(200, 50); // Title bar
        await page.mouse.down();
        await page.mouse.move(10, 200);
        await page.mouse.up();

        // Check if snapped
        const win = await page.$('.window');
        const box = await win.boundingBox();
        expect(box.x).toBe(0);
    });
});
```

---

## Success Criteria

1. **Z-index never conflicts** - Windows always stack correctly
2. **Snap feels natural** - 20px threshold, smooth animation
3. **Dock covers edge** - Full height/width as configured
4. **Tiling is responsive** - Adjusts to container resize
5. **State persists** - Can save/restore window arrangement
6. **Keyboard accessible** - All operations via keyboard
7. **Performance** - 60fps during drag operations
