# Controls Expansion Ideas

This document outlines ideas for improving, completing, and expanding the JSGUI3-HTML control library. It builds on the existing improvement plan while focusing on new control types, completing stub implementations, and comprehensive testing strategies.

## Table of Contents

1. [Completing Incomplete Controls](#1-completing-incomplete-controls)
2. [New Control Ideas by Category](#2-new-control-ideas-by-category)
3. [Complex Control Deep Dives](#3-complex-control-deep-dives)
4. [Testing Strategy](#4-testing-strategy)
5. [Control Quality Framework](#5-control-quality-framework)

---

## 1. Completing Incomplete Controls

### Priority 1: Modal (Critical Gap)

The current `modal.js` is a 13-line stub with no functionality. A proper modal is essential for any UI library.

**Required Features:**
- Overlay/backdrop with configurable opacity and click-to-close
- Focus trapping (tab stays within modal)
- Escape key to close
- ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- Animation support (fade in/out, slide)
- Stacking support (multiple modals)
- Sizes: small, medium, large, fullscreen
- Header/body/footer composition
- Prevent body scroll when open

**Composition:**
```
Modal
├── Modal_Backdrop
├── Modal_Container
│   ├── Modal_Header (optional close button, title)
│   ├── Modal_Body (scrollable content area)
│   └── Modal_Footer (action buttons)
```

**API Design:**
```javascript
const modal = new Modal({
    title: 'Confirm Action',
    size: 'medium',          // small, medium, large, fullscreen
    closable: true,          // show X button
    close_on_backdrop: true, // click backdrop to close
    close_on_escape: true,
    animation: 'fade',       // fade, slide-up, slide-down, scale
    persistent: false        // if true, cannot be closed by user
});

modal.set_content(some_control);
modal.set_footer([cancel_btn, confirm_btn]);
modal.show();
modal.hide();
modal.on('open', handler);
modal.on('close', handler);
modal.on('before_close', handler); // can prevent close
```

### Priority 2: Picker Base Class

The `controls/base/picker.js` is empty. This should be an abstract base for all picker-style controls.

**Common Picker Pattern:**
- Trigger element (button/input that opens the picker)
- Dropdown/popup panel
- Selection mechanism
- Value display in trigger

**Picker Variants to Build:**
- Date Picker (exists but could use Picker base)
- Time Picker (new)
- Date-Time Picker (new)
- Color Picker (new)
- Icon Picker (new)
- Emoji Picker (new)
- File Picker (enhancement of file-upload)
- Font Picker (new)

### Priority 3: Incomplete Standard Controls

| Control | Current State | Needed Work |
|---------|--------------|-------------|
| Window | Basic shell | Drag, resize, minimize, maximize, z-order |
| Panel | Minimal | Collapse, header actions, borders |
| Toolbar | Basic | Overflow menu, responsive collapse |
| Context Menu | Basic | Submenus, keyboard navigation |

---

## 2. New Control Ideas by Category

### 2.1 Date and Time Controls

**Time Picker**
- Hour/minute/second selection
- 12-hour and 24-hour modes
- AM/PM toggle
- Scrollable time wheels or dropdown
- Keyboard input support

**Date-Time Picker**
- Combines calendar and time picker
- Timezone support
- Range mode (start/end datetime)

**Date Range Picker**
- Two calendars side by side
- Preset ranges (Today, Last 7 days, This month, etc.)
- Min/max date constraints
- Custom range validation

**Calendar Scheduler**
- Week/day/month views
- Event rendering
- Drag to create/resize events
- Recurring event support

### 2.2 Color and Design Controls

**Color Picker**
- Spectrum/gradient picker
- Hue/saturation/brightness sliders
- RGB/HSL/HEX input modes
- Alpha/opacity support
- Preset color palettes
- Recent colors history
- Eye dropper tool (where supported)

**Gradient Editor**
- Linear/radial gradient types
- Color stop management
- Angle/direction control
- CSS gradient output

**Shadow Editor**
- X/Y offset controls
- Blur and spread
- Color picker integration
- Multiple shadow layers
- CSS box-shadow output

### 2.3 Media Controls

**Video Player**
- Play/pause, seek, volume
- Fullscreen toggle
- Playback speed control
- Picture-in-picture
- Subtitles/captions support
- Quality selector
- Custom skin support

**Image Editor**
- Crop tool
- Rotate/flip
- Basic filters (brightness, contrast, saturation)
- Zoom/pan controls
- Annotation layer

**Image Gallery / Lightbox**
- Thumbnail grid
- Full-size modal view
- Navigation arrows
- Zoom capability
- Slideshow mode

**File Preview**
- Image preview
- PDF viewer (embedded)
- Code syntax highlighting
- Audio waveform display

### 2.4 Data Entry Controls

**Autocomplete**
- Async data source support
- Highlighting matched text
- Custom item rendering
- Multiple selection mode
- Minimum characters before search
- Debounced input

**Multi-Select Dropdown**
- Checkbox items
- Select all option
- Search/filter
- Chips display of selected
- Clear all button

**Transfer List**
- Two list boxes with available/selected items
- Move buttons (single and all)
- Drag and drop between lists
- Search in both lists

**Dual List Box**
- Similar to transfer list but more compact
- Arrow buttons to move items
- Reordering within selected list

**Rating Control**
- Star rating (configurable icon)
- Half-star support
- Read-only display mode
- Custom max value

**Signature Pad**
- Canvas-based signature capture
- Touch and mouse support
- Clear button
- Export to image (PNG/SVG)
- Stroke customization

### 2.5 Layout and Container Controls

**Card**
- Header, body, footer sections
- Image support (top/side)
- Hover effects
- Click handling
- Loading state

**Skeleton Loader**
- Placeholder for loading content
- Various shapes (text, avatar, image, card)
- Animation (pulse, wave)
- Customizable dimensions

**Empty State**
- Icon/illustration
- Title and description
- Action button
- Common presets (no data, error, search no results)

**Responsive Grid**
- Column-based layout
- Breakpoint configuration
- Gap/gutter control
- Auto-fit and auto-fill modes

**Masonry Layout**
- Pinterest-style layout
- Dynamic item heights
- Column count configuration
- Infinite scroll support

**Timeline**
- Vertical/horizontal orientation
- Alternating sides
- Custom content per item
- Connection lines
- Icons/avatars at nodes

**Kanban Board**
- Draggable cards between columns
- Column add/remove
- Card add/edit/delete
- Swimlanes (horizontal grouping)

### 2.6 Navigation Controls

**Sidebar Navigation**
- Collapsible/expandable
- Nested menu items
- Icons with labels
- Badge indicators
- Mobile overlay mode

**App Shell**
- Header, sidebar, content, footer regions
- Responsive behavior
- Theme integration

**Command Palette**
- Keyboard-triggered modal (Ctrl+K / Cmd+K)
- Fuzzy search
- Categorized commands
- Recent commands
- Keyboard navigation

**Quick Actions Menu**
- Floating action button (FAB)
- Expanding menu on click
- Speed dial pattern

### 2.7 Feedback and Status Controls

**Spinner / Loading Indicator**
- Multiple styles (spinner, dots, bars, ring)
- Sizes
- Color/theme integration
- Overlay mode

**Progress Stepper**
- Step indicators
- Current step highlighting
- Completed/error states
- Vertical and horizontal
- Clickable steps (optional)

**Status Badge**
- Online/offline/away/busy states
- Dot indicator
- Position relative to avatar

**Avatar**
- Image display
- Initials fallback
- Status badge integration
- Sizes
- Group/stack display

**Avatar Group**
- Stacked avatars with overlap
- +N overflow indicator
- Expandable on hover/click

### 2.8 Advanced Data Controls

**Spreadsheet / Data Grid**
- Excel-like editing
- Formula support (basic)
- Cell selection (single, range, multi)
- Copy/paste
- Column resize
- Row/column freeze
- Cell formatting
- Undo/redo

**Pivot Table**
- Drag and drop field configuration
- Row/column grouping
- Aggregation functions
- Expand/collapse groups
- Export capability

**Gantt Chart**
- Task bars on timeline
- Dependencies (arrows)
- Milestones
- Progress indicators
- Drag to reschedule
- Zoom levels (day/week/month)

**Organization Chart**
- Hierarchical node display
- Expand/collapse branches
- Node customization
- Pan and zoom
- Export to image

**Diagram / Flowchart Editor**
- Node palette
- Drag to add nodes
- Connect nodes with edges
- Edge routing
- Node editing
- Export/import

### 2.9 Utility Controls

**Copy to Clipboard Button**
- One-click copy
- Success feedback
- Customizable text/tooltip

**QR Code Generator**
- Dynamic QR generation
- Size configuration
- Error correction level
- Logo overlay option

**Code Block**
- Syntax highlighting
- Line numbers
- Copy button
- Language indicator
- Collapsible

**Diff Viewer**
- Side-by-side diff
- Inline diff mode
- Line highlighting
- Syntax highlighting

**Markdown Viewer**
- Render markdown to HTML
- Syntax highlighting for code blocks
- Custom renderers

**JSON Viewer**
- Collapsible tree view
- Syntax highlighting
- Search within data
- Copy path/value

---

## 3. Complex Control Deep Dives

### 3.1 Full-Featured Data Grid

A production-ready data grid is one of the most requested controls. This should be a flagship control.

**Core Features:**
- Virtual scrolling for 100k+ rows
- Column configuration (width, min/max, resizable, sortable, filterable)
- Multi-column sorting
- Column reordering via drag
- Column visibility toggle
- Row selection (single, multi, checkbox column)
- Row grouping and aggregation
- Inline cell editing
- Custom cell renderers
- Header cell customization
- Sticky columns (left/right)
- Sticky header
- Footer row with totals

**Advanced Features:**
- Server-side mode (sorting, filtering, pagination via callbacks)
- Export to CSV/Excel
- Column filters (text, number, date, select, custom)
- Quick filter (search across all columns)
- Row expansion (detail view)
- Master-detail integration
- Keyboard navigation
- Context menu integration
- Clipboard operations
- Undo/redo for edits

**Performance Considerations:**
- Use `Virtual_List` internally for row rendering
- Lazy column rendering for horizontal scroll
- Batch DOM updates
- RequestAnimationFrame for smooth scrolling
- Web Worker for filtering/sorting large datasets

### 3.2 Rich Text Editor Enhancement

The current `Rich_Text_Editor` exists but could be expanded.

**Toolbar Actions:**
- Bold, italic, underline, strikethrough
- Headings (H1-H6)
- Lists (bullet, numbered, checklist)
- Alignment
- Links
- Images (upload, URL, resize)
- Tables (insert, row/column operations)
- Code blocks
- Block quotes
- Horizontal rule
- Undo/redo

**Advanced Features:**
- Markdown mode toggle
- HTML source view
- Word count
- Character limit
- Mention support (@user)
- Hashtag support (#tag)
- Emoji picker integration
- Drag and drop images
- Paste image from clipboard
- Collaborative editing hooks

### 3.3 Window Management System

A complete window management system for desktop-like applications.

**Window Features:**
- Draggable by title bar
- Resizable from edges and corners
- Minimize to taskbar
- Maximize / restore
- Close with confirmation
- Snap to edges/corners
- Cascade and tile arrangements
- Z-order management (bring to front)
- Modal windows
- Window state persistence

**Window Manager:**
```javascript
const wm = new Window_Manager({
    container: document.body,
    taskbar: true,
    snap_threshold: 20,
    cascade_offset: [30, 30]
});

const win = wm.create_window({
    title: 'My Window',
    icon: 'file-icon',
    width: 800,
    height: 600,
    min_width: 400,
    min_height: 300,
    resizable: true,
    closable: true,
    minimizable: true,
    maximizable: true
});

win.set_content(my_control);
```

### 3.4 Form Builder

A visual form builder control.

**Features:**
- Drag and drop fields
- Field types (text, number, email, textarea, select, checkbox, radio, date, file)
- Field configuration panel
- Validation rules
- Conditional visibility
- Multi-column layout
- Sections/groups
- Preview mode
- JSON schema export
- Form renderer (takes schema, produces form)

---

## 4. Testing Strategy

### 4.1 Test Categories

**Unit Tests (Mocha + Chai):**
- Constructor behavior
- Property getters/setters
- Method functionality
- Event emission
- Model binding

**Integration Tests:**
- Parent-child relationships
- Event propagation
- Data flow between controls
- Composition patterns

**Visual Regression Tests (Puppeteer + Percy/Playwright):**
- Screenshot comparisons
- State variations (hover, focus, disabled)
- Responsive breakpoints
- Theme variations

**Accessibility Tests (axe-core):**
- ARIA attribute validation
- Keyboard navigation
- Color contrast
- Screen reader compatibility

**Performance Tests:**
- Render time benchmarks
- Memory usage
- Large data handling
- Scroll performance

### 4.2 Test Templates

**Basic Control Test Template:**
```javascript
describe('ControlName', () => {
    describe('constructor', () => {
        it('should create with default spec', () => {});
        it('should accept custom properties', () => {});
        it('should set correct type name', () => {});
        it('should add expected CSS classes', () => {});
    });

    describe('rendering', () => {
        it('should render valid HTML', () => {});
        it('should render children correctly', () => {});
        it('should apply styles', () => {});
    });

    describe('activation', () => {
        it('should wire DOM events on activate', () => {});
        it('should be safe to call multiple times', () => {});
        it('should handle missing DOM element', () => {});
    });

    describe('value management', () => {
        it('should get value', () => {});
        it('should set value', () => {});
        it('should emit change event', () => {});
    });

    describe('accessibility', () => {
        it('should have correct ARIA attributes', () => {});
        it('should support keyboard navigation', () => {});
        it('should announce state changes', () => {});
    });
});
```

**Interactive Control Test (E2E):**
```javascript
describe('ControlName E2E', () => {
    it('should respond to click', async () => {});
    it('should update value on input', async () => {});
    it('should open dropdown on trigger', async () => {});
    it('should close on escape', async () => {});
    it('should trap focus when open', async () => {});
});
```

### 4.3 Controls Requiring Priority Testing

| Control | Test Priority | Reason |
|---------|--------------|--------|
| Data_Table | Critical | Complex interactions, performance |
| Virtual_List | Critical | Virtualization edge cases |
| Rich_Text_Editor | High | Many interaction modes |
| Tree | High | Recursive structure, keyboard nav |
| Date_Picker | High | Date logic, timezone handling |
| Modal | High | Focus management, accessibility |
| Combo_Box | High | Async loading, filtering |
| Form_Container | High | Validation, submission |
| Window | Medium | Drag/resize interactions |
| Tabbed_Panel | Medium | Keyboard navigation |
| Accordion | Medium | Animation, state management |

### 4.4 Test Infrastructure Improvements

**Test Utilities Module:**
```javascript
// test/utils/control-test-utils.js
module.exports = {
    create_and_activate(ControlClass, spec) {},
    render_to_dom(control) {},
    simulate_click(element) {},
    simulate_keypress(element, key) {},
    wait_for_animation() {},
    get_computed_style(element, property) {},
    assert_aria(element, attribute, value) {},
    assert_visible(element) {},
    assert_focused(element) {}
};
```

**Visual Test Setup:**
```javascript
// test/visual/setup.js
// Use Puppeteer to capture screenshots
// Compare against baseline images
// Generate diff images for failures
```

---

## 5. Control Quality Framework

### 5.1 Quality Tiers

**Tier 1: Production Ready**
- Complete API implementation
- Full documentation with examples
- Comprehensive unit tests (>80% coverage)
- E2E tests for interactions
- Accessibility audit passed
- Performance benchmarked
- Used in production examples

**Tier 2: Beta**
- Core API complete
- Basic documentation
- Unit tests for main flows
- Known limitations documented
- May have minor issues

**Tier 3: Alpha/Experimental**
- Partial implementation
- Minimal or no documentation
- Limited testing
- API may change
- Not recommended for production

### 5.2 Quality Checklist for New Controls

```markdown
## Control: [Name]

### Implementation
- [ ] Constructor handles all spec properties
- [ ] Type name is set correctly
- [ ] CSS classes follow naming convention
- [ ] Composition is complete
- [ ] Activation wires all events
- [ ] Value get/set works correctly
- [ ] Disabled state is handled
- [ ] Cleanup/destroy method exists

### Documentation
- [ ] JSDoc for class and public methods
- [ ] Markdown doc in docs/controls/
- [ ] Usage examples
- [ ] API reference
- [ ] Known limitations noted

### Testing
- [ ] Unit tests for constructor
- [ ] Unit tests for methods
- [ ] Unit tests for events
- [ ] E2E tests for interactions
- [ ] SSR safety tested
- [ ] Edge cases covered

### Accessibility
- [ ] Semantic HTML elements used
- [ ] ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] Screen reader tested
- [ ] Color contrast sufficient

### Performance
- [ ] Render time acceptable
- [ ] No memory leaks
- [ ] Works with large data (if applicable)
- [ ] Animation smooth

### Integration
- [ ] Exported in controls.js
- [ ] Works in dev-examples
- [ ] Theming hooks in place
- [ ] Model binding works
```

### 5.3 Control Audit Results

Based on codebase exploration, here's the current state:

**Production Ready (Tier 1):**
- Button
- Text_Input
- Checkbox
- Radio_Button
- Progress_Bar
- Breadcrumbs
- Toast
- Alert_Banner

**Beta (Tier 2):**
- Data_Table
- Virtual_List
- Tree
- Tabbed_Panel
- Accordion
- Split_Pane
- Form_Field
- Rich_Text_Editor

**Alpha (Tier 3):**
- Modal (stub only)
- Window (partial)
- Picker (empty)
- Data_Grid (connected, unclear status)

---

## 6. Implementation Roadmap Suggestions

### Phase 1: Foundation (Complete Core Gaps)
1. Complete Modal with full features
2. Create Picker base class
3. Build Time Picker and Date-Time Picker
4. Add Color Picker
5. Enhance Window control

### Phase 2: Data Power (Enterprise Features)
1. Full-featured Data Grid
2. Spreadsheet control
3. Pivot Table basics
4. Transfer List
5. JSON Viewer

### Phase 3: Design Tools (Creative Controls)
1. Gradient Editor
2. Shadow Editor
3. Image Editor basics
4. Signature Pad
5. Code Block with highlighting

### Phase 4: Advanced Layout
1. Kanban Board
2. Timeline
3. Organization Chart
4. Command Palette
5. App Shell

### Phase 5: Polish and Integration
1. Skeleton loaders for all controls
2. Empty state patterns
3. Comprehensive theming
4. Full accessibility audit
5. Performance optimization

---

## 7. Control Naming and Organization

### Proposed Directory Enhancements

```
controls/organised/
├── 0-core/
│   ├── 0-basic/
│   │   ├── 0-native-compositional/  (HTML wrappers)
│   │   ├── 1-compositional/          (composed basics)
│   │   └── 2-picker/                 (NEW: all pickers)
│   │       ├── picker-base.js
│   │       ├── color-picker.js
│   │       ├── time-picker.js
│   │       ├── date-time-picker.js
│   │       └── icon-picker.js
│   └── 1-advanced/
├── 1-standard/
│   ├── ...existing...
│   └── 7-media/                      (NEW: media controls)
│       ├── video-player.js
│       ├── image-editor.js
│       ├── lightbox.js
│       └── file-preview.js
├── 2-showcase/
│   └── ...existing...
└── 3-enterprise/                     (NEW: complex business controls)
    ├── spreadsheet.js
    ├── pivot-table.js
    ├── gantt-chart.js
    ├── org-chart.js
    └── diagram-editor.js
```

---

## 8. Quick Wins (Low Effort, High Value)

These can be implemented quickly with significant user benefit:

1. **Copy Button** - One component, widely useful
2. **Skeleton Loader** - Simple CSS + structure
3. **Avatar** - Image + initials fallback
4. **Rating** - Stars with click handling
5. **Empty State** - Composition of existing controls
6. **Status Badge** - Small dot indicator
7. **Card** - Container with header/body/footer
8. **Spinner** - CSS animation component
9. **Code Block** - Pre tag with syntax highlighting library
10. **QR Code** - Wrapper around qrcode library

---

## 9. Integration Opportunities

### With Existing Controls

- `Tooltip` + all interactive controls = better UX
- `Skeleton` + `Data_Table` = loading states
- `Toast` + `Form_Container` = submission feedback
- `Modal` + any control = dialogs
- `Context_Menu` + `Data_Table` = row actions
- `Breadcrumbs` + `File_Tree` = navigation

### With External Libraries

Consider optional integrations with:
- **Monaco Editor** - Code editing
- **Chart.js / D3** - Data visualization
- **Flatpickr** - Date picking (or build native)
- **Quill / ProseMirror** - Rich text
- **PDF.js** - PDF viewing
- **Highlight.js** - Syntax highlighting

---

## Summary

This document provides a comprehensive roadmap for expanding the JSGUI3-HTML control library. Key priorities are:

1. **Complete the Modal** - Critical missing piece
2. **Build a full Data Grid** - Enterprise requirement
3. **Add picker controls** - Date/time/color pickers
4. **Establish testing framework** - Quality assurance
5. **Create quality tiers** - Clear expectations

The control library already has a solid foundation with 140+ controls. With focused effort on completing incomplete controls and adding high-value new controls, it can become a comprehensive solution for building complex web applications.
