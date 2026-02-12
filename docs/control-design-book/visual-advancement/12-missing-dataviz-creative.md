# Chapter 12: Controls Not Yet Built — Data Visualisation & Creative

> Beyond the enterprise staples, a premium toolkit needs rich data visualisation,  
> creative editors, and specialty controls that make complex tasks feel simple.

---

## 12.1 Missing Charts & Data Visualisation

jsgui3-html currently has **only `Line_Chart`**. A modern toolkit needs a full charting suite. Each chart below is specified as a standalone control with the same theming and token integration as any other control.

### Bar Chart

```javascript
const chart = new Bar_Chart({
    data: [
        { label: 'Jan', value: 120 },
        { label: 'Feb', value: 180 },
        { label: 'Mar', value: 95 }
    ],
    orientation: 'vertical',   // 'vertical' | 'horizontal'
    stacked: false,
    show_values: true,
    animate: true,             // Bars grow upward on render
    colors: 'auto',            // Uses --j-primary, or array for multi-series
    bar_radius: 'var(--j-radius-sm)',
    grid_lines: true,
    tooltip: true
});
```

**Visual:** Bars with rounded top corners, hover → bar brightness + tooltip, appear animation (bars grow from baseline in staggered sequence, 50ms per bar).
**Complexity:** Medium (2–3 days)

### Pie / Donut Chart

```javascript
const chart = new Pie_Chart({
    data: [
        { label: 'Desktop', value: 62, color: '--j-blue-500' },
        { label: 'Mobile', value: 28, color: '--j-green-500' },
        { label: 'Tablet', value: 10, color: '--j-amber-500' }
    ],
    donut: true,               // Ring shape
    donut_width: 0.65,         // Inner radius as fraction
    show_labels: true,
    show_legend: true,
    animate: true,             // Segments rotate in
    center_label: '100%',      // Text inside donut hole
    hover_expand: 8            // Segment expands 8px on hover
});
```

**Visual:** SVG segments with smooth stroke, hover → segment lifts outward + tooltip, donut mode shows label in center.
**Complexity:** Medium (2–3 days)

### Scatter Plot

```javascript
const chart = new Scatter_Plot({
    datasets: [
        { label: 'Group A', data: [{x: 10, y: 20}, {x: 30, y: 40}], color: '--j-blue-500' }
    ],
    x_label: 'Performance', y_label: 'Accuracy',
    point_radius: 6,
    tooltip: true,
    zoom: true,                // Mouse wheel zoom + drag pan
    trend_line: 'linear'       // 'linear' | 'polynomial' | false
});
```

**Complexity:** Medium-High (3 days)

### Area Chart

A filled line chart. Shares the `Line_Chart` engine with a gradient fill beneath the line.

```css
.jsgui-area-fill {
    fill: url(#area-gradient);
    opacity: 0.2;
    transition: opacity 200ms ease-out;
}
.jsgui-chart:hover .jsgui-area-fill { opacity: 0.35; }
```

**Complexity:** Low (1 day — extends Line_Chart)

### Gauge / Radial Progress

```javascript
const gauge = new Gauge({
    value: 73,
    min: 0, max: 100,
    label: 'CPU Usage',
    thresholds: [
        { value: 60, color: '--j-success' },
        { value: 80, color: '--j-warning' },
        { value: 90, color: '--j-danger' }
    ],
    style: 'arc',              // 'arc' (semi-circle) | 'ring' (full circle)
    animate: true,
    show_needle: true
});
```

**Visual:** SVG arc with animated needle sweep, colour transitions at thresholds, large number in center.
**Complexity:** Medium (2 days)

### Sparkline

A tiny inline chart designed to sit in a table cell or alongside a number.

```javascript
const spark = new Sparkline({
    data: [10, 14, 8, 22, 19, 25, 18, 30],
    width: 80, height: 24,
    color: '--j-primary',
    fill: true,            // Subtle gradient fill
    show_final_dot: true   // Highlight the last data point
});
```

**Visual:** Thin SVG path, no axes, no labels. Fill uses a 20% opacity gradient. Final dot is a solid circle.
**Complexity:** Low (0.5 day)

### Heatmap

```javascript
const heatmap = new Heatmap({
    data: github_contributions_array,  // [{x: 0, y: 3, value: 5}, ...]
    x_labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    y_labels: weeks_array,
    color_scale: ['--j-bg-muted', '--j-green-300', '--j-green-500', '--j-green-700'],
    cell_size: 14,
    cell_gap: 2,
    cell_radius: 2,
    tooltip: true
});
```

**Visual:** Grid of coloured cells (like GitHub contribution graph). Tooltip shows value on hover.
**Complexity:** Medium (2 days)

---

## 12.2 Missing Creative & Editor Controls

### Code Editor

A syntax-highlighting code editor control — not a full IDE, but a code block with basic editing.

```javascript
const editor = new Code_Editor({
    value: 'function hello() {\n  return "world";\n}',
    language: 'javascript',
    line_numbers: true,
    highlight_active_line: true,
    read_only: false,
    minimap: false,
    font_size: 14,
    tab_size: 2,
    wrap: false
});
```

**Implementation approach:** Wrap a lightweight library like CodeMirror 6 or provide a simpler custom implementation with `<pre>` + `contenteditable` + tokeniser for basic highlighting.

**Visual:** Dark background by default (regardless of page theme), monospace font, line numbers in gutter, active line highlight, selection colour, bracket matching highlight.
**Complexity:** High if custom (5+ days), Low if wrapping CodeMirror (1–2 days)

### Markdown Viewer

```javascript
const viewer = new Markdown_Viewer({
    content: '# Hello\n\nThis is **bold** and this is `inline code`.\n\n```js\nconsole.log("hi");\n```',
    allow_html: false,
    syntax_highlight: true,
    link_target: '_blank'
});
```

**Visual:** Styled markdown rendering with proper typography (Chapter 5 tokens), code blocks with syntax highlighting, blockquote left border accent, table styling, image resize handling.
**Complexity:** Medium (2–3 days — parse + style, or wrap marked/markdown-it)

### Image Cropper

```javascript
const cropper = new Image_Cropper({
    src: '/photos/portrait.jpg',
    aspect_ratio: 1,           // 1:1 square | 16/9 | 4/3 | null (free)
    min_width: 100,
    max_width: 800,
    output_format: 'png',
    output_quality: 0.9,
    show_grid: true           // Rule-of-thirds grid overlay
});
```

**Visual:** Image with draggable crop rectangle, darkened area outside crop, corner/edge handles, rule-of-thirds grid, zoom slider below.
**Complexity:** Medium-High (3–4 days)

### Diagram / Flow Editor

```javascript
const flow = new Flow_Editor({
    nodes: [
        { id: 'start', type: 'start', label: 'Start', x: 100, y: 200 },
        { id: 'process', type: 'process', label: 'Process Data', x: 300, y: 200 },
        { id: 'end', type: 'end', label: 'End', x: 500, y: 200 }
    ],
    edges: [
        { from: 'start', to: 'process', label: 'input' },
        { from: 'process', to: 'end', label: 'output' }
    ],
    editable: true,
    snap_to_grid: true,
    grid_size: 20,
    node_types: {
        start: { shape: 'circle', color: '--j-success' },
        process: { shape: 'rect', color: '--j-primary' },
        end: { shape: 'circle', color: '--j-danger' }
    }
});
```

**Visual:** SVG-based canvas, nodes with rounded rects/circles, curved Bezier edge connections, drag nodes to reposition, drag from port to create new connections.
**Complexity:** Very High (7–10 days)

---

## 12.3 Missing Specialty Controls

### Calendar Scheduler

Like Google Calendar — a day/week/month view with draggable events.

```javascript
const scheduler = new Calendar_Scheduler({
    view: 'week',             // 'day' | 'week' | 'month'
    events: [
        { title: 'Team standup', start: '2024-01-15T09:00', end: '2024-01-15T09:30', color: '--j-primary' },
        { title: 'Lunch', start: '2024-01-15T12:00', end: '2024-01-15T13:00', color: '--j-green-500' }
    ],
    on_event_move: (event, new_start, new_end) => { ... },
    on_slot_click: (start, end) => { ... },
    time_min: 6,              // Start at 6 AM
    time_max: 22,             // End at 10 PM
    slot_height: 48           // Pixels per 30-min slot
});
```

**Visual:** Time grid (hours on left), event blocks as coloured rounded rects, drag to move/resize, click empty slot to create.
**Complexity:** Very High (7–10 days)

### Map View

A control that wraps an interactive map (Leaflet, Mapbox GL, or Google Maps) with the jsgui theming system.

```javascript
const map = new Map_View({
    center: { lat: 51.505, lng: -0.09 },
    zoom: 13,
    markers: [
        { lat: 51.505, lng: -0.09, label: 'London', popup: 'Hello from London' }
    ],
    style: 'dark',             // Matches jsgui theme
    provider: 'leaflet'        // 'leaflet' | 'mapbox'
});
```

**Complexity:** Medium (2–3 days — mostly wrapping an existing library with theming)

### Diff Viewer

Side-by-side or unified diff display for comparing text.

```javascript
const diff = new Diff_Viewer({
    old_text: original_code,
    new_text: modified_code,
    mode: 'split',             // 'split' | 'unified'
    language: 'javascript',
    line_numbers: true
});
```

**Visual:** Split panes with red/green highlighting for deletions/additions, line numbers, scrollbar sync.
**Complexity:** Medium (2–3 days)

---

## 12.4 Priority & Effort Matrix

### Data Visualisation (extend from Line_Chart foundation)

| Control | Priority | Days | ROI |
|---------|:--------:|:----:|:---:|
| Bar Chart | **P0** | 2–3 | High — most requested chart type |
| Pie / Donut | **P0** | 2–3 | High — dashboards need this |
| Sparkline | **P0** | 0.5 | Very High — tiny effort, huge utility |
| Area Chart | **P1** | 1 | Medium — simple extension |
| Gauge | **P1** | 2 | Medium — dashboards |
| Scatter Plot | **P2** | 3 | Medium — analytics apps |
| Heatmap | **P2** | 2 | Medium — specialized use |

### Creative & Editor Controls

| Control | Priority | Days | ROI |
|---------|:--------:|:----:|:---:|
| Markdown Viewer | **P0** | 2–3 | High — documentation, CMS |
| Code Editor | **P1** | 1–2 | High — dev tools (wrap CodeMirror) |
| Image Cropper | **P1** | 3–4 | Medium — profile photos, CMS |
| Diff Viewer | **P2** | 2–3 | Medium — dev tools |
| Flow / Diagram Editor | **P3** | 7–10 | Low ROI per effort |

### Specialty Controls

| Control | Priority | Days | ROI |
|---------|:--------:|:----:|:---:|
| Map View | **P1** | 2–3 | Medium — location-based apps |
| Calendar Scheduler | **P2** | 7–10 | High value but very high effort |

---

## 12.5 The Build Order

If implementing all missing controls, this sequence minimises dependencies and maximises early value:

```
Sprint 1 (Week 1):  Sparkline → Bar Chart → Pie/Donut → Area Chart
Sprint 2 (Week 2):  Sidebar Nav → Wizard → Markdown Viewer
Sprint 3 (Week 3):  Command Palette → Notification Center → Code Editor (wrap)
Sprint 4 (Week 4):  Image Gallery → Inline Cell Editing → Gauge → Scatter
Sprint 5 (Week 5):  Timeline → Kanban Board → Map View
Sprint 6 (Week 6+): Calendar Scheduler → Image Cropper → Diff Viewer → Flow Editor
```

**Total estimated effort: ~55–70 days** to reach a 200+ control toolkit with competitive coverage.

---

> With these two chapters, jsgui3-html gains a complete roadmap  
> from 145 controls to 200+, covering every major category  
> a premium UI toolkit is expected to have.
