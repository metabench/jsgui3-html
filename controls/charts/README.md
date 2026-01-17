# jsgui3-html Chart Controls

A modern charting library built on the jsgui3-html framework with MVVM data binding, theme integration, and reactive updates.

## Quick Start

```javascript
const { Bar_Chart, Pie_Chart, Area_Chart, Scatter_Chart } = require('./controls/charts');

// Create a bar chart
const chart = new Bar_Chart({
    context,
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        series: [
            { name: 'Sales', values: [120, 150, 180, 200] },
            { name: 'Costs', values: [80, 90, 100, 110] }
        ]
    }
});

// Reactive update - chart re-renders automatically
chart.data.model.series[0].values = [130, 160, 190, 210];
```

## Chart Types

### Bar Chart

Displays data as vertical or horizontal bars.

```javascript
new Bar_Chart({
    context,
    mode: 'grouped',        // 'grouped' (default) or 'stacked'
    orientation: 'vertical', // 'vertical' (default) or 'horizontal'
    bar_gap: 0.1,           // Gap between bars (0-1)
    group_gap: 0.2,         // Gap between groups (0-1)
    data: { labels: [...], series: [...] }
});
```

### Pie Chart

Displays data as circular segments.

```javascript
new Pie_Chart({
    context,
    mode: 'pie',            // 'pie' (default) or 'donut'
    inner_radius: 0.5,      // Inner radius for donut (0-1)
    start_angle: -90,       // Start angle in degrees
    show_labels: true,      // Show value labels
    show_percentages: true, // Display as percentages
    data: { labels: [...], series: [{ values: [...] }] }
});
```

### Area Chart

Displays data as filled areas under lines.

```javascript
new Area_Chart({
    context,
    mode: 'overlap',        // 'overlap' (default) or 'stacked'
    opacity: 0.6,           // Fill opacity (0-1)
    show_lines: true,       // Show border lines
    show_points: false,     // Show data points
    data: { labels: [...], series: [...] }
});
```

### Legend

Simple, automatic legends are enabled by default. Control with a single property:

```javascript
// Default: legend at bottom
new Bar_Chart({ context, data: {...} });

// Shorthand: true = bottom, false = hidden
new Bar_Chart({ context, legend: true, data: {...} });
new Bar_Chart({ context, legend: false, data: {...} });

// Position: 'top', 'bottom', 'left', 'right', 'none'
new Bar_Chart({ context, legend: 'right', data: {...} });
```

The legend automatically:
- Shows series names for Bar/Area/Scatter charts
- Shows segment labels for Pie/Donut charts
- Displays colored swatches matching chart elements
- Supports hover effects

## Scatter Chart

Displays data points on a 2D coordinate system.

```javascript
new Scatter_Chart({
    context,
    point_size: 6,          // Default point radius
    point_shape: 'circle',  // Point shape
    show_trend_line: false, // Show linear regression line
    data: {
        series: [{
            name: 'Sample',
            points: [
                { x: 10, y: 20 },
                { x: 25, y: 35 },
                { x: 40, y: 30 }
            ]
        }]
    }
});
```

## Theme Variants

All charts support these built-in variants:

| Variant | Description |
|---------|-------------|
| `default` | Standard styling with grid and bottom legend |
| `minimal` | Clean look without grid or legend |
| `colorful` | Vibrant palette with right-side legend |
| `dark` | Dark theme palette |
| `compact` | Smaller size (300×200) |
| `presentation` | Large size (800×500) for slides |

```javascript
new Bar_Chart({
    context,
    variant: 'colorful',
    data: { ... }
});
```

## Color Palettes

Four palettes available via `Chart_Base.PALETTES`:

- **categorical** (default): `#4285f4, #ea4335, #fbbc04, #34a853, ...`
- **monochrome**: Grayscale from dark to light
- **vibrant**: High saturation colors
- **dark**: Colors optimized for dark backgrounds

## Size Presets

Three sizes available via `Chart_Base.SIZES`:

| Size | Dimensions |
|------|------------|
| `small` | 300 × 200 |
| `medium` | 500 × 300 (default) |
| `large` | 800 × 500 |

## MVVM Data Binding

Charts use MVVM architecture for reactive updates:

```javascript
const chart = new Bar_Chart({ context, data: { ... } });

// Access data model
chart.data.model.labels;  // ['A', 'B', 'C']
chart.data.model.series;  // [{ name: ..., values: [...] }]

// Update triggers re-render
chart.data.model.labels = ['X', 'Y', 'Z'];
chart.data.model.series = [{ name: 'New', values: [1, 2, 3] }];
```

## Events

Charts emit events for user interactions:

```javascript
// Bar chart
chart.on('bar-click', (e) => {
    console.log(e.series, e.category, e.value);
});

// Pie chart
chart.on('segment-click', (e) => {
    console.log(e.label, e.value, e.percentage);
});

// Scatter chart
chart.on('point-click', (e) => {
    console.log(e.series, e.x, e.y);
});
```

## Extending Charts

Create custom chart types by extending `Chart_Base`:

```javascript
const Chart_Base = require('./Chart_Base');

class Custom_Chart extends Chart_Base {
    constructor(spec = {}) {
        spec.__type_name = 'custom_chart';
        super(spec);
        
        // Set custom properties AFTER super()
        this._custom_option = spec.custom_option || 'default';
        
        this.add_class('custom-chart');
        
        // Re-render with custom properties
        if (!spec.abstract && !spec.el && this._svg) {
            this.render_chart();
        }
    }
    
    render_chart() {
        if (!this._svg) return;
        this._svg.clear();
        
        // Custom rendering logic using:
        // - this.svg_element(tag, attributes)
        // - this.get_chart_area()
        // - this.value_to_y(value)
        // - this.index_to_x(index, count)
    }
}
```

## API Reference

### Chart_Base Methods

| Method | Description |
|--------|-------------|
| `set_data(data)` | Set chart data with labels and series |
| `get_chart_area()` | Get { x, y, width, height } of drawing area |
| `get_value_range()` | Get { min, max } from all series values |
| `value_to_y(value)` | Convert data value to Y pixel position |
| `index_to_x(index, count)` | Convert category index to X pixel position |
| `svg_element(tag, attrs)` | Create SVG element with attributes |
| `render_chart()` | Override to implement custom rendering |
| `render_grid()` | Render grid lines |
| `render_legend()` | Render legend items |

### Chart_Base Properties

| Property | Type | Description |
|----------|------|-------------|
| `_chart_width` | number | Total chart width in pixels |
| `_chart_height` | number | Total chart height in pixels |
| `_margin` | object | { top, right, bottom, left } margins |
| `_palette` | array | Array of color strings |
| `_series` | array | Normalized series data |
| `_labels` | array | Category labels |
| `_show_grid` | boolean | Whether to show grid |
| `_show_legend` | string | Legend position or 'none' |

## Files

```
controls/charts/
├── Chart_Base.js    # Abstract base class
├── Bar_Chart.js     # Bar chart implementation
├── Pie_Chart.js     # Pie/donut chart implementation
├── Area_Chart.js    # Area chart implementation
├── Scatter_Chart.js # Scatter plot implementation
└── index.js         # Module exports
```

## Testing

```bash
npx mocha test/controls/chart.test.js
```

Tests cover:
- Instantiation and configuration
- Data binding and normalization
- Coordinate calculations
- Theme variant resolution
- HTML rendering
