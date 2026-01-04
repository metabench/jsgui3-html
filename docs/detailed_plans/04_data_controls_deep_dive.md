# Data Controls Deep Dive - Detailed Implementation Plan

## Objective

Enhance data-centric controls (Data_Table, Virtual_List, Tree_Table, etc.) with advanced features for real-world application needs: large dataset handling, complex interactions, and optimal performance.

## Current State Analysis

### Existing Data Controls

| Control | File | Features | Gaps |
|---------|------|----------|------|
| Data_Table | `1-standard/4-data/data_table.js` | Sort, filter, pagination | Virtualization, column resize |
| Virtual_List | `1-standard/4-data/virtual_list.js` | Windowed rendering | Variable height, horizontal |
| Virtual_Grid | `1-standard/4-data/virtual_grid.js` | Grid virtualization | Sparse data |
| Tree_Table | `1-standard/4-data/tree_table.js` | Tree + columns | Virtualization |
| Reorderable_List | `1-standard/5-ui/reorderable_list.js` | Drag reorder | Touch support |
| Data_Grid | `connected/data-grid.js` | Legacy grid | Modern API needed |

---

## Enhancement Specifications

### 1. Data_Table Enhancements

#### 1.1 Column Resizing

**Spec:**

```javascript
// Column configuration with resize
const columns = [
    {
        key: 'name',
        label: 'Name',
        width: 200,
        min_width: 100,
        max_width: 400,
        resizable: true
    },
    {
        key: 'email',
        label: 'Email',
        width: 'auto', // Flex to fill
        resizable: true
    },
    {
        key: 'actions',
        label: '',
        width: 80,
        resizable: false
    }
];
```

**Implementation:**

```javascript
// In Data_Table class

_create_resize_handle(column_index) {
    const handle = new Control({ context: this.context });
    handle.add_class('column-resize-handle');

    resizable(handle, {
        resize_mode: 'horizontal',
        on_resize: (delta_x) => {
            this._resize_column(column_index, delta_x);
        },
        on_resize_end: () => {
            this.raise('column_resize', {
                column_index,
                width: this.columns[column_index].width
            });
        }
    });

    return handle;
}

_resize_column(index, delta_x) {
    const col = this.columns[index];
    const new_width = Math.max(
        col.min_width || 50,
        Math.min(col.max_width || Infinity, col.width + delta_x)
    );
    col.width = new_width;
    this._update_column_widths();
}
```

**CSS:**

```css
.data-table .column-resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    background: transparent;
}

.data-table .column-resize-handle:hover,
.data-table .column-resize-handle.resizing {
    background: var(--jsgui-resize-handle-color, rgba(0, 102, 204, 0.3));
}
```

#### 1.2 Row Selection

**Spec:**

```javascript
const table = new Data_Table({
    context,
    columns,
    rows: data,
    selection: {
        mode: 'multi', // 'none' | 'single' | 'multi'
        preserve_on_filter: true,
        checkbox_column: true
    }
});

// Selection API
table.selected_ids; // Set of selected row IDs
table.select(id);
table.deselect(id);
table.toggle_select(id);
table.select_all();
table.deselect_all();

// Events
table.on('selection_change', ({ selected_ids, added, removed }) => {
    console.log(`Selected: ${selected_ids.size} rows`);
});
```

**Implementation:**

```javascript
class Data_Table extends Control {
    constructor(spec) {
        super(spec);
        // ...existing code...

        this._selection = new Set();
        this._selection_mode = spec.selection?.mode || 'none';
        this._preserve_selection = spec.selection?.preserve_on_filter ?? true;
        this._show_checkbox = spec.selection?.checkbox_column ?? false;
    }

    get selected_ids() {
        return new Set(this._selection);
    }

    select(id, options = {}) {
        if (this._selection_mode === 'none') return;
        if (this._selection_mode === 'single') {
            this._selection.clear();
        }
        this._selection.add(id);
        this._update_selection_ui(id, true);
        if (!options.silent) {
            this._raise_selection_change([id], []);
        }
    }

    deselect(id, options = {}) {
        this._selection.delete(id);
        this._update_selection_ui(id, false);
        if (!options.silent) {
            this._raise_selection_change([], [id]);
        }
    }

    toggle_select(id) {
        if (this._selection.has(id)) {
            this.deselect(id);
        } else {
            this.select(id);
        }
    }

    select_all() {
        const added = [];
        for (const row of this._visible_rows) {
            if (!this._selection.has(row.id)) {
                this._selection.add(row.id);
                added.push(row.id);
            }
        }
        this._update_all_selection_ui();
        this._raise_selection_change(added, []);
    }

    deselect_all() {
        const removed = [...this._selection];
        this._selection.clear();
        this._update_all_selection_ui();
        this._raise_selection_change([], removed);
    }

    _raise_selection_change(added, removed) {
        this.raise('selection_change', {
            selected_ids: this.selected_ids,
            added,
            removed
        });
    }

    _update_selection_ui(id, selected) {
        const row_el = this._get_row_element(id);
        if (!row_el) return;

        if (selected) {
            row_el.classList.add('selected');
            row_el.setAttribute('aria-selected', 'true');
        } else {
            row_el.classList.remove('selected');
            row_el.setAttribute('aria-selected', 'false');
        }

        if (this._show_checkbox) {
            const checkbox = row_el.querySelector('.row-checkbox');
            if (checkbox) checkbox.checked = selected;
        }
    }
}
```

#### 1.3 Column Reordering

**Spec:**

```javascript
const table = new Data_Table({
    context,
    columns,
    rows: data,
    column_reorder: true
});

table.on('column_reorder', ({ column_order }) => {
    // Save user preference
    localStorage.setItem('table_column_order', JSON.stringify(column_order));
});
```

#### 1.4 Cell Editing

**Spec:**

```javascript
const columns = [
    {
        key: 'name',
        label: 'Name',
        editable: true,
        editor: 'text' // 'text' | 'number' | 'select' | 'date' | custom
    },
    {
        key: 'status',
        label: 'Status',
        editable: true,
        editor: 'select',
        editor_options: {
            items: ['Active', 'Inactive', 'Pending']
        }
    },
    {
        key: 'amount',
        label: 'Amount',
        editable: true,
        editor: 'number',
        editor_options: {
            min: 0,
            max: 10000,
            step: 0.01
        }
    }
];

table.on('cell_edit', ({ row_id, column_key, old_value, new_value }) => {
    // Validate and persist
    await api.update_row(row_id, { [column_key]: new_value });
});
```

---

### 2. Virtual_List Enhancements

#### 2.1 Variable Height Items

**Spec:**

```javascript
const list = new Virtual_List({
    context,
    items: data,
    item_renderer: render_item,
    item_height: 'dynamic', // or number for fixed
    estimate_height: 60, // Initial estimate for dynamic
    measure_on_render: true
});
```

**Implementation:**

```javascript
class Virtual_List extends Control {
    constructor(spec) {
        super(spec);

        this._items = spec.items || [];
        this._item_renderer = spec.item_renderer;
        this._fixed_height = typeof spec.item_height === 'number';
        this._item_height = spec.item_height || 50;
        this._estimate_height = spec.estimate_height || 50;

        // Height cache for variable height
        this._height_cache = new Map();

        // Visible range
        this._start_index = 0;
        this._end_index = 0;
        this._scroll_top = 0;
    }

    _calculate_visible_range() {
        const container_height = this._container.offsetHeight;

        if (this._fixed_height) {
            // Simple calculation for fixed height
            this._start_index = Math.floor(this._scroll_top / this._item_height);
            this._end_index = Math.min(
                this._items.length,
                Math.ceil((this._scroll_top + container_height) / this._item_height) + 1
            );
        } else {
            // Binary search for variable height
            this._start_index = this._find_start_index(this._scroll_top);
            this._end_index = this._find_end_index(
                this._scroll_top + container_height,
                this._start_index
            );
        }

        // Overscan for smoother scrolling
        const overscan = 3;
        this._start_index = Math.max(0, this._start_index - overscan);
        this._end_index = Math.min(this._items.length, this._end_index + overscan);
    }

    _get_item_height(index) {
        if (this._fixed_height) return this._item_height;
        return this._height_cache.get(index) || this._estimate_height;
    }

    _get_offset_top(index) {
        if (this._fixed_height) {
            return index * this._item_height;
        }

        let offset = 0;
        for (let i = 0; i < index; i++) {
            offset += this._get_item_height(i);
        }
        return offset;
    }

    _measure_item(index, element) {
        if (!this._fixed_height && element) {
            const height = element.offsetHeight;
            if (height !== this._height_cache.get(index)) {
                this._height_cache.set(index, height);
                this._update_total_height();
            }
        }
    }

    _find_start_index(scroll_top) {
        // Binary search through cumulative heights
        let low = 0;
        let high = this._items.length - 1;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const offset = this._get_offset_top(mid);

            if (offset < scroll_top) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return Math.max(0, low - 1);
    }
}
```

#### 2.2 Horizontal Scrolling

**Spec:**

```javascript
const list = new Virtual_List({
    context,
    items: data,
    direction: 'horizontal', // 'vertical' | 'horizontal'
    item_width: 200
});
```

#### 2.3 Keyboard Navigation

**Spec:**

```javascript
const list = new Virtual_List({
    context,
    items: data,
    keyboard_navigation: true,
    selection_follows_focus: true
});

// Keyboard shortcuts:
// Arrow Up/Down: Move focus
// Page Up/Down: Jump by page
// Home/End: Jump to start/end
// Enter/Space: Select focused item
```

---

### 3. Tree_Table Enhancements

#### 3.1 Virtualized Tree

**Spec:**

```javascript
const tree_table = new Tree_Table({
    context,
    columns: [
        { key: 'name', label: 'Name', tree_column: true },
        { key: 'size', label: 'Size' },
        { key: 'modified', label: 'Modified' }
    ],
    root_items: data,
    virtualized: true,
    item_height: 32
});
```

**Implementation:**

The virtualized tree flattens visible nodes into a list:

```javascript
class Tree_Table extends Control {
    _flatten_visible_nodes() {
        const flat = [];
        const expand = (nodes, depth) => {
            for (const node of nodes) {
                flat.push({ node, depth });
                if (this._expanded_ids.has(node.id) && node.children) {
                    expand(node.children, depth + 1);
                }
            }
        };
        expand(this._root_items, 0);
        return flat;
    }

    _render_visible_rows() {
        const flat = this._flatten_visible_nodes();
        // Use Virtual_List rendering strategy on flat array
        // ...
    }
}
```

#### 3.2 Async Children

**Spec:**

```javascript
const tree_table = new Tree_Table({
    context,
    columns,
    root_items: initial_data,
    load_children: async (parent_id) => {
        const children = await api.get_children(parent_id);
        return children;
    }
});
```

---

### 4. Data Grid Modernization

#### 4.1 Modern API Design

**New API:**

```javascript
const grid = new Data_Grid({
    context,

    // Data source (supports async)
    data_source: {
        type: 'array', // 'array' | 'async' | 'infinite'
        data: rows,    // For array type
        // For async:
        // fetch: async ({ page, page_size, sort, filters }) => ({ rows, total })
    },

    // Column definitions
    columns: [
        {
            key: 'id',
            label: 'ID',
            width: 80,
            sortable: true,
            filterable: false
        },
        {
            key: 'name',
            label: 'Name',
            width: 200,
            sortable: true,
            filterable: true,
            filter_type: 'text',
            editable: true
        },
        {
            key: 'status',
            label: 'Status',
            width: 120,
            sortable: true,
            filterable: true,
            filter_type: 'select',
            filter_options: ['Active', 'Inactive'],
            cell_renderer: (value, row) => {
                const badge = new Badge({ status: value.toLowerCase() });
                badge.text = value;
                return badge;
            }
        }
    ],

    // Features
    features: {
        sorting: true,
        multi_sort: false,
        filtering: true,
        pagination: true,
        selection: 'multi',
        column_resize: true,
        column_reorder: true,
        row_reorder: false,
        virtualization: true,
        grouping: false,
        export: ['csv', 'json']
    },

    // Pagination
    pagination: {
        page_size: 50,
        page_sizes: [25, 50, 100, 'all']
    }
});

// Events
grid.on('sort_change', ({ sort_state }) => {});
grid.on('filter_change', ({ filters }) => {});
grid.on('selection_change', ({ selected_ids }) => {});
grid.on('cell_edit', ({ row_id, column_key, value }) => {});
grid.on('row_click', ({ row_id, row_data }) => {});
grid.on('row_double_click', ({ row_id, row_data }) => {});
```

#### 4.2 Migration from Legacy

```javascript
// Legacy API
const old_grid = new Data_Grid({
    columns: [...],
    data: [...]
});

// Migration shim
class Data_Grid_Legacy_Adapter {
    constructor(legacy_spec) {
        console.warn('Data_Grid: Using legacy API. Please migrate to modern API.');

        return new Data_Grid({
            data_source: { type: 'array', data: legacy_spec.data },
            columns: this._convert_columns(legacy_spec.columns),
            features: this._infer_features(legacy_spec)
        });
    }

    _convert_columns(legacy_columns) {
        return legacy_columns.map(col => ({
            key: col.field || col.key,
            label: col.title || col.label,
            width: col.width,
            sortable: col.sortable !== false
        }));
    }
}
```

---

## Performance Optimization

### Render Batching

```javascript
class Virtual_List extends Control {
    _schedule_render() {
        if (this._render_scheduled) return;
        this._render_scheduled = true;

        requestAnimationFrame(() => {
            this._render_scheduled = false;
            this._render_visible_items();
        });
    }

    _render_visible_items() {
        const fragment = document.createDocumentFragment();
        const items_to_render = [];

        for (let i = this._start_index; i < this._end_index; i++) {
            const item = this._items[i];
            const existing = this._rendered_items.get(item.id);

            if (existing) {
                // Reuse existing DOM node
                this._update_item_position(existing, i);
            } else {
                // Create new item
                items_to_render.push({ item, index: i });
            }
        }

        // Batch DOM operations
        for (const { item, index } of items_to_render) {
            const el = this._create_item_element(item, index);
            fragment.appendChild(el);
            this._rendered_items.set(item.id, el);
        }

        this._content.appendChild(fragment);

        // Remove off-screen items
        this._cleanup_offscreen_items();
    }
}
```

### Memory Management

```javascript
class Virtual_List extends Control {
    constructor(spec) {
        super(spec);

        // Pool of reusable item elements
        this._item_pool = [];
        this._max_pool_size = 100;
    }

    _recycle_item(element) {
        if (this._item_pool.length < this._max_pool_size) {
            // Clear content and return to pool
            element.innerHTML = '';
            element.className = 'virtual-list-item';
            this._item_pool.push(element);
        } else {
            element.remove();
        }
    }

    _get_pooled_item() {
        return this._item_pool.pop() || this._create_base_item();
    }
}
```

---

## Testing Strategy

### Performance Benchmarks

```javascript
// test/performance/virtual_list_benchmark.js

describe('Virtual_List performance', () => {
    it('should render 10,000 items under 100ms', async () => {
        const items = Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            text: `Item ${i}`
        }));

        const start = performance.now();

        const list = new Virtual_List({
            context,
            items,
            item_height: 40,
            item_renderer: (item) => new Text_Item({ text: item.text })
        });

        document.body.appendChild(list.dom.el);
        list.activate();

        const elapsed = performance.now() - start;
        expect(elapsed).toBeLessThan(100);
    });

    it('should maintain 60fps during scroll', async () => {
        // Setup list with many items
        // Simulate scroll events
        // Measure frame times
    });
});
```

### Integration Tests

```javascript
// test/e2e/data_table.test.js

describe('Data_Table', () => {
    it('should sort on column header click', async () => {
        const page = await browser.newPage();
        await page.goto('/examples/data_table.html');

        await page.click('.data-table th[data-column="name"]');

        const first_cell = await page.$eval(
            '.data-table tbody tr:first-child td:first-child',
            el => el.textContent
        );

        expect(first_cell).toBe('Aaron'); // First alphabetically
    });

    it('should filter rows', async () => {
        await page.type('.data-table .filter-input[data-column="status"]', 'active');

        const row_count = await page.$$eval('.data-table tbody tr', rows => rows.length);
        expect(row_count).toBeLessThan(initial_count);
    });
});
```

---

## Documentation Requirements

### API Reference

For each enhanced control:
- Full constructor options
- Properties (getters/setters)
- Methods
- Events
- Examples

### Migration Guide

`docs/migrations/data_grid_v2.md`:
- Old vs new API comparison
- Automatic migration script
- Manual migration steps
- Breaking changes

### Performance Guide

`docs/performance/data_controls.md`:
- When to use virtualization
- Optimizing renderers
- Memory management
- Profiling tips

---

## Success Criteria

1. **Data_Table column resize** - Columns resize smoothly without layout shift
2. **Virtual_List 60fps** - Maintains frame rate with 100k items
3. **Tree_Table virtualized** - Handles 10k+ nodes with expand/collapse
4. **Data_Grid modern API** - Clear, consistent, well-documented API
5. **Memory efficiency** - No memory leaks on long sessions
6. **Full test coverage** - E2E tests for all interactive features
