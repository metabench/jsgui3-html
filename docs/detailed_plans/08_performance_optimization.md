# Performance Optimization Guide - Detailed Implementation Plan

## Objective

Establish performance baselines, identify optimization opportunities, and implement improvements for rendering speed, memory efficiency, and responsiveness across jsgui3-html controls.

## Performance Goals

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial render (100 items) | < 50ms | Time to first paint |
| Virtual list scroll (10k items) | 60fps | Frame rate during scroll |
| Control instantiation | < 1ms | Single control creation |
| Memory per control | < 10KB | Heap snapshot |
| Event latency | < 16ms | Click to visual response |

---

## Performance Audit

### Profiling Methodology

```javascript
// performance/profiler.js

class Control_Profiler {
    constructor() {
        this.measurements = new Map();
    }

    /**
     * Measure control instantiation time.
     */
    measure_instantiation(Control_Class, spec, iterations = 100) {
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            const control = new Control_Class({ ...spec, context: this.context });
            const end = performance.now();
            times.push(end - start);

            // Cleanup
            control.remove?.();
        }

        return {
            min: Math.min(...times),
            max: Math.max(...times),
            avg: times.reduce((a, b) => a + b) / times.length,
            median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
            p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
        };
    }

    /**
     * Measure render time for a list of items.
     */
    async measure_list_render(Control_Class, items, options = {}) {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const start = performance.now();

        const list = new Control_Class({
            context: this.context,
            items,
            ...options
        });

        container.appendChild(list.dom.el);
        list.activate();

        // Wait for render
        await new Promise(r => requestAnimationFrame(r));

        const end = performance.now();

        // Cleanup
        container.remove();

        return {
            time: end - start,
            items_per_second: items.length / ((end - start) / 1000)
        };
    }

    /**
     * Measure scroll performance.
     */
    async measure_scroll_performance(list_control, duration_ms = 2000) {
        const frames = [];
        let last_time = performance.now();

        const measure_frame = () => {
            const now = performance.now();
            frames.push(now - last_time);
            last_time = now;
        };

        // Start measuring
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'frame') {
                    frames.push(entry.duration);
                }
            }
        });

        // Simulate scroll
        const el = list_control.dom.el;
        const scroll_height = el.scrollHeight;
        const start = performance.now();

        const scroll_step = () => {
            if (performance.now() - start > duration_ms) {
                return this._analyze_frames(frames);
            }

            el.scrollTop += 50;
            measure_frame();
            requestAnimationFrame(scroll_step);
        };

        requestAnimationFrame(scroll_step);
    }

    _analyze_frames(frames) {
        const fps_values = frames.map(f => 1000 / f);

        return {
            avg_fps: fps_values.reduce((a, b) => a + b) / fps_values.length,
            min_fps: Math.min(...fps_values),
            max_fps: Math.max(...fps_values),
            dropped_frames: frames.filter(f => f > 16.67).length,
            jank_events: frames.filter(f => f > 50).length
        };
    }

    /**
     * Measure memory usage.
     */
    async measure_memory(setup_fn, teardown_fn) {
        // Force GC if available
        if (global.gc) global.gc();

        const before = performance.memory?.usedJSHeapSize || 0;

        const result = await setup_fn();

        // Force layout
        document.body.offsetHeight;

        const during = performance.memory?.usedJSHeapSize || 0;

        await teardown_fn?.(result);

        // Force GC
        if (global.gc) global.gc();

        const after = performance.memory?.usedJSHeapSize || 0;

        return {
            allocated: during - before,
            retained: after - before,
            freed: during - after
        };
    }
}

module.exports = { Control_Profiler };
```

### Benchmark Suite

```javascript
// performance/benchmarks.js

const benchmarks = {
    'Button instantiation': async (profiler) => {
        return profiler.measure_instantiation(Button, {});
    },

    'Text_Input instantiation': async (profiler) => {
        return profiler.measure_instantiation(Text_Input, {
            placeholder: 'Enter text'
        });
    },

    'List render (100 items)': async (profiler) => {
        const items = Array.from({ length: 100 }, (_, i) => ({
            id: i,
            text: `Item ${i}`
        }));

        return profiler.measure_list_render(List, items);
    },

    'List render (1000 items)': async (profiler) => {
        const items = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            text: `Item ${i}`
        }));

        return profiler.measure_list_render(List, items);
    },

    'Virtual_List render (10000 items)': async (profiler) => {
        const items = Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            text: `Item ${i}`
        }));

        return profiler.measure_list_render(Virtual_List, items, {
            item_height: 40
        });
    },

    'Data_Table render (1000 rows)': async (profiler) => {
        const rows = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Name ${i}`,
            email: `email${i}@example.com`,
            status: i % 2 === 0 ? 'Active' : 'Inactive'
        }));

        return profiler.measure_list_render(Data_Table, rows, {
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'status', label: 'Status' }
            ]
        });
    },

    'Tree render (500 nodes, 3 levels)': async (profiler) => {
        const generate_tree = (depth, count) => {
            if (depth === 0) return [];
            return Array.from({ length: count }, (_, i) => ({
                id: `${depth}-${i}`,
                label: `Node ${depth}-${i}`,
                children: generate_tree(depth - 1, Math.floor(count / 2))
            }));
        };

        return profiler.measure_list_render(Tree, generate_tree(3, 10));
    },

    'Window instantiation': async (profiler) => {
        return profiler.measure_instantiation(Window, {
            title: 'Test Window'
        });
    },

    'Form_Container with 10 fields': async (profiler) => {
        const fields = Array.from({ length: 10 }, (_, i) => ({
            name: `field_${i}`,
            label: `Field ${i}`,
            type: 'text'
        }));

        return profiler.measure_instantiation(Form_Container, { fields });
    }
};

async function run_benchmarks(profiler) {
    const results = {};

    for (const [name, benchmark] of Object.entries(benchmarks)) {
        console.log(`Running: ${name}`);
        results[name] = await benchmark(profiler);
    }

    return results;
}

module.exports = { benchmarks, run_benchmarks };
```

---

## Optimization Strategies

### 1. DOM Operation Batching

**Problem:** Multiple DOM operations cause layout thrashing.

**Solution:**

```javascript
// utils/dom_batch.js

class DOM_Batch {
    constructor() {
        this._read_queue = [];
        this._write_queue = [];
        this._scheduled = false;
    }

    read(fn) {
        this._read_queue.push(fn);
        this._schedule();
    }

    write(fn) {
        this._write_queue.push(fn);
        this._schedule();
    }

    _schedule() {
        if (this._scheduled) return;
        this._scheduled = true;

        requestAnimationFrame(() => {
            // Execute all reads first
            for (const fn of this._read_queue) {
                fn();
            }
            this._read_queue = [];

            // Then all writes
            for (const fn of this._write_queue) {
                fn();
            }
            this._write_queue = [];

            this._scheduled = false;
        });
    }
}

const dom_batch = new DOM_Batch();

// Usage in controls
class Optimized_List extends Control {
    _update_item(index, data) {
        dom_batch.read(() => {
            const el = this._items[index].dom.el;
            const rect = el.getBoundingClientRect();
            // ... read operations
        });

        dom_batch.write(() => {
            const el = this._items[index].dom.el;
            el.textContent = data.text;
            // ... write operations
        });
    }
}
```

### 2. Event Delegation

**Problem:** Too many event listeners on individual items.

**Solution:**

```javascript
class Delegated_List extends Control {
    activate() {
        super.activate();

        // Single listener on container instead of per-item
        this.dom.el.addEventListener('click', (e) => {
            const item = e.target.closest('.list-item');
            if (!item) return;

            const index = parseInt(item.dataset.index);
            this._handle_item_click(index, e);
        });

        this.dom.el.addEventListener('keydown', (e) => {
            const item = e.target.closest('.list-item');
            if (!item) return;

            const index = parseInt(item.dataset.index);
            this._handle_item_keydown(index, e);
        });
    }

    _render_items() {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < this._items.length; i++) {
            const el = document.createElement('div');
            el.className = 'list-item';
            el.dataset.index = i;
            el.textContent = this._items[i].text;
            fragment.appendChild(el);
        }

        this.dom.el.appendChild(fragment);
    }
}
```

### 3. Lazy Initialization

**Problem:** Controls initialize everything upfront even if not needed.

**Solution:**

```javascript
class Lazy_Window extends Control {
    constructor(spec) {
        super(spec);

        // Don't create buttons until needed
        this._buttons_created = false;
    }

    _ensure_buttons() {
        if (this._buttons_created) return;

        this.btn_minimize = new Button({ context: this.context });
        this.btn_maximize = new Button({ context: this.context });
        this.btn_close = new Button({ context: this.context });

        this.title_bar.add(this.btn_minimize);
        this.title_bar.add(this.btn_maximize);
        this.title_bar.add(this.btn_close);

        this._buttons_created = true;
    }

    minimize() {
        this._ensure_buttons();
        // ... minimize logic
    }
}
```

### 4. Object Pooling

**Problem:** Frequent object creation/destruction causes GC pressure.

**Solution:**

```javascript
// utils/object_pool.js

class Object_Pool {
    constructor(factory, reset, initial_size = 10) {
        this._factory = factory;
        this._reset = reset;
        this._pool = [];

        // Pre-populate
        for (let i = 0; i < initial_size; i++) {
            this._pool.push(factory());
        }
    }

    acquire() {
        if (this._pool.length > 0) {
            return this._pool.pop();
        }
        return this._factory();
    }

    release(obj) {
        this._reset(obj);
        this._pool.push(obj);
    }

    get size() {
        return this._pool.length;
    }
}

// Usage in Virtual_List
class Virtual_List extends Control {
    constructor(spec) {
        super(spec);

        this._item_pool = new Object_Pool(
            () => this._create_item_element(),
            (el) => {
                el.textContent = '';
                el.className = 'virtual-list-item';
            },
            50
        );
    }

    _render_visible_items() {
        // Recycle items that scrolled out
        for (const [id, el] of this._rendered.entries()) {
            if (!this._is_visible(id)) {
                this._item_pool.release(el);
                this._rendered.delete(id);
            }
        }

        // Render new items from pool
        for (let i = this._start; i < this._end; i++) {
            if (!this._rendered.has(i)) {
                const el = this._item_pool.acquire();
                this._update_item_element(el, this._items[i]);
                this._rendered.set(i, el);
            }
        }
    }
}
```

### 5. Debouncing and Throttling

**Problem:** High-frequency events cause performance issues.

**Solution:**

```javascript
// utils/timing.js

function debounce(fn, delay) {
    let timer = null;

    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function throttle(fn, limit) {
    let last_call = 0;

    return function(...args) {
        const now = Date.now();
        if (now - last_call >= limit) {
            last_call = now;
            fn.apply(this, args);
        }
    };
}

// Usage
class Search_Input extends Text_Input {
    constructor(spec) {
        super(spec);

        // Debounce search
        this._do_search = debounce((query) => {
            this.raise('search', { query });
        }, 300);

        this.on('input', ({ value }) => {
            this._do_search(value);
        });
    }
}

class Scroll_View extends Control {
    activate() {
        super.activate();

        // Throttle scroll handling
        this._on_scroll = throttle(() => {
            this._update_visible_items();
        }, 16); // ~60fps

        this.dom.el.addEventListener('scroll', this._on_scroll);
    }
}
```

### 6. Memoization

**Problem:** Expensive computations repeated unnecessarily.

**Solution:**

```javascript
// utils/memoize.js

function memoize(fn, key_fn = (...args) => JSON.stringify(args)) {
    const cache = new Map();

    return function(...args) {
        const key = key_fn(...args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Usage
class Tree_Table extends Control {
    constructor(spec) {
        super(spec);

        // Memoize expensive flattening
        this._flatten_nodes = memoize(
            (nodes, expanded) => this._do_flatten(nodes, expanded),
            (nodes, expanded) => `${nodes.length}-${[...expanded].join(',')}`
        );
    }

    _do_flatten(nodes, expanded) {
        // Expensive recursive operation
        const flat = [];
        // ...
        return flat;
    }

    render() {
        const flat = this._flatten_nodes(this._nodes, this._expanded_ids);
        // Use flat array
    }
}
```

### 7. Web Workers for Heavy Computation

**Problem:** Heavy computation blocks the main thread.

**Solution:**

```javascript
// workers/sort_worker.js
self.onmessage = (e) => {
    const { rows, sort_key, direction } = e.data;

    const sorted = [...rows].sort((a, b) => {
        const val_a = a[sort_key];
        const val_b = b[sort_key];

        if (val_a < val_b) return direction === 'asc' ? -1 : 1;
        if (val_a > val_b) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    self.postMessage({ sorted });
};

// Data_Table using worker
class Data_Table extends Control {
    constructor(spec) {
        super(spec);

        this._sort_worker = new Worker('workers/sort_worker.js');
        this._sort_worker.onmessage = (e) => {
            this._rows = e.data.sorted;
            this._render_rows();
        };
    }

    async sort(column_key, direction) {
        if (this._rows.length > 1000) {
            // Use worker for large datasets
            this._sort_worker.postMessage({
                rows: this._rows,
                sort_key: column_key,
                direction
            });
        } else {
            // Sort inline for small datasets
            this._rows.sort((a, b) => {
                // ...
            });
            this._render_rows();
        }
    }
}
```

---

## CSS Performance

### Critical CSS

```css
/* performance/critical.css */

/* Avoid layout thrashing */
.virtual-list-item {
    contain: content;
    will-change: transform;
}

/* GPU acceleration for animations */
.window {
    transform: translateZ(0);
}

.window.dragging {
    will-change: transform;
}

/* Reduce paint complexity */
.data-table {
    contain: layout style;
}

/* Efficient scrolling */
.scroll-view {
    overflow-y: auto;
    overscroll-behavior: contain;
}

/* Avoid expensive properties during animation */
.animating {
    box-shadow: none;
    border-radius: 0;
}
```

### CSS Containment

```css
/* Use CSS containment for isolated subtrees */
.list-item {
    contain: layout style;
}

.tree-node {
    contain: layout;
}

.data-table-cell {
    contain: strict;
}
```

---

## Monitoring and Alerting

### Performance Monitor

```javascript
// performance/monitor.js

class Performance_Monitor {
    constructor(options = {}) {
        this.thresholds = {
            fps: options.fps_threshold || 30,
            long_task: options.long_task_threshold || 50,
            memory: options.memory_threshold || 100 * 1024 * 1024 // 100MB
        };

        this._setup_observers();
    }

    _setup_observers() {
        // Long task observer
        if ('PerformanceObserver' in window) {
            const long_task_observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > this.thresholds.long_task) {
                        this._report_issue('long_task', {
                            duration: entry.duration,
                            name: entry.name
                        });
                    }
                }
            });

            long_task_observer.observe({ entryTypes: ['longtask'] });
        }

        // Frame rate monitor
        let last_frame = performance.now();
        let frame_count = 0;

        const check_fps = () => {
            frame_count++;
            const now = performance.now();

            if (now - last_frame >= 1000) {
                const fps = frame_count;
                frame_count = 0;
                last_frame = now;

                if (fps < this.thresholds.fps) {
                    this._report_issue('low_fps', { fps });
                }
            }

            requestAnimationFrame(check_fps);
        };

        requestAnimationFrame(check_fps);

        // Memory monitor
        if (performance.memory) {
            setInterval(() => {
                if (performance.memory.usedJSHeapSize > this.thresholds.memory) {
                    this._report_issue('high_memory', {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize
                    });
                }
            }, 5000);
        }
    }

    _report_issue(type, data) {
        console.warn(`[Performance] ${type}:`, data);

        // Could send to analytics
        // analytics.track('performance_issue', { type, ...data });
    }
}

module.exports = { Performance_Monitor };
```

---

## Testing Strategy

### Performance Tests

```javascript
// test/performance/benchmarks.test.js

describe('Performance benchmarks', () => {
    const profiler = new Control_Profiler();

    it('Button instantiation < 1ms', async () => {
        const result = await profiler.measure_instantiation(Button, {});
        expect(result.p95).toBeLessThan(1);
    });

    it('Virtual_List renders 10k items < 100ms', async () => {
        const items = Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            text: `Item ${i}`
        }));

        const result = await profiler.measure_list_render(Virtual_List, items);
        expect(result.time).toBeLessThan(100);
    });

    it('Virtual_List maintains 60fps during scroll', async () => {
        // Setup list
        // Measure scroll performance
        // Assert fps > 55
    });
});
```

### Regression Prevention

```javascript
// Add to CI pipeline
// .github/workflows/performance.yml

/*
name: Performance Tests

on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run benchmark
      - uses: benchmark-action/github-action-benchmark@v1
        with:
          tool: 'customSmallerIsBetter'
          output-file-path: benchmark-results.json
          fail-on-alert: true
          alert-threshold: '150%'
*/
```

---

## Success Criteria

1. **Instantiation < 1ms** - Any single control
2. **60fps scroll** - Virtual lists with 10k+ items
3. **< 100ms initial render** - 1000 item lists
4. **Memory stable** - No leaks over 10 minute session
5. **No jank** - Zero 50ms+ frames in normal use
6. **CI enforcement** - Regressions blocked in PR
