# jsgui3-html Visual Editor Controls Specification

General-purpose controls for building visual editors, IDEs, and creative applications.

---

## Controls Overview

| Control | Category | Priority |
|---------|----------|----------|
| Selection_Handles | Editor | High |
| Snap_Guide_Overlay | Editor | Medium |
| Property_Grid | Editor | High |
| Dockable_Panel_System | Layout | High |
| Document_Tab_Container | Layout | High |
| Dialog | UI | Medium |
| Color_Picker | Input | Medium |
| Font_Picker | Input | Medium |
| **Date_Picker_Progressive** | **Input** | **High** |
| **Calendar** | **Input/Display** | **High** |
| Status_Bar | Layout | Low |
| Anchor_Editor | Input | Medium |
| Dock_Editor | Input | Medium |
| Collection_Editor | Input | Low |
| Undo_Redo_Manager | Utility | High |
| Clipboard_Manager | Utility | Medium |

---

## 1. Selection_Handles

Visual handles for resizing and moving selected controls.

**File:** `controls/organised/2-editor/selection_handles.js`

### Purpose
Wraps a target control with 8 resize handles (N, S, E, W, NE, NW, SE, SW) and provides visual feedback during resize operations. Used by any visual editor that needs control manipulation.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | Control | required | The control to wrap with handles |
| `handle_size` | number | 8 | Size of handle squares in pixels |
| `min_size` | [w, h] | [20, 20] | Minimum target size |
| `max_size` | [w, h] | null | Maximum target size |
| `show_dimensions` | boolean | true | Show size tooltip during resize |
| `maintain_aspect` | boolean | false | Lock aspect ratio |
| `handle_style` | string | 'square' | 'square', 'circle', or 'diamond' |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `resize-start` | `{ handle, initial_size }` | Resize began |
| `resize-move` | `{ handle, size, delta }` | During resize |
| `resize-end` | `{ handle, final_size }` | Resize completed |
| `move-start` | `{ initial_pos }` | Move began |
| `move-end` | `{ final_pos, delta }` | Move completed |

### Usage
```javascript
const handles = new Selection_Handles({
    context,
    target: selected_control,
    handle_size: 8,
    min_size: [50, 30],
    show_dimensions: true
});

handles.on('resize-end', (e) => {
    undo_manager.push(new Resize_Command(target, e.final_size));
});
```

### CSS Classes
- `.selection-handles` - Container
- `.selection-handle` - Individual handle
- `.selection-handle-n`, `.selection-handle-se`, etc. - Directional handles
- `.selection-handle-active` - Currently dragging
- `.selection-dimensions` - Size tooltip

### Dependencies
- `drag_like_events` mixin
- `resizable` mixin patterns

---

## 2. Property_Grid

Categorized property editor with type-specific editors.

**File:** `controls/organised/2-editor/property_grid.js`

### Purpose
A professional property inspector that displays and edits object properties. Supports categorized and alphabetical views, multi-object editing, and extensible type editors.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | object/array | null | Object(s) to edit |
| `schema` | Property_Schema[] | null | Property definitions |
| `view_mode` | string | 'categorized' | 'categorized' or 'alphabetical' |
| `show_description` | boolean | true | Show description panel |
| `show_search` | boolean | true | Enable property search |
| `readonly` | boolean | false | Disable all editing |
| `collapsed_categories` | string[] | [] | Initially collapsed categories |

### Property_Schema Definition
```javascript
{
    name: 'backgroundColor',      // Property key
    display_name: 'Background',   // Display label
    category: 'Appearance',       // Category grouping
    type: 'color',                // Editor type (see below)
    default_value: '#ffffff',
    description: 'Control background color',
    readonly: false,
    visible: true,                // Can be function: (obj) => boolean
    enum_values: null,            // For 'enum' type
    min: null, max: null,         // For 'number' type
    step: 1                       // For 'number' type
}
```

### Built-in Editor Types
| Type | Editor Control | Notes |
|------|---------------|-------|
| `string` | Text_Input | Single line |
| `text` | Text_Area | Multi-line |
| `number` | Number_Spinner | With min/max/step |
| `boolean` | Checkbox | Toggle |
| `enum` | Dropdown | From enum_values |
| `color` | Color_Picker | Opens picker dialog |
| `font` | Font_Picker | Opens font dialog |
| `size` | Size_Editor | [width, height] |
| `location` | Location_Editor | [x, y] |
| `anchor` | Anchor_Editor | Visual 4-point editor |
| `dock` | Dock_Editor | Visual 6-position editor |
| `collection` | Collection_Button | Opens collection editor |
| `object` | Expandable | Sub-properties |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `property-change` | `{ name, old_value, new_value, target }` | Value changed |
| `property-changing` | `{ name, new_value, cancel() }` | Before change (cancelable) |
| `category-toggle` | `{ category, collapsed }` | Category expanded/collapsed |

### Methods
| Method | Description |
|--------|-------------|
| `set_target(obj)` | Set object to edit |
| `set_targets(arr)` | Set multiple objects (shows common props) |
| `refresh()` | Refresh all values from target |
| `get_value(name)` | Get current property value |
| `set_value(name, val)` | Set property value |
| `register_editor(type, EditorClass)` | Add custom editor type |
| `expand_category(name)` | Expand a category |
| `collapse_category(name)` | Collapse a category |
| `filter(text)` | Filter visible properties |

### Usage
```javascript
const grid = new Property_Grid({
    context,
    target: my_control,
    schema: control_metadata.properties,
    view_mode: 'categorized'
});

grid.on('property-change', (e) => {
    undo_manager.push(new Property_Command(e.target, e.name, e.old_value, e.new_value));
});
```

### CSS Classes
- `.property-grid` - Container
- `.property-grid-toolbar` - Search/view toggle bar
- `.property-grid-category` - Category header
- `.property-grid-category-collapsed` - Collapsed state
- `.property-grid-row` - Property row
- `.property-grid-label` - Property name
- `.property-grid-editor` - Editor container
- `.property-grid-description` - Description panel

---

## 3. Dockable_Panel_System

Manages dockable, floatable, and tabbable panels like VS Code/Visual Studio tool windows.

**File:** `controls/organised/2-layout/dockable_panel_system.js`

### Purpose
Provides a complete docking infrastructure for IDE-style applications. Panels can dock to edges, float as windows, combine into tab groups, auto-hide, and split.

### Architecture
```
Dockable_Panel_System
├── Dock_Zone (left)
│   └── Dock_Tab_Group
│       ├── Dockable_Panel (Solution Explorer)
│       └── Dockable_Panel (Team Explorer)  
├── Dock_Zone (right)
│   └── Dock_Tab_Group
│       └── Dockable_Panel (Properties)
├── Dock_Zone (bottom)
│   └── Dock_Split_Container
│       ├── Dock_Tab_Group (Output, Error List)
│       └── Dock_Tab_Group (Terminal)
├── Center_Content_Area
│   └── (Document tabs go here)
└── Auto_Hide_Bar (each edge)
```

### Sub-Controls

#### Dockable_Panel
Individual panel that can be docked, floated, or tab-grouped.

```javascript
const panel = new Dockable_Panel({
    context,
    title: 'Properties',
    icon: '⚙️',
    can_float: true,
    can_close: true,
    can_auto_hide: true,
    min_size: [200, 100]
});
panel.add(property_grid);
```

#### Dock_Tab_Group
Container that holds multiple panels as tabs.

#### Dock_Zone  
Edge region (left, right, top, bottom) that accepts docked panels.

#### Auto_Hide_Bar
Edge strip showing collapsed panel icons.

### Constructor Options (System)
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allow_floating` | boolean | true | Panels can float |
| `allow_tab_groups` | boolean | true | Panels can tab together |
| `allow_auto_hide` | boolean | true | Panels can auto-hide |
| `allow_split` | boolean | true | Zones can split |
| `dock_indicator_style` | string | 'overlay' | 'overlay' or 'highlight' |
| `save_layout_key` | string | null | localStorage key for layout |

### Panel Dock Positions
| Position | Description |
|----------|-------------|
| `left` | Left edge of container |
| `right` | Right edge of container |
| `top` | Top edge of container |
| `bottom` | Bottom edge of container |
| `center` | Tab with existing center content |
| `float` | Floating window |
| `auto-hide-left` | Collapsed to left edge |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `panel-dock` | `{ panel, position, zone }` | Panel docked |
| `panel-float` | `{ panel, position, size }` | Panel floated |
| `panel-close` | `{ panel }` | Panel closed |
| `panel-auto-hide` | `{ panel, edge }` | Panel auto-hidden |
| `layout-change` | `{ layout }` | Any layout change |
| `drag-start` | `{ panel }` | Panel drag began |
| `drag-preview` | `{ target_zone, position }` | Dock preview showing |

### Methods
| Method | Description |
|--------|-------------|
| `add_panel(panel, position)` | Add panel at position |
| `remove_panel(panel)` | Remove panel |
| `dock(panel, position, zone?)` | Dock panel |
| `float(panel, pos?, size?)` | Float panel |
| `auto_hide(panel, edge)` | Auto-hide panel |
| `show_panel(panel)` | Bring panel to front |
| `get_layout()` | Get serializable layout |
| `set_layout(layout)` | Restore layout |
| `save_layout()` | Save to localStorage |
| `restore_layout()` | Restore from localStorage |

### Dock Preview Overlay
During drag, shows visual indicators for dock zones:
- Overlay arrows at each edge
- Highlight of target zone
- Tab insertion indicator when over tab group

### Layout Serialization Format
```javascript
{
    version: 1,
    zones: {
        left: { size: 250, panels: [...] },
        right: { size: 300, panels: [...] },
        bottom: { size: 200, panels: [...] }
    },
    floating: [
        { id: 'panel1', pos: [100, 100], size: [400, 300] }
    ],
    auto_hidden: {
        left: ['panel2'],
        right: []
    }
}
```

### CSS Classes
- `.dockable-panel-system` - Root container
- `.dock-zone`, `.dock-zone-left`, etc. - Edge zones
- `.dock-tab-group` - Tab container
- `.dock-tab` - Individual tab
- `.dock-tab-active` - Active tab
- `.dockable-panel` - Panel container
- `.dockable-panel-header` - Panel title bar
- `.dockable-panel-floating` - Floating state
- `.dock-preview-overlay` - Drag preview
- `.dock-indicator` - Dock position indicator
- `.auto-hide-bar` - Collapsed panel strip
- `.auto-hide-tab` - Collapsed panel icon

### Dependencies
- `Window` control (for floating)
- `dragable` mixin
- `Split_Pane` (for split zones)

---

## 4. Document_Tab_Container

Tabbed document interface for multi-document editing.

**File:** `controls/organised/2-layout/document_tab_container.js`

### Purpose
Central area of an IDE/editor that displays open documents as tabs. Supports tab reordering, close buttons, overflow handling, split views, and modified indicators.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `closeable` | boolean | true | Tabs can be closed |
| `reorderable` | boolean | true | Tabs can be reordered by drag |
| `overflow_mode` | string | 'scroll' | 'scroll', 'dropdown', or 'wrap' |
| `show_icons` | boolean | true | Show file type icons |
| `confirm_close_modified` | boolean | true | Confirm before closing modified |
| `allow_split` | boolean | true | Allow horizontal/vertical split |
| `max_tab_width` | number | 200 | Maximum tab width in pixels |
| `context_menu` | boolean | true | Enable right-click menu |

### Tab Options
```javascript
tab_container.add_tab({
    id: 'file1',
    title: 'Form1.cs',
    icon: '📄',
    content: editor_control,
    tooltip: '/src/Forms/Form1.cs',
    closeable: true,
    pinned: false,
    modified: false
});
```

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `tab-select` | `{ id, tab }` | Tab selected |
| `tab-close` | `{ id, tab, cancel() }` | Tab closing (cancelable) |
| `tab-closed` | `{ id }` | Tab was closed |
| `tab-reorder` | `{ id, from_index, to_index }` | Tab moved |
| `tab-modified` | `{ id, modified }` | Modified state changed |
| `tab-context-menu` | `{ id, tab, event }` | Right-click on tab |
| `split` | `{ direction, tabs }` | View was split |

### Methods
| Method | Description |
|--------|-------------|
| `add_tab(options)` | Add new tab |
| `remove_tab(id)` | Remove tab by id |
| `select_tab(id)` | Select tab by id |
| `get_tab(id)` | Get tab control |
| `get_active_tab()` | Get currently active tab |
| `get_all_tabs()` | Get all tab ids |
| `set_modified(id, bool)` | Set modified indicator |
| `set_title(id, title)` | Update tab title |
| `pin_tab(id)` | Pin tab to left |
| `unpin_tab(id)` | Unpin tab |
| `close_all()` | Close all tabs |
| `close_others(id)` | Close all except id |
| `close_to_right(id)` | Close tabs to right |
| `split_horizontal()` | Split view horizontally |
| `split_vertical()` | Split view vertically |
| `unsplit()` | Remove split |

### Context Menu Items
- Close
- Close All
- Close Others
- Close Tabs to the Right
- Pin/Unpin
- Copy Path
- Open Containing Folder
- Split Right / Split Down

### CSS Classes
- `.document-tab-container` - Root
- `.document-tabs-bar` - Tab strip
- `.document-tab` - Individual tab
- `.document-tab-active` - Selected tab
- `.document-tab-modified` - Has unsaved changes (shows •)
- `.document-tab-pinned` - Pinned tab
- `.document-tab-icon` - File icon
- `.document-tab-title` - Tab text
- `.document-tab-close` - Close button
- `.document-tabs-overflow` - Overflow indicator/menu
- `.document-content` - Content area
- `.document-split-handle` - Split divider

---

## 5. Undo_Redo_Manager

Command pattern implementation for undo/redo operations.

**File:** `utils/undo_redo_manager.js`

### Purpose
Provides a robust undo/redo system using the Command pattern. Essential for any editor application. Supports transactions (grouping), maximum stack size, and persistence.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `max_stack_size` | number | 100 | Maximum undo levels |
| `merge_timeout` | number | 500 | ms to merge same-type commands |
| `persist_key` | string | null | localStorage key |

### Command Interface
```javascript
class Command {
    constructor(description) {
        this.description = description;
        this.timestamp = Date.now();
    }
    
    execute() {
        // Perform the action
        // Return true if successful
    }
    
    undo() {
        // Reverse the action
    }
    
    redo() {
        // Re-perform (default: calls execute)
        return this.execute();
    }
    
    merge(other_command) {
        // Optional: merge with another command
        // Return true if merged, false if not
        return false;
    }
}
```

### Built-in Commands
| Command | Description |
|---------|-------------|
| `Property_Command` | Change a property value |
| `Move_Command` | Move control position |
| `Resize_Command` | Resize control |
| `Add_Command` | Add control to container |
| `Remove_Command` | Remove control from container |
| `Composite_Command` | Group of commands |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `execute` | `{ command }` | Command executed |
| `undo` | `{ command }` | Command undone |
| `redo` | `{ command }` | Command redone |
| `change` | `{ can_undo, can_redo }` | Stack changed |
| `clear` | `{}` | Stack cleared |

### Methods
| Method | Description |
|--------|-------------|
| `execute(command)` | Execute and push to undo stack |
| `undo()` | Undo last command |
| `redo()` | Redo last undone command |
| `can_undo()` | Check if undo is possible |
| `can_redo()` | Check if redo is possible |
| `clear()` | Clear all stacks |
| `begin_transaction(name)` | Start grouping commands |
| `end_transaction()` | End group, push as single command |
| `abort_transaction()` | Cancel and undo transaction commands |
| `get_undo_description()` | Get description of next undo |
| `get_redo_description()` | Get description of next redo |
| `get_undo_stack()` | Get copy of undo stack |
| `get_redo_stack()` | Get copy of redo stack |
| `save()` | Persist to localStorage |
| `restore()` | Restore from localStorage |

### Usage Examples

**Basic usage:**
```javascript
const undo_manager = new Undo_Redo_Manager({ max_stack_size: 50 });

// Execute a command
undo_manager.execute(new Property_Command(control, 'width', 100, 200));

// Undo
if (undo_manager.can_undo()) {
    undo_manager.undo();
}

// Redo
if (undo_manager.can_redo()) {
    undo_manager.redo();
}
```

**Transaction (grouping):**
```javascript
// Group multiple commands as one undo action
undo_manager.begin_transaction('Move and Resize');
undo_manager.execute(new Move_Command(ctrl, old_pos, new_pos));
undo_manager.execute(new Resize_Command(ctrl, old_size, new_size));
undo_manager.end_transaction();

// Single undo restores both
undo_manager.undo();
```

**Command merging (for continuous actions like typing):**
```javascript
class Type_Command extends Command {
    constructor(editor, char, position) {
        super(`Type '${char}'`);
        this.editor = editor;
        this.chars = char;
        this.position = position;
    }
    
    merge(other) {
        if (other instanceof Type_Command && 
            other.position === this.position + this.chars.length &&
            Date.now() - this.timestamp < 500) {
            this.chars += other.chars;
            return true;
        }
        return false;
    }
}
```

---

*Document version: 1.0 - Expanded core controls*

---

## 6. Dialog

Modal dialog base class for consistent dialog behavior.

**File:** `controls/organised/2-ui/dialog.js`

### Purpose
Base class for all modal dialogs. Handles overlay, keyboard navigation (Escape to close, Tab trap), button layout, and positioning.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | '' | Dialog title |
| `width` | number/string | 'auto' | Dialog width |
| `height` | number/string | 'auto' | Dialog height |
| `modal` | boolean | true | Show overlay, block interaction |
| `closeable` | boolean | true | Show X button |
| `draggable` | boolean | true | Can drag title bar |
| `buttons` | Button_Def[] | null | Bottom button row |
| `center` | boolean | true | Center in viewport |
| `escape_closes` | boolean | true | Escape key closes |
| `click_outside_closes` | boolean | false | Click overlay closes |

### Button Definition
```javascript
{ 
    label: 'OK', 
    type: 'primary', // 'primary', 'secondary', 'danger'
    action: 'ok',    // Raised as dialog-action event
    close: true      // Close after click
}
```

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `dialog-open` | `{}` | Dialog opened |
| `dialog-close` | `{ action }` | Dialog closing |
| `dialog-action` | `{ action }` | Button clicked |

### Methods
| Method | Description |
|--------|-------------|
| `open()` | Show dialog |
| `close(action?)` | Close dialog |
| `set_title(title)` | Update title |
| `get_content()` | Get content container |
| `shake()` | Attention shake animation |

### Usage
```javascript
class My_Dialog extends Dialog {
    constructor(options) {
        super({
            ...options,
            title: 'Confirm Delete',
            buttons: [
                { label: 'Delete', type: 'danger', action: 'delete', close: true },
                { label: 'Cancel', type: 'secondary', action: 'cancel', close: true }
            ]
        });
        this.get_content().add('Are you sure you want to delete this item?');
    }
}

const dlg = new My_Dialog({ context });
dlg.on('dialog-action', (e) => {
    if (e.action === 'delete') { /* do delete */ }
});
dlg.open();
```

---

## 7. Color_Picker

Color selection control with multiple input modes.

**File:** `controls/organised/2-input/color_picker.js`

### Purpose
Complete color picker for use inline or in dialogs. Supports HEX, RGB, HSL input modes, preset palettes, and optional alpha channel.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | string | '#000000' | Initial color (hex) |
| `mode` | string | 'full' | 'full', 'compact', or 'palette' |
| `show_alpha` | boolean | false | Enable alpha channel |
| `show_inputs` | boolean | true | Show text inputs |
| `presets` | string[] | [...] | Preset color palette |
| `recent_count` | number | 8 | Recent colors to remember |
| `format` | string | 'hex' | Output format: 'hex', 'rgb', 'hsl' |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `change` | `{ value, format }` | Color changed |
| `input` | `{ value }` | During interaction (live) |

### Methods
| Method | Description |
|--------|-------------|
| `get_value(format?)` | Get color in format |
| `set_value(color)` | Set color (any format) |
| `get_rgb()` | Get as [r, g, b] |
| `get_hsl()` | Get as [h, s, l] |
| `add_recent(color)` | Add to recents |

### CSS Classes
- `.color-picker` - Root
- `.color-picker-saturation` - Saturation/brightness square
- `.color-picker-hue` - Hue slider
- `.color-picker-alpha` - Alpha slider
- `.color-picker-preview` - Current/previous preview
- `.color-picker-inputs` - Input fields container
- `.color-picker-presets` - Preset palette
- `.color-picker-recents` - Recent colors

---

## 8. Font_Picker

Font selection control.

**File:** `controls/organised/2-input/font_picker.js`

### Purpose
Font family, style, size, and effects selection. Can query available system fonts or use provided list.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | Font_Value | null | Initial font |
| `families` | string[] | null | Available families (null = system) |
| `sizes` | number[] | [8,9,10,11,12,14,16,18,20,24,28,32,36,48,72] | Size options |
| `show_preview` | boolean | true | Show preview text |
| `show_effects` | boolean | true | Strikethrough, underline |
| `preview_text` | string | 'AaBbYyZz' | Preview sample text |

### Font_Value Object
```javascript
{
    family: 'Arial',
    size: 12,
    style: 'normal',     // 'normal', 'italic'
    weight: 'normal',    // 'normal', 'bold', 'lighter', or 100-900
    strikethrough: false,
    underline: false
}
```

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `change` | `{ value: Font_Value }` | Font changed |

### Methods
| Method | Description |
|--------|-------------|
| `get_value()` | Get Font_Value |
| `set_value(font)` | Set font |
| `get_css()` | Get as CSS properties object |

---

## 9. Date_Picker_Progressive

**⚠️ HIGH PRIORITY: Progressive Enhancement Date Picker System**

Custom date picker controls following the jsgui3-html progressive enhancement philosophy. The native `<input type="date">` is the foundation, with layered enhancements that preserve accessibility and functionality at every tier.

**Files:**
- `controls/organised/2-input/date_picker_progressive.js` - Base progressive control
- `controls/organised/2-input/date_picker_dropdown.js` - Dropdown calendar variant
- `controls/organised/2-input/date_picker_inline.js` - Inline calendar variant
- `controls/organised/2-input/date_picker_range.js` - Date range picker

### Progressive Enhancement Tiers

| Tier | Description | Behavior |
|------|-------------|----------|
| **0** | Native `<input type="date">` | Browser-native date input, works without JS |
| **1** | Styled native | CSS-enhanced native input with tokens |
| **2** | Activated native | jsgui bindings on native input, data models |
| **3** | Custom dropdown | Native input + dropdown calendar popup |
| **4** | Full custom | Complete custom calendar UI |

### Purpose

Provides a robust, accessible date picking experience that:
- **Works without JavaScript** (Tier 0)
- **Progressive activation** - enhance only when needed
- **MVVM/MVC compatible** - integrates with `Data_Object`, bindings, and computed properties
- **Locale-aware** - uses `Transformations.date` for i18n formatting
- **Validation-integrated** - min/max/disabled dates with `Validation_State`

### Architecture

```
Date_Picker_Progressive
├── data.model          ← Raw data: { date: Date, min_date, max_date }
├── view.data.model     ← UI data: { formatted_date, display_format, locale }
├── view.ui             ← Layout: { mode: 'native'|'dropdown'|'inline' }
├── native_input        ← <input type="date"> (always rendered for SSR)
├── calendar_popup      ← Calendar control (Tier 3+)
└── validation          ← Validation_State
```

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | Date/string | null | Initial date |
| `min` | Date/string | null | Minimum selectable date |
| `max` | Date/string | null | Maximum selectable date |
| `format` | string | 'YYYY-MM-DD' | Display format |
| `locale` | string | 'en-US' | Locale for formatting |
| `mode` | string | 'auto' | 'native', 'dropdown', 'inline', 'auto' |
| `first_day_of_week` | number | 0 | 0=Sunday, 1=Monday |
| `disabled_dates` | Date[]/fn | null | Dates that cannot be selected |
| `disabled_days` | number[] | null | Days of week [0-6] to disable |
| `show_week_numbers` | boolean | false | Show week numbers |
| `show_today_button` | boolean | true | Show "Today" button |
| `show_clear_button` | boolean | true | Show clear button |
| `calendar_position` | string | 'auto' | 'auto', 'above', 'below' |
| `readonly` | boolean | false | Prevent user changes |
| `required` | boolean | false | Validation required |

### MVVM Integration

The date picker uses full MVVM architecture with the jsgui3-html binding system:

```javascript
class Date_Picker_Progressive extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        super(spec);
        ensure_control_models(this, spec);
        
        // Data model - raw application data
        this.data.model.set('date', spec.value || null);
        this.data.model.set('min_date', this._parse_date(spec.min));
        this.data.model.set('max_date', this._parse_date(spec.max));
        
        // View model - UI representation
        this.view.data.model.set('formatted_date', '');
        this.view.data.model.set('display_format', spec.format || 'YYYY-MM-DD');
        this.view.data.model.set('locale', spec.locale || 'en-US');
        this.view.data.model.set('calendar_open', false);
        
        // Bind date → formatted_date with locale-aware transform
        this.bind({
            'date': {
                to: 'formatted_date',
                transform: (date) => {
                    if (!date) return '';
                    const locale = this.view.data.model.get('locale');
                    const format = this.view.data.model.get('display_format');
                    return Transformations.date.format_iso_to_locale(
                        Transformations.date.toISO(date),
                        locale,
                        format
                    );
                },
                reverse: (str) => {
                    if (!str) return null;
                    const locale = this.view.data.model.get('locale');
                    const format = this.view.data.model.get('display_format');
                    const iso = Transformations.date.parse_i18n_to_iso(str, locale, format);
                    return iso ? new Date(iso) : null;
                }
            }
        });
        
        // Computed: is_valid based on min/max constraints
        this.computed(
            [this.data.model],
            ['date', 'min_date', 'max_date'],
            (date, min, max) => {
                if (!date) return !spec.required;
                if (min && date < min) return false;
                if (max && date > max) return false;
                return true;
            },
            { propertyName: 'is_valid', target: this.view.data.model }
        );
        
        this._compose_picker();
    }
}
```

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `change` | `{ value: Date, old_value: Date }` | Date changed |
| `input` | `{ value: string }` | Text input changed (before parsing) |
| `calendar-open` | `{}` | Calendar popup opened |
| `calendar-close` | `{}` | Calendar popup closed |
| `validation-change` | `{ valid, message }` | Validation state changed |

### Methods

| Method | Description |
|--------|-------------|
| `get_value()` | Get current date as Date object |
| `set_value(date)` | Set date (Date, string, or ISO) |
| `get_iso_value()` | Get date as ISO string |
| `get_formatted_value()` | Get date in display format |
| `clear()` | Clear the date |
| `open_calendar()` | Open calendar popup |
| `close_calendar()` | Close calendar popup |
| `go_to_today()` | Navigate calendar to today |
| `is_date_enabled(date)` | Check if date is selectable |
| `refresh()` | Refresh from data model |

### Server-Side Rendering

The control renders a native input for SSR, with activation on client:

```html
<!-- SSR output (Tier 0/1/2) -->
<div class="date-picker-progressive" data-jsgui-id="dp_123"
     data-jsgui-type-name="date_picker_progressive"
     data-jsgui-fields="{'mode':'dropdown'}">
    <input type="date" 
           name="start_date"
           value="2024-01-15"
           min="2024-01-01"
           max="2024-12-31"
           class="jsgui-enhance">
    <button type="button" class="date-picker-toggle" aria-label="Open calendar">📅</button>
</div>
```

### CSS Classes

- `.date-picker-progressive` - Root container
- `.date-picker-input` - Input field wrapper
- `.date-picker-native` - Native input (always present)
- `.date-picker-toggle` - Calendar toggle button
- `.date-picker-calendar` - Calendar popup
- `.date-picker-inline` - Inline calendar mode
- `.date-picker-open` - Calendar is open
- `.date-picker-disabled` - Control disabled
- `.date-picker-invalid` - Failed validation
- `.date-picker-has-value` - Has selected date

### Keyboard Support

| Key | Action |
|-----|--------|
| `Enter` | Open/close calendar, select date |
| `Escape` | Close calendar |
| `Arrow keys` | Navigate calendar |
| `Home` | Go to first day of month |
| `End` | Go to last day of month |
| `Page Up/Down` | Previous/next month |
| `Ctrl+Page Up/Down` | Previous/next year |

### Usage Examples

**Basic with MVVM binding:**
```javascript
const date_picker = new Date_Picker_Progressive({
    context,
    value: new Date('2024-01-15'),
    min: '2024-01-01',
    max: '2024-12-31',
    format: 'DD/MM/YYYY',
    locale: 'en-GB',
    mode: 'dropdown'
});

// Watch for changes
date_picker.watch(date_picker.data.model, 'date', (new_date) => {
    console.log('Selected:', new_date);
});
```

**In a form with validation:**
```javascript
const form_model = new Data_Object({
    start_date: null,
    end_date: null
});

const start_picker = new Date_Picker_Progressive({
    context,
    required: true,
    mode: 'dropdown'
});

// Bind to form model
start_picker.data.model.on('change', (e) => {
    if (e.name === 'date') {
        form_model.start_date = e.value;
    }
});
```

---

## 10. Calendar

**⚠️ HIGH PRIORITY: Powerful & Flexible Calendar Control**

A full-featured calendar control for date display and selection. Designed for maximum flexibility with different data models (MVC/MVVM), view modes, and use cases.

**Files:**
- `controls/organised/2-input/calendar.js` - Main calendar control
- `controls/organised/2-input/calendar_month_view.js` - Month grid view
- `controls/organised/2-input/calendar_year_view.js` - Year grid view
- `controls/organised/2-input/calendar_decade_view.js` - Decade navigation

### Purpose

Provides a calendar UI component that:
- **Works with MVC or MVVM** - flexible data model architecture
- **Multiple view modes** - month, year, decade
- **Selection modes** - single, multiple, range
- **Event/appointment display** - for calendar applications
- **Locale-aware** - internationalized day/month names
- **Accessible** - ARIA roles, keyboard navigation

### Data Model Flexibility

The Calendar control supports three data binding approaches:

#### Approach 1: Simple Value (MVC-style)
```javascript
const calendar = new Calendar({
    context,
    value: new Date()
});

// MVC: direct property access
calendar.value = new Date('2024-06-15');

// Events for controller
calendar.on('change', (e) => {
    controller.handle_date_change(e.value);
});
```

#### Approach 2: External Data_Object (MVVM)
```javascript
const app_model = new Data_Object({
    selected_date: new Date(),
    highlighted_dates: []
});

const calendar = new Calendar({
    context,
    data_model: app_model,          // External model
    value_property: 'selected_date' // Property to bind
});

// Changes to app_model.selected_date update the calendar
app_model.selected_date = new Date('2024-07-20');
```

#### Approach 3: Full MVVM with Bindings
```javascript
class Event_Calendar extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        ensure_control_models(this, spec);
        
        // Setup models
        this.data.model.set('selected_date', null);
        this.data.model.set('events', []);
        
        this.view.data.model.set('display_month', new Date());
        this.view.data.model.set('formatted_events', []);
        
        // Computed: events for displayed month
        this.computed(
            [this.data.model, this.view.data.model],
            ['events', 'display_month'],
            (events, month) => {
                return events.filter(e => 
                    e.date.getMonth() === month.getMonth() &&
                    e.date.getFullYear() === month.getFullYear()
                );
            },
            { propertyName: 'month_events', target: this.view.data.model }
        );
        
        // Calendar control receives view model
        this.calendar = new Calendar({
            context,
            view_model: this.view.data.model,
            value_property: 'selected_date',
            events_property: 'month_events'
        });
    }
}
```

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | Date/Date[] | null | Selected date(s) |
| `display_date` | Date | today | Initially displayed month |
| `selection_mode` | string | 'single' | 'single', 'multiple', 'range', 'none' |
| `view_mode` | string | 'month' | 'month', 'year', 'decade' |
| `min_date` | Date | null | Earliest selectable date |
| `max_date` | Date | null | Latest selectable date |
| `first_day_of_week` | number | 0 | 0=Sunday, 1=Monday, etc. |
| `locale` | string | 'en-US' | Locale for day/month names |
| `show_week_numbers` | boolean | false | Show week numbers column |
| `show_other_months` | boolean | true | Show days from adjacent months |
| `selectable_other_months` | boolean | false | Allow selecting other month days |
| `show_today` | boolean | true | Highlight today |
| `show_navigation` | boolean | true | Show prev/next buttons |
| `show_header` | boolean | true | Show month/year header |
| `show_day_names` | boolean | true | Show day name row |
| `disabled_dates` | Date[]/fn | null | Non-selectable dates |
| `disabled_days` | number[] | null | Non-selectable days of week |
| `highlighted_dates` | object[] | null | Special date highlights |
| `event_data` | array | null | Events to display |
| `data_model` | Data_Object | null | External model (MVVM) |
| `value_property` | string | 'value' | Property name in data_model |
| `compact` | boolean | false | Compact display mode |

### View Modes

#### Month View (default)
Standard month grid with day cells.

```
     January 2024
 Su Mo Tu We Th Fr Sa
     1  2  3  4  5  6
  7  8  9 10 11 12 13
 14 15 16 17 18 19 20
 21 22 23 24 25 26 27
 28 29 30 31
```

#### Year View
Grid of months for year selection.

```
         2024
 Jan  Feb  Mar  Apr
 May  Jun  Jul  Aug
 Sep  Oct  Nov  Dec
```

#### Decade View
Grid of years for decade selection.

```
       2020-2029
 2020 2021 2022 2023
 2024 2025 2026 2027
 2028 2029
```

### Selection Modes

| Mode | Behavior |
|------|----------|
| `single` | One date at a time |
| `multiple` | Multiple individual dates |
| `range` | Start and end date (contiguous) |
| `none` | Display only, no selection |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `change` | `{ value, old_value }` | Selection changed |
| `date-click` | `{ date, cell }` | Date cell clicked |
| `date-hover` | `{ date, cell }` | Mouse over date |
| `month-change` | `{ month, year }` | Displayed month changed |
| `view-change` | `{ view_mode }` | View mode changed |
| `range-start` | `{ date }` | Range selection started |
| `range-end` | `{ start, end }` | Range selection complete |

### Methods

| Method | Description |
|--------|-------------|
| `get_value()` | Get selected date(s) |
| `set_value(date)` | Set selected date(s) |
| `clear()` | Clear selection |
| `go_to_date(date)` | Navigate to show date |
| `go_to_today()` | Navigate to today |
| `next_month()` | Go to next month |
| `prev_month()` | Go to previous month |
| `next_year()` | Go to next year |
| `prev_year()` | Go to previous year |
| `set_view_mode(mode)` | Change view mode |
| `get_display_date()` | Get currently displayed month |
| `refresh()` | Re-render calendar |
| `get_cell(date)` | Get cell control for date |
| `is_date_selectable(date)` | Check if date can be selected |
| `add_event(event)` | Add calendar event |
| `remove_event(id)` | Remove calendar event |
| `get_events_for_date(date)` | Get events on date |

### Highlighted Dates

Mark specific dates with custom styling:

```javascript
const calendar = new Calendar({
    context,
    highlighted_dates: [
        { date: new Date('2024-01-01'), class: 'holiday', label: 'New Year' },
        { date: new Date('2024-12-25'), class: 'holiday', label: 'Christmas' },
        { 
            date: new Date('2024-02-14'), 
            class: 'special',
            dot_color: '#ff0000'
        }
    ]
});
```

### Calendar Events

For appointment/event display:

```javascript
const calendar = new Calendar({
    context,
    event_data: [
        {
            id: 'evt_1',
            title: 'Team Meeting',
            date: new Date('2024-01-15'),
            end_date: new Date('2024-01-15'),
            color: '#4285f4',
            all_day: true
        },
        {
            id: 'evt_2',
            title: 'Project Deadline',
            date: new Date('2024-01-20'),
            color: '#ea4335'
        }
    ]
});
```

### CSS Classes

- `.calendar` - Root container
- `.calendar-header` - Navigation header
- `.calendar-title` - Month/year display
- `.calendar-nav-prev` - Previous button
- `.calendar-nav-next` - Next button
- `.calendar-grid` - Day grid
- `.calendar-day-names` - Day name row
- `.calendar-day-name` - Individual day name
- `.calendar-weeks` - Week rows container
- `.calendar-week` - Single week row
- `.calendar-week-number` - Week number cell
- `.calendar-cell` - Day cell
- `.calendar-cell-today` - Today's date
- `.calendar-cell-selected` - Selected date
- `.calendar-cell-range` - In selection range
- `.calendar-cell-range-start` - Range start
- `.calendar-cell-range-end` - Range end
- `.calendar-cell-other-month` - Days from other months
- `.calendar-cell-disabled` - Non-selectable
- `.calendar-cell-highlighted` - Custom highlight
- `.calendar-event` - Event indicator
- `.calendar-event-dot` - Event dot marker

### MVVM Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Application Data Model (data.model)                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ selected_date: Date                                     ││
│  │ events: Event[]                                         ││
│  │ min_date: Date                                          ││
│  │ max_date: Date                                          ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────┘
                           │ bind / computed
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  View Data Model (view.data.model)                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ display_month: Date                                     ││
│  │ view_mode: 'month' | 'year' | 'decade'                  ││
│  │ formatted_month_name: string                            ││
│  │ visible_events: Event[]  (computed)                     ││
│  │ is_first_month: boolean  (computed: min check)          ││
│  │ is_last_month: boolean   (computed: max check)          ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────┘
                           │ watch / DOM update
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Calendar Control (View)                                    │
│  ┌──────────┐ ┌───────────────────────┐ ┌─────────────────┐ │
│  │ Header   │ │  Month Grid           │ │ Events Panel    │ │
│  │ (nav)    │ │  (42 cells)           │ │ (optional)      │ │
│  └──────────┘ └───────────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Accessibility

| Feature | Implementation |
|---------|----------------|
| Role | `role="grid"` on calendar, `role="gridcell"` on days |
| Selected | `aria-selected="true"` on selected dates |
| Disabled | `aria-disabled="true"` on non-selectable |
| Labels | `aria-label` with full date on each cell |
| Current | `aria-current="date"` on today |
| Live region | Announce month changes |

### Usage Examples

**Simple date picker calendar:**
```javascript
const calendar = new Calendar({
    context,
    selection_mode: 'single',
    show_today: true
});

calendar.on('change', (e) => {
    console.log('Selected:', e.value);
});
```

**Range picker for booking:**
```javascript
const range_calendar = new Calendar({
    context,
    selection_mode: 'range',
    min_date: new Date(),
    disabled_days: [0, 6], // No weekends
    highlighted_dates: booked_dates.map(d => ({
        date: d,
        class: 'booked'
    }))
});

range_calendar.on('range-end', (e) => {
    booking_model.set('check_in', e.start);
    booking_model.set('check_out', e.end);
});
```

**MVVM with shared form model:**
```javascript
// Shared application model
const booking_form = new Data_Object({
    arrival_date: null,
    departure_date: null,
    guests: 1
});

// Calendar bound to model
const arrival_calendar = new Calendar({
    context,
    data_model: booking_form,
    value_property: 'arrival_date'
});

// Changes sync automatically
booking_form.arrival_date = new Date('2024-03-01');
// Calendar updates to show March 2024 with 1st selected
```

---

## 11. Snap_Guide_Overlay

Visual alignment guides during drag/resize operations.

**File:** `controls/organised/2-editor/snap_guide_overlay.js`

### Purpose
Shows alignment guides when dragging controls. Snaps to edges and centers of sibling controls, container margins, and grid.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | Control | required | The design surface |
| `snap_threshold` | number | 5 | Pixels to trigger snap |
| `show_distances` | boolean | true | Show distance labels |
| `guide_color` | string | '#ff00ff' | Guide line color |
| `snap_to_grid` | boolean | true | Snap to grid |
| `grid_size` | number | 8 | Grid spacing |
| `snap_to_controls` | boolean | true | Snap to other controls |
| `snap_to_margins` | boolean | true | Snap to container margins |

### Methods
| Method | Description |
|--------|-------------|
| `start_drag(control)` | Begin showing guides for control |
| `update(position)` | Update during drag |
| `end_drag()` | Hide guides |
| `get_snapped_position(pos)` | Get position with snap applied |
| `set_excluded(controls)` | Controls to ignore |

### Guide Types
- **Edge guides:** Align left/right/top/bottom edges
- **Center guides:** Align horizontal/vertical centers
- **Spacing guides:** Equal spacing between controls
- **Margin guides:** Container padding alignment
- **Grid guides:** Snap to grid intersections

### CSS Classes
- `.snap-guide-overlay` - Container
- `.snap-guide-h` - Horizontal guide line
- `.snap-guide-v` - Vertical guide line
- `.snap-guide-distance` - Distance label

---

## 12. Anchor_Editor

Visual editor for anchor property (4 toggle anchors).

**File:** `controls/organised/2-input/anchor_editor.js`

### Purpose
Compact visual editor showing a rectangle with 4 clickable anchor points (Top, Bottom, Left, Right). Used in Property_Grid.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | Anchor_Value | {top:true,left:true,...} | Initial anchors |
| `size` | number | 50 | Editor size in pixels |

### Anchor_Value
```javascript
{ top: boolean, bottom: boolean, left: boolean, right: boolean }
```

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `change` | `{ value: Anchor_Value }` | Anchor changed |

---

## 13. Dock_Editor

Visual editor for dock property (6 positions).

**File:** `controls/organised/2-input/dock_editor.js`

### Purpose
Compact visual editor with 6 buttons arranged to show dock positions: None (center), Left, Right, Top, Bottom, Fill.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | string | 'none' | 'none','left','right','top','bottom','fill' |
| `size` | number | 60 | Editor size in pixels |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `change` | `{ value: string }` | Dock changed |

---

## 14. Collection_Editor

Generic list editor for collection properties.

**File:** `controls/organised/2-input/collection_editor.js`

### Purpose
Editor for array/list properties. Shows items in a list with Add/Remove/Move buttons and a property grid for the selected item.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | array | [] | Initial items |
| `item_schema` | Property_Schema[] | null | Schema for items |
| `item_type` | string | 'object' | Type of items |
| `orderable` | boolean | true | Allow reordering |
| `min_items` | number | 0 | Minimum items |
| `max_items` | number | null | Maximum items |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `change` | `{ value: array }` | Collection changed |
| `item-select` | `{ index, item }` | Item selected |

### Methods
| Method | Description |
|--------|-------------|
| `get_value()` | Get array |
| `set_value(arr)` | Set array |
| `add_item(item?)` | Add item |
| `remove_item(index)` | Remove item |
| `move_item(from, to)` | Reorder |
| `select_item(index)` | Select item |

---

## 15. Status_Bar

Application status bar.

**File:** `controls/organised/2-layout/status_bar.js`

### Purpose
Bottom bar showing status information, typically: status text, line/column, encoding, zoom slider.

### Constructor Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sections` | Section_Def[] | [] | Bar sections |

### Section Definition
```javascript
{ 
    id: 'line-col', 
    align: 'right',       // 'left', 'right', 'center'
    width: 100,           // Fixed width or 'auto'
    content: Control,     // Content control
    tooltip: 'Line, Column'
}
```

### Methods
| Method | Description |
|--------|-------------|
| `set_text(id, text)` | Set section text |
| `add_section(def)` | Add section |
| `remove_section(id)` | Remove section |
| `get_section(id)` | Get section control |

---

## 16. Clipboard_Manager

Copy/paste operations for controls.

**File:** `utils/clipboard_manager.js`

### Purpose
Handles copy, cut, paste of controls with serialization. Works with browser clipboard API.

### Methods
| Method | Description |
|--------|-------------|
| `copy(controls)` | Copy controls to clipboard |
| `cut(controls, container)` | Cut controls |
| `paste(container, position?)` | Paste at position |
| `can_paste()` | Check if clipboard has content |
| `get_clipboard_data()` | Get raw clipboard data |
| `set_clipboard_data(data)` | Set clipboard data |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `copy` | `{ controls }` | Controls copied |
| `cut` | `{ controls }` | Controls cut |
| `paste` | `{ controls }` | Controls pasted |

### Serialization Format
```javascript
{
    type: 'jsgui-controls',
    version: 1,
    controls: [
        { type: 'Button', properties: {...}, children: [...] }
    ]
}
```

---

## Implementation Order

| Phase | Controls | Weeks |
|-------|----------|-------|
| 1 | Undo_Redo_Manager, Selection_Handles | 2 |
| 2 | **Date_Picker_Progressive, Calendar** | **2** |
| 3 | Property_Grid (basic), Dialog | 2 |
| 4 | Document_Tab_Container | 2 |
| 5 | Color_Picker, Font_Picker | 2 |
| 6 | Dockable_Panel_System | 3 |
| 7 | Snap_Guide_Overlay | 1 |
| 8 | Anchor_Editor, Dock_Editor, Collection_Editor | 1 |
| 9 | Status_Bar, Clipboard_Manager | 1 |

**Total estimated: 16 weeks**

---

## File Structure

```
controls/organised/
├── 2-editor/
│   ├── selection_handles.js
│   ├── snap_guide_overlay.js
│   ├── property_grid.js
│   └── README.md
├── 2-layout/
│   ├── dockable_panel_system.js
│   ├── dockable_panel.js
│   ├── dock_tab_group.js
│   ├── dock_zone.js
│   ├── document_tab_container.js
│   ├── status_bar.js
│   └── README.md
├── 2-input/
│   ├── date_picker_progressive.js   ← Progressive enhancement date picker
│   ├── date_picker_dropdown.js      ← Dropdown variant
│   ├── date_picker_inline.js        ← Inline variant
│   ├── date_picker_range.js         ← Date range picker
│   ├── calendar.js                   ← Full calendar control
│   ├── calendar_month_view.js        ← Month grid view
│   ├── calendar_year_view.js         ← Year grid view
│   ├── calendar_decade_view.js       ← Decade navigation
│   ├── color_picker.js
│   ├── font_picker.js
│   ├── anchor_editor.js
│   ├── dock_editor.js
│   ├── collection_editor.js
│   └── README.md
└── 2-ui/
    ├── dialog.js
    └── README.md

utils/
├── undo_redo_manager.js
├── clipboard_manager.js
├── commands/
│   ├── command.js
│   ├── property_command.js
│   ├── move_command.js
│   ├── resize_command.js
│   ├── add_command.js
│   ├── remove_command.js
│   └── composite_command.js
└── README.md

css/
├── editor-controls.css
├── docking.css
├── dialogs.css
├── property-grid.css
├── date-picker.css      ← Date picker styling
└── calendar.css         ← Calendar styling
```

---

## CSS Theme Integration

All controls should integrate with the existing jsgui3-html theming system.

### Theme Token Usage
```css
.property-grid {
    --pg-bg: var(--panel-bg, #ffffff);
    --pg-border: var(--border-color, #e0e0e0);
    --pg-category-bg: var(--section-header-bg, #f5f5f5);
    --pg-row-hover: var(--hover-bg, #f0f0f0);
    --pg-label-color: var(--text-secondary, #666666);
    --pg-value-color: var(--text-primary, #333333);
}
```

### Dark Mode Support
Each control should respect `prefers-color-scheme` or a `.dark-theme` class:

```css
@media (prefers-color-scheme: dark) {
    .property-grid {
        --pg-bg: #1e1e1e;
        --pg-border: #3c3c3c;
        --pg-category-bg: #252526;
    }
}

.dark-theme .property-grid {
    --pg-bg: #1e1e1e;
    /* ... */
}
```

---

## Accessibility Requirements

| Control | Requirements |
|---------|--------------|
| Selection_Handles | Keyboard resize (Arrow keys), focus indicators |
| Property_Grid | Arrow key navigation, screen reader labels |
| Dockable_Panel | Focus management, ARIA roles |
| Document_Tab_Container | `role="tablist"`, `role="tab"`, `aria-selected` |
| Dialog | Focus trap, `role="dialog"`, `aria-modal` |
| Color_Picker | `role="application"`, keyboard controls |
| Font_Picker | Listbox patterns |
| **Date_Picker_Progressive** | Native input fallback, `aria-haspopup`, keyboard date entry |
| **Calendar** | `role="grid"`, `role="gridcell"`, `aria-current="date"`, arrow navigation |

---

## Testing Strategy

Each control should have:

1. **Unit tests** - Logic and state management
2. **E2E tests** - Puppeteer-based interaction tests
3. **Visual regression** - Screenshot comparison
4. **Accessibility audit** - axe-core checks

Test locations:
```
test/
├── unit/
│   ├── undo_redo_manager.test.js
│   ├── property_grid.test.js
│   └── ...
├── e2e/
│   ├── dockable_panel.e2e.js
│   ├── document_tabs.e2e.js
│   └── ...
└── visual/
    └── ...
```

---

## Dependencies on Existing Controls

| New Control | Requires |
|-------------|----------|
| Selection_Handles | `drag_like_events`, `resizable` patterns |
| Property_Grid | `Tree_View` (for expandable props) |
| Dockable_Panel_System | `Window`, `Split_Pane`, `dragable` |
| Document_Tab_Container | `Reorderable_List` patterns |
| Dialog | `Window` (as base or reference) |
| Color_Picker | `Slider` (if exists), inputs |
| Collection_Editor | `Reorderable_List`, `Property_Grid` |
| **Date_Picker_Progressive** | `auto_enhance` mixin, `swap_registry`, `Transformations.date`, `Calendar` |
| **Calendar** | `Month_View` (existing), `Left_Right_Arrows_Selector`, `Data_Model_View_Model_Control` |

---

*Document version: 2.1 - Added Date Picker and Calendar specifications*
