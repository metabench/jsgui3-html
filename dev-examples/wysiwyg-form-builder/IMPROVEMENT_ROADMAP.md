# WYSIWYG Form Builder - Comprehensive Improvement Roadmap

## Current State Assessment

The existing form builder provides basic functionality but lacks the sophistication and features expected from a modern WYSIWYG editor. It supports simple field addition, basic property editing, and preview mode, but misses critical features like true drag-and-drop, undo/redo, advanced layouts, validation rules, and collaborative capabilities.

---

## Phase 1: Foundation Enhancements (Core UX/UI)

### 1.1 Implement True Drag-and-Drop
**Priority: HIGH | Complexity: MEDIUM**

**Current Issue**: Fields are added by clicking and reordered with up/down buttons only.

**Tasks**:
- Add `mx.dragable` mixin to `PaletteItem` instances
- Implement drop zones in canvas with visual feedback (highlight on dragover)
- Support drag-from-palette-to-canvas for field creation
- Support drag-within-canvas for field reordering
- Add ghost/preview element during drag showing field position
- Implement `_on_drop(event, field_type, index)` handler
- Add drag handle (⋮⋮) to field preview headers for better grab UX

**Files to modify**:
- `client.js`: `PaletteItem`, `FormFieldPreview`, `FormBuilder._createLayout`, `FormBuilder._renderEditMode`
- `styles.css`: `.palette-item.dragging`, `.canvas-drop-zone`, `.field-drag-handle`

**Code snippet**:
```javascript
// In FormFieldPreview constructor
this.drag_handle = new Control({ context, tag_name: 'span' });
this.drag_handle.add_class('field-drag-handle');
this.drag_handle.add('⋮⋮');
this.header.add(this.drag_handle, 0);

// In activate()
mx.dragable(this, {
    handle: this.drag_handle.dom.el,
    on_drag_start: () => { this.add_class('dragging'); },
    on_drag_end: () => { this.remove_class('dragging'); }
});
```

### 1.2 Add Undo/Redo System
**Priority: HIGH | Complexity: MEDIUM**

**Current Issue**: No way to undo mistakes or redo undone actions.

**Tasks**:
- Create `history_manager.js` module with `Command` pattern
- Implement commands: `AddFieldCommand`, `DeleteFieldCommand`, `MoveFieldCommand`, `UpdateFieldCommand`, `UpdateTitleCommand`
- Maintain undo/redo stacks (max 50 items)
- Add keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo)
- Add undo/redo buttons to toolbar with enabled/disabled states
- Store command metadata for display (e.g., "Added Text Field", "Moved Email Field")
- Update all field mutations to use command system

**New file**: `dev-examples/wysiwyg-form-builder/history_manager.js`

**Code structure**:
```javascript
class Command {
    execute(model) { /* override */ }
    undo(model) { /* override */ }
    get_description() { return 'Action'; }
}

class Add_Field_Command extends Command {
    constructor(field, index) {
        super();
        this.field = field;
        this.index = index;
    }
    execute(model) {
        const fields = model.get('fields');
        fields.splice(this.index, 0, this.field);
        model.set('fields', fields);
    }
    undo(model) {
        const fields = model.get('fields');
        fields.splice(this.index, 1);
        model.set('fields', fields);
    }
    get_description() { return `Added ${this.field.type} field`; }
}

class History_Manager {
    constructor() {
        this.undo_stack = [];
        this.redo_stack = [];
        this.max_size = 50;
    }
    execute(command, model) {
        command.execute(model);
        this.undo_stack.push(command);
        if (this.undo_stack.length > this.max_size) {
            this.undo_stack.shift();
        }
        this.redo_stack = [];
    }
    undo(model) { /* implementation */ }
    redo(model) { /* implementation */ }
    can_undo() { return this.undo_stack.length > 0; }
    can_redo() { return this.redo_stack.length > 0; }
}
```

**Files to modify**:
- `client.js`: Integrate `History_Manager`, update all mutation methods
- `styles.css`: `.toolbar-button:disabled` styles

### 1.3 Field Copy/Paste/Duplicate
**Priority: MEDIUM | Complexity: LOW**

**Tasks**:
- Add duplicate button (⊕) to field preview headers
- Add copy/paste buttons to property editor
- Implement keyboard shortcuts: Ctrl+C (copy), Ctrl+V (paste), Ctrl+D (duplicate)
- Store copied field in memory (not just selected field reference, deep clone)
- Paste below currently selected field or at end if none selected
- Increment field names on duplicate (e.g., `field_1` → `field_1_copy`, `field_1_copy_2`)

**Files to modify**:
- `client.js`: Add `_copy_field()`, `_paste_field()`, `_duplicate_field(index)` methods

---

## Phase 2: Advanced Field Types & Properties

### 2.1 Add Rich Field Types
**Priority: HIGH | Complexity: MEDIUM-HIGH**

**New field types to implement**:
1. **Date Picker** (`type: 'date'`)
   - Native `<input type="date">` with fallback
   - Properties: min_date, max_date, default_value
   
2. **Time Picker** (`type: 'time'`)
   - Native `<input type="time">`
   - Properties: min_time, max_time, step (minutes)
   
3. **Color Picker** (`type: 'color'`)
   - Native `<input type="color">`
   - Property: default_color
   
4. **File Upload** (`type: 'file'`)
   - Properties: accept (file types), multiple, max_size_mb
   
5. **Radio Group** (`type: 'radio'`)
   - Properties: options (array), layout ('vertical' | 'horizontal'), default_value
   
6. **Checkbox Group** (`type: 'checkbox_group'`)
   - Multiple checkboxes, properties: options (array), min_selections, max_selections
   
7. **Range Slider** (`type: 'range'`)
   - Properties: min, max, step, default_value, show_value
   
8. **Rating** (`type: 'rating'`)
   - Star rating, properties: max_stars (default 5), icon (star, heart, etc.)
   
9. **Rich Text** (`type: 'richtext'`)
   - Basic WYSIWYG editor (bold, italic, underline, lists)
   - Consider lightweight library or contenteditable DIV
   
10. **Image** (`type: 'image'`)
    - Display image in form, properties: src, alt, width, height, align

**Tasks**:
- Add each type to palette with appropriate icon
- Implement preview rendering in `FormFieldPreview._renderPreview()`
- Create specialized controls or enhance `FormField` to handle each type
- Update property editor to show type-specific properties
- Add validation for type-specific constraints

**Files to modify**:
- `client.js`: `_createPalette()`, `FormFieldPreview._renderPreview()`, `FormBuilder._renderPreviewMode()`
- Consider new file: `field_types.js` with type definitions and renderers

### 2.2 Advanced Validation Rules
**Priority: HIGH | Complexity: MEDIUM**

**Current Issue**: Only "required" checkbox exists.

**Tasks**:
- Add validation section to property editor with expandable rules
- Implement rule types:
  - **Pattern**: Regex validation (with common presets: email, phone, postal code, etc.)
  - **Min/Max Length**: For text inputs (characters)
  - **Min/Max Value**: For number/range inputs
  - **Custom Error Messages**: Per rule type
  - **Cross-Field**: Compare with other fields (e.g., "Confirm Password")
  - **Async Validation**: Placeholder for server-side checks (username availability, etc.)
- Visual rule builder UI with "Add Rule" button
- Display validation rules as chips/tags in property editor
- Preview validation by attempting form submission in preview mode

**Files to modify**:
- `client.js`: Add `validation_rules` array to field schema, update property editor
- `styles.css`: `.validation-rule-chip`, `.validation-rules-list`

**Data structure**:
```javascript
{
  type: 'text',
  label: 'Username',
  validation_rules: [
    { type: 'required', message: 'Username is required' },
    { type: 'min_length', value: 3, message: 'Minimum 3 characters' },
    { type: 'max_length', value: 20, message: 'Maximum 20 characters' },
    { type: 'pattern', value: '^[a-zA-Z0-9_]+$', message: 'Letters, numbers, underscore only' }
  ]
}
```

### 2.3 Conditional Logic & Visibility Rules
**Priority: MEDIUM | Complexity: HIGH**

**Feature**: Show/hide or enable/disable fields based on values of other fields.

**Tasks**:
- Add "Conditional Logic" section to property editor
- Implement rule builder:
  - Condition: "Show this field when..."
  - Trigger field selector dropdown (all previous fields)
  - Operator: equals, not_equals, contains, greater_than, less_than, is_empty, is_not_empty
  - Value input (type-aware based on trigger field type)
- Support multiple conditions with AND/OR logic
- Implement real-time evaluation in preview mode
- Add visual indicator in edit mode (⚡ icon) for fields with conditional logic
- Store rules in field schema: `conditional_logic: { show_when: [...], enabled_when: [...] }`

**Files to modify**:
- `client.js`: Add conditional logic evaluator, update preview rendering
- `styles.css`: `.conditional-logic-indicator`, `.conditional-rule-builder`

---

## Phase 3: Layout & Styling

### 3.1 Multi-Column Layouts
**Priority: HIGH | Complexity: MEDIUM**

**Current Issue**: All fields are 100% width in single column.

**Tasks**:
- Add layout container concept: rows with configurable columns
- Implement "Add Row" button in canvas
- Each row can have 1-4 columns (adjustable split: 50/50, 33/33/33, 25/75, etc.)
- Drag fields into columns
- Field property: `column_width` percentage within its column
- Responsive breakpoints: collapse to single column on mobile
- Visual grid lines in edit mode showing column boundaries
- Row properties: background_color, padding, border

**New classes**:
```javascript
class Form_Row extends Control {
    constructor(options = {}) {
        super(options);
        this.columns = options.columns || 1;
        this.fields_per_column = [[], [], [], []]; // max 4 columns
        // Render column containers
    }
}
```

**Files to modify**:
- `client.js`: Restructure data model to support rows, update rendering
- `styles.css`: `.form-row`, `.form-column`, `.column-boundary`

**Data structure change**:
```javascript
{
  formTitle: "My Form",
  layout: [
    {
      type: 'row',
      columns: 2,
      fields: [
        [{ /* field 1 */ }, { /* field 2 */ }],  // column 1
        [{ /* field 3 */ }]                       // column 2
      ]
    },
    {
      type: 'row',
      columns: 1,
      fields: [[{ /* field 4 */ }]]
    }
  ]
}
```

### 3.2 Sections & Fieldsets
**Priority: MEDIUM | Complexity: LOW**

**Tasks**:
- Add "Section" and "Fieldset" to palette
- Section: Visual divider with title, description, collapsible
- Fieldset: Grouped fields with border and legend
- Properties: title, description, collapsible (boolean), default_collapsed (boolean)
- Nest fields within sections/fieldsets in data model
- Render with appropriate HTML semantics (`<fieldset>`, `<legend>`)

**Files to modify**:
- `client.js`: Add section/fieldset rendering logic
- `styles.css`: `.form-section`, `.form-fieldset`

### 3.3 Custom Styling Options
**Priority: LOW | Complexity: MEDIUM**

**Tasks**:
- Add "Design" tab to property editor (alongside "Properties")
- Per-field styling options:
  - Label style: font_size, font_weight, color
  - Input style: background_color, border_color, border_radius
  - Spacing: margin_top, margin_bottom, padding
- Form-level styling:
  - Theme presets (Material, Bootstrap, Minimal, etc.)
  - Global colors: primary, secondary, error, success
  - Typography: font_family, base_font_size
- Live preview of style changes
- Export styled CSS alongside JSON

**Files to modify**:
- `client.js`: Add style generator, inject `<style>` tag in preview mode
- New file: `style_generator.js`

---

## Phase 4: User Experience Enhancements

### 4.1 Field Search & Filter
**Priority: LOW | Complexity: LOW**

**Tasks**:
- Add search input above palette
- Filter palette items by label as user types
- Highlight matching text
- Show "No results" message if no matches
- Clear search on field addition

**Files to modify**:
- `client.js`: Add search input to palette, implement filter logic
- `styles.css`: `.palette-search-input`

### 4.2 Keyboard Shortcuts & Accessibility
**Priority: MEDIUM | Complexity: MEDIUM**

**Tasks**:
- Implement keyboard navigation:
  - Tab through fields in canvas
  - Arrow keys to move selection up/down
  - Delete key to remove selected field
  - Enter to edit selected field properties
  - Escape to deselect
  - Ctrl+S to save
- Add keyboard shortcut help modal (Ctrl+? or Shift+?)
- Ensure all interactive elements are focusable
- Add ARIA labels and roles
- Test with screen readers
- Keyboard hints in tooltips (e.g., "New Form (Ctrl+N)")

**Files to modify**:
- `client.js`: Add keyboard event listeners, implement shortcut handler
- New file: `keyboard_shortcuts.js`
- `styles.css`: `:focus` styles, `.keyboard-hint`

### 4.3 Context Menus
**Priority: LOW | Complexity: LOW**

**Tasks**:
- Right-click on field preview to show context menu
- Menu items: Edit, Duplicate, Copy, Paste, Move Up, Move Down, Delete
- Right-click on canvas to show: Paste, Add Field submenu, Clear
- Position menu near cursor
- Close on outside click or Escape

**Files to modify**:
- `client.js`: Add context menu component, attach to fields
- `styles.css`: `.context-menu`

### 4.4 Tooltips & Help Text
**Priority: LOW | Complexity: LOW**

**Tasks**:
- Add question mark icons (?) next to property labels
- Show tooltip on hover with explanation
- Add "Help" panel (collapsible) with tips and tutorials
- Field validation tooltips on hover over error icons

**Files to modify**:
- `client.js`: Add tooltip component, attach to properties
- `styles.css`: `.tooltip`, `.help-panel`

---

## Phase 5: Data Management & Export

### 5.1 Form Templates Library
**Priority: MEDIUM | Complexity: MEDIUM**

**Tasks**:
- Create template system with pre-built forms:
  - Contact Form
  - Registration Form
  - Survey Template
  - Feedback Form
  - Order Form
  - Job Application
- Add "Templates" button to toolbar
- Show template gallery modal with previews and descriptions
- "Use Template" button loads template into canvas (with confirmation)
- Save current form as custom template
- Store templates in localStorage with indexedDB fallback
- Import/export template collections

**New file**: `templates.js` with template definitions

**Files to modify**:
- `client.js`: Add template modal, load template function
- `styles.css`: `.template-gallery`, `.template-card`

### 5.2 Multiple Export Formats
**Priority: MEDIUM | Complexity: MEDIUM**

**Current**: Only JSON export.

**Tasks**:
- Export as HTML (standalone form with inline styles and basic validation JS)
- Export as React component (JSX with useState hooks)
- Export as Vue component (SFC with composition API)
- Export as plain JavaScript object (for backend processing)
- Export as PDF (printable form design, use library like jsPDF)
- Export validation schema (JSON Schema, Yup, Zod formats)
- Add format selector modal on export click

**New file**: `exporters.js` with exporter functions

**Code structure**:
```javascript
const exporters = {
    to_html: (form_data) => { /* generate HTML string */ },
    to_react: (form_data) => { /* generate JSX string */ },
    to_vue: (form_data) => { /* generate SFC string */ },
    to_json_schema: (form_data) => { /* generate JSON Schema */ }
};
```

**Files to modify**:
- `client.js`: Add export format selector, use exporters

### 5.3 Form Versioning & History
**Priority: LOW | Complexity: MEDIUM**

**Tasks**:
- Auto-save snapshots to localStorage every N minutes or M changes
- Store up to 10 recent versions per form
- Add "Version History" button to toolbar
- Show version list modal with timestamps and change counts
- Preview version in read-only mode
- Restore version with confirmation
- Tag versions (e.g., "v1.0", "Draft", "Final")

**Files to modify**:
- `client.js`: Add version manager, version history modal
- `styles.css`: `.version-history-modal`, `.version-item`

### 5.4 Cloud Storage Integration (Optional)
**Priority: LOW | Complexity: HIGH**

**Tasks**:
- Integrate with backend API (create separate API server)
- User authentication (simple JWT)
- Save forms to server database
- List saved forms in gallery
- Share forms via public link
- Collaborative editing (WebSocket-based real-time updates)
- Conflict resolution for simultaneous edits

**New files**:
- Backend: `form-storage-api/` (Express.js server, SQLite/PostgreSQL)
- Client: `api_client.js`

---

## Phase 6: Form Logic & Interactivity

### 6.1 Field Dependencies & Calculations
**Priority: MEDIUM | Complexity: HIGH**

**Tasks**:
- Support calculated fields (e.g., Total = Quantity × Price)
- Add "Calculation" field type
- Formula builder with field picker and operators (+, -, *, /, %, etc.)
- Real-time calculation in preview mode
- Support functions: SUM, AVG, MIN, MAX, COUNT, IF, etc.
- Store formulas as expressions: `{field_3} * {field_4} * 1.1`

**Files to modify**:
- `client.js`: Add calculation evaluator, formula builder UI
- New file: `expression_evaluator.js`

### 6.2 Multi-Page Forms & Wizard
**Priority: MEDIUM | Complexity: HIGH**

**Tasks**:
- Support multi-page/multi-step forms
- Add "Page" concept to data model (array of pages, each with fields)
- Page navigation: Next, Previous, Page indicators (1 of 3)
- Progress bar at top
- Page-level validation (must complete page before proceeding)
- Page properties: title, description, skip_conditions
- Render page tabs in edit mode for easy navigation

**Files to modify**:
- `client.js`: Restructure data model, add page navigation
- `styles.css`: `.page-tabs`, `.progress-bar`

**Data structure**:
```javascript
{
  formTitle: "Multi-Step Form",
  pages: [
    { title: "Personal Info", fields: [...] },
    { title: "Address", fields: [...] },
    { title: "Confirmation", fields: [...] }
  ]
}
```

### 6.3 Form Submission Handling
**Priority: MEDIUM | Complexity: MEDIUM**

**Tasks**:
- Add "Actions" tab to form-level settings
- Configure submission endpoint URL
- HTTP method (POST, GET)
- Headers (Authorization, Content-Type, etc.)
- Success/error messages
- Redirect URL on success
- Email notification settings (requires backend)
- Webhook integration (send data to external service)
- Test submission in preview mode (with mock endpoint)

**Files to modify**:
- `client.js`: Add form settings panel, submission handler
- `styles.css`: `.form-settings-panel`

---

## Phase 7: Performance & Polish

### 7.1 Performance Optimizations
**Priority: MEDIUM | Complexity: MEDIUM**

**Tasks**:
- Lazy rendering: Only render visible fields in canvas (virtual scrolling)
- Debounce property input changes (avoid re-render on every keystroke)
- Memoize field preview renders
- Use requestAnimationFrame for smooth drag animations
- Minimize DOM manipulations (batch updates)
- Profile with Chrome DevTools, identify bottlenecks
- Test with 100+ field forms

**Files to modify**:
- `client.js`: Add debouncing, virtual scroll, memoization

### 7.2 Mobile Responsiveness
**Priority: MEDIUM | Complexity: LOW**

**Tasks**:
- Collapsible panels (palette, properties) on mobile
- Hamburger menu for toolbar
- Touch-friendly drag-and-drop
- Swipe gestures for field reordering
- Bottom sheet for property editor on mobile
- Test on iOS Safari and Android Chrome
- Responsive breakpoints: <768px (mobile), <1024px (tablet)

**Files to modify**:
- `styles.css`: Media queries, mobile-first approach
- `client.js`: Touch event handlers

### 7.3 Animations & Transitions
**Priority: LOW | Complexity: LOW**

**Tasks**:
- Smooth field addition animation (fade + slide in)
- Smooth field removal animation (fade + slide out)
- Smooth field reorder animation (swap with animation)
- Panel open/close transitions
- Modal fade in/out
- Button hover effects (already present, enhance)
- Loading spinners for async operations
- Success/error toast notifications with animations

**Files to modify**:
- `styles.css`: CSS transitions and animations
- `client.js`: Add animation triggers

### 7.4 Error Handling & User Feedback
**Priority: HIGH | Complexity: LOW**

**Tasks**:
- Comprehensive error messages for all operations
- Toast notification system (top-right corner)
- Loading indicators for save/load operations
- Confirmation dialogs for destructive actions (already present, ensure consistency)
- Graceful degradation if features unsupported (e.g., no localStorage)
- Network error handling for cloud features
- Detailed error logs in console for debugging

**Files to modify**:
- `client.js`: Add toast component, error boundary
- New file: `toast.js`
- `styles.css`: `.toast`, `.toast-error`, `.toast-success`

---

## Phase 8: Testing & Documentation

### 8.1 Automated Testing
**Priority: HIGH | Complexity: MEDIUM**

**Tasks**:
- Unit tests for all data manipulation functions (add, delete, move, update)
- Unit tests for undo/redo system
- Unit tests for validation logic
- E2E tests with Puppeteer:
  - Add field from palette
  - Edit field properties
  - Reorder fields
  - Delete field
  - Undo/redo
  - Export JSON
  - Import JSON
  - Preview mode
  - Multi-page forms
- Test coverage target: >80%
- CI/CD integration (GitHub Actions)

**New directory**: `test/wysiwyg-form-builder/`

**Files**:
- `test/wysiwyg-form-builder/unit/`
  - `field_operations.test.js`
  - `history_manager.test.js`
  - `validation.test.js`
- `test/wysiwyg-form-builder/e2e/`
  - `basic_workflow.test.js`
  - `advanced_features.test.js`

### 8.2 Comprehensive Documentation
**Priority: HIGH | Complexity: LOW**

**Tasks**:
- Update README.md with all new features
- Add screenshots and GIFs for each major feature
- Create user guide with step-by-step tutorials
- API documentation for programmatic form creation
- Developer guide for extending the builder (adding field types, exporters)
- Video tutorials (optional, embed in README)
- JSDoc comments for all public methods and classes
- Architecture diagram (use Mermaid.js in README)

**Files to update**:
- `README.md`: Expand with new sections
- New files:
  - `USER_GUIDE.md`
  - `DEVELOPER_GUIDE.md`
  - `API_REFERENCE.md`

### 8.3 Code Quality & Refactoring
**Priority: MEDIUM | Complexity: MEDIUM**

**Tasks**:
- Refactor `client.js` (currently 585 lines) into modular files:
  - `form_builder.js` (main class)
  - `field_preview.js`
  - `palette.js`
  - `canvas.js`
  - `property_editor_ext.js` (extensions)
- Extract reusable utilities:
  - `utils/dom_helpers.js`
  - `utils/data_helpers.js`
- Use consistent naming (already snake_case, ensure all code follows)
- Add TypeScript definitions (optional, `.d.ts` files)
- Linting with ESLint (jsgui3-html conventions)
- Code formatting with Prettier (configure for snake_case)

**New structure**:
```
wysiwyg-form-builder/
├── client.js (main entry, ~100 lines)
├── components/
│   ├── form_builder.js
│   ├── field_preview.js
│   ├── palette.js
│   ├── canvas.js
│   └── property_editor_ext.js
├── utils/
│   ├── dom_helpers.js
│   ├── data_helpers.js
│   ├── exporters.js
│   └── expression_evaluator.js
├── managers/
│   ├── history_manager.js
│   └── version_manager.js
├── data/
│   └── templates.js
├── server.js
├── styles.css
└── README.md
```

---

## Implementation Priority Summary

### Must-Have (MVP+)
1. True drag-and-drop (Phase 1.1)
2. Undo/redo system (Phase 1.2)
3. Rich field types (Phase 2.1)
4. Advanced validation rules (Phase 2.2)
5. Multi-column layouts (Phase 3.1)
6. Error handling & feedback (Phase 7.4)
7. Automated testing (Phase 8.1)
8. Comprehensive documentation (Phase 8.2)

### Should-Have (Enhanced UX)
1. Copy/paste/duplicate (Phase 1.3)
2. Conditional logic (Phase 2.3)
3. Form templates library (Phase 5.1)
4. Multiple export formats (Phase 5.2)
5. Keyboard shortcuts (Phase 4.2)
6. Multi-page forms (Phase 6.2)
7. Performance optimizations (Phase 7.1)
8. Mobile responsiveness (Phase 7.2)
9. Code refactoring (Phase 8.3)

### Nice-to-Have (Polish & Advanced)
1. Sections & fieldsets (Phase 3.2)
2. Custom styling options (Phase 3.3)
3. Field search & filter (Phase 4.1)
4. Context menus (Phase 4.3)
5. Tooltips & help (Phase 4.4)
6. Form versioning (Phase 5.3)
7. Field calculations (Phase 6.1)
8. Form submission handling (Phase 6.3)
9. Animations & transitions (Phase 7.3)

### Future/Optional
1. Cloud storage integration (Phase 5.4)
2. Real-time collaboration
3. Plugin system for custom field types
4. Form analytics (views, submissions, completion rate)
5. A/B testing support
6. Localization/i18n
7. Accessibility audit certification (WCAG 2.1 AA)

---

## Technical Guidelines for Implementation

### Code Style
- **Always** use `snake_case` for variables, methods, functions
- **Always** use `Camel_Case` (with underscores) for class names
- **Always** use `kebab-case` for CSS classes
- **Always** use `SCREAMING_SNAKE_CASE` for constants
- Guard all DOM access for server-side compatibility:
  ```javascript
  if (this.element.dom.el) {
      this.element.dom.el.addEventListener(...);
  }
  ```
- Add event listeners **only** in `activate()` method, not constructor
- Use `Data_Object` from `lang-tools` for all models
- Call `super(spec)` first in all subclass constructors

### Performance Considerations
- Debounce property input handlers (300ms)
- Use `requestAnimationFrame` for animations
- Minimize DOM queries (cache references)
- Batch DOM updates when possible
- Lazy-load heavy components (rich text editor, color picker)
- Virtual scrolling for 100+ fields

### Testing Requirements
- Write unit tests for all data operations
- E2E test every user workflow
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile devices (iOS/Android)
- Test with assistive technologies (screen readers)
- Performance benchmark: render 100 fields in <500ms

### Accessibility Requirements
- All interactive elements must be keyboard accessible
- Proper ARIA labels and roles
- Focus management (visible focus indicators)
- Color contrast ratio ≥4.5:1 (WCAG AA)
- No keyboard traps
- Screen reader announcements for dynamic changes

### Browser Compatibility
- Target: ES6+ (no transpilation needed for modern browsers)
- Graceful degradation for older browsers
- Feature detection (not browser detection)
- Polyfills for missing APIs if needed

---

## Success Metrics

After implementing all phases, the WYSIWYG form builder should achieve:

1. **Functionality**: Support 15+ field types, validation, conditional logic, multi-page forms
2. **UX**: Smooth drag-and-drop, undo/redo, keyboard shortcuts, responsive
3. **Performance**: Render 100+ field forms in <1 second, smooth 60fps animations
4. **Code Quality**: 80%+ test coverage, modular architecture, clear documentation
5. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigable, screen reader friendly
6. **Exports**: 5+ export formats (JSON, HTML, React, Vue, PDF)
7. **User Adoption**: Easy to learn (<5 min), fast to build complex forms (<10 min)

---

## Estimated Effort

**Total**: ~40-60 developer days (assuming 1 experienced developer)

- Phase 1 (Foundation): 5-7 days
- Phase 2 (Field Types): 8-10 days
- Phase 3 (Layout): 6-8 days
- Phase 4 (UX): 5-7 days
- Phase 5 (Data): 6-8 days
- Phase 6 (Logic): 8-10 days
- Phase 7 (Polish): 5-7 days
- Phase 8 (Testing/Docs): 7-10 days

**Recommended Approach**: Implement in phases, shipping incremental improvements. Start with Phase 1 and 2 for MVP+, then iterate based on user feedback.

---

## Conclusion

This roadmap transforms the basic WYSIWYG form builder into a professional-grade tool comparable to commercial solutions (Typeform, JotForm, Google Forms). By following this plan methodically, each improvement builds on the previous, resulting in a powerful, user-friendly, and maintainable form builder.

**Key Principles**:
- Keep code concise and modular
- Follow jsgui3-html conventions rigorously
- Prioritize user experience and accessibility
- Test thoroughly at every step
- Document clearly for future maintainers

**Next Steps**:
1. Review and prioritize phases based on project goals
2. Assign tasks to developers
3. Set up task tracking (GitHub Projects, Jira, etc.)
4. Begin with Phase 1.1 (drag-and-drop) as foundation
5. Iterate with user testing after each phase
