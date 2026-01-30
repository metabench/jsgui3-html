# Visual Studio Form Designer Implementation Plan

This document outlines the controls and architecture needed to implement Visual Studio's form designer UI within a browser using jsgui3-html.

## Overview

Visual Studio's form designer is a complex WYSIWYG editor that allows visual design of Windows Forms, WPF, and web forms. The key components include:

1. **Toolbox/Component Palette** - Draggable controls catalog
2. **Form Designer Surface** - Main canvas for visual editing
3. **Properties Window** - Property grid for selected control
4. **Solution Explorer** - Project file tree
5. **Document Tabs** - Multi-document interface
6. **Code Editor** - Syntax-highlighted text editor
7. **Designer/Code Toggle** - Switch between views
8. **Menu Bar & Toolbars** - Commands and actions
9. **Status Bar** - Status information
10. **Output/Error Panels** - Docked panels

---

## Part 1: Existing Controls That Can Be Leveraged

| Component | Existing Control | Path | Status |
|-----------|-----------------|------|--------|
| Drag Support | `dragable` mixin | `control_mixins/dragable.js` | ✅ Ready |
| Resize Support | `resizable` mixin | `control_mixins/resizable.js` | ✅ Ready |
| Selection | `selectable` mixin | `control_mixins/selectable.js` | ✅ Ready |
| Selection Scope | `Selection_Scope` | `html-core/selection-scope.js` | ✅ Ready |
| Drag-like Events | `drag_like_events` mixin | `control_mixins/drag_like_events.js` | ✅ Ready |
| Property Editor | `Property_Editor` | `controls/organised/1-standard/1-editor/property_editor.js` | ⚠️ Needs extension |
| Tree View | `Tree_View`, `Tree_Node` | `controls/organised/1-standard/4-data/Tree_View.js` | ✅ Ready |
| Panel | `Panel` | `controls/organised/1-standard/6-layout/panel.js` | ✅ Ready |
| Window | `Window` | `controls/organised/1-standard/6-layout/window.js` | ✅ Ready |
| Split Pane | `Split_Pane` | `controls/organised/1-standard/6-layout/split_pane.js` | ✅ Ready |
| Grid | `Grid` | `controls/organised/0-core/0-basic/1-compositional/grid.js` | ✅ Ready |
| Data Grid | `Data_Grid` | `controls/connected/data-grid.js` | ✅ Ready |
| Reorderable List | `Reorderable_List` | `controls/organised/1-standard/5-ui/reorderable_list.js` | ✅ Ready |
| Toolbar | `Toolbar` | `controls/organised/1-standard/5-ui/Toolbar.js` | ✅ Ready |
| Selection Box | `selection-box-host` mixin | `control_mixins/selection-box-host.js` | ⚠️ Partial |

---

## Part 2: New Controls Required

### 2.1 Core Designer Controls

#### 2.1.1 `Designer_Surface` (High Priority)
The main canvas where controls are placed and arranged.

```javascript
class Designer_Surface extends Control {
    // Features needed:
    // - Grid background (snap-to-grid)
    // - Control placement via drag-drop
    // - Selection of controls
    // - Multiple selection (rubber band / box select)
    // - Alignment guides (snap lines)
    // - Z-order management
    // - Copy/paste/delete operations
    // - Undo/redo support
    // - Keyboard navigation
}
```

**Required Features:**
- [ ] Snap-to-grid placement with configurable grid size
- [ ] Alignment snap lines (show guides when aligning)
- [ ] Rubber band selection (box select)
- [ ] Multi-select with Ctrl+Click
- [ ] Selection handles (8-point resize + move handle)
- [ ] Z-order controls (bring to front, send to back)
- [ ] Keyboard shortcuts (Delete, Ctrl+C/V, arrow keys)
- [ ] Zoom support (10% - 400%)
- [ ] Ruler display (optional)

**Dependencies:** `selectable`, `selection-box-host`, `drag_like_events`

---

#### 2.1.2 `Selection_Handles` (High Priority)
Visual handles around selected controls for resizing.

```javascript
class Selection_Handles extends Control {
    // 8 resize handles: N, S, E, W, NE, NW, SE, SW
    // Move handle in center or grab anywhere
    // Shows dimensions while resizing
    // Cursor changes based on handle position
}
```

**Features:**
- [ ] 8 directional resize handles
- [ ] Move handle (center or title bar)
- [ ] Size tooltip during resize
- [ ] Lock aspect ratio (Shift key)
- [ ] Constrain to axis (Ctrl key)
- [ ] Handle visibility based on zoom level

---

#### 2.1.3 `Snap_Guide_Overlay` (Medium Priority)
Visual guides that appear during drag/resize for alignment.

```javascript
class Snap_Guide_Overlay extends Control {
    // Shows horizontal and vertical lines
    // Snaps to edges and centers of other controls
    // Snaps to container margins
    // Shows distance indicators
}
```

**Features:**
- [ ] Edge-to-edge alignment guides
- [ ] Center-to-center alignment
- [ ] Margin/padding guides
- [ ] Distance indicators
- [ ] Configurable snap threshold

---

#### 2.1.4 `Designer_Toolbox` (High Priority)
Palette of available controls organized in categories.

```javascript
class Designer_Toolbox extends Control {
    // Categories that expand/collapse
    // Draggable items
    // Search/filter functionality
    // Pointer tool for selection mode
    // Custom control support
}
```

**Features:**
- [ ] Collapsible categories (All Windows Forms, Common Controls, Containers, etc.)
- [ ] Pointer/selection tool toggle
- [ ] Drag-to-canvas or click-to-add modes
- [ ] Search filter
- [ ] Recently used section
- [ ] Custom controls section
- [ ] Tooltips with control descriptions

---

#### 2.1.5 `Property_Grid` (High Priority)
Enhanced property editor with category grouping and specialized editors.

```javascript
class Property_Grid extends Control {
    // Categorized and alphabetical views
    // Property value editors by type
    // Multi-select property editing
    // Events tab
    // Property descriptions
    // Search/filter
}
```

**Features:**
- [ ] Categorized view (Appearance, Behavior, Layout, etc.)
- [ ] Alphabetical view toggle
- [ ] Property search
- [ ] Multi-object editing (show common properties)
- [ ] Events tab for event handler binding
- [ ] Property descriptions panel

**Specialized Property Editors Needed:**
| Property Type | Editor | Priority |
|--------------|--------|----------|
| String | Text input | High |
| Number | Spinner input | High |
| Boolean | Checkbox | High |
| Enum | Dropdown | High |
| Color | Color picker | High |
| Font | Font picker | Medium |
| Size | Width x Height editor | High |
| Location | X, Y editor | High |
| Anchor | Anchor editor (visual) | Medium |
| Dock | Dock editor (visual 5-position) | Medium |
| Image | Image picker/preview | Medium |
| Collection | Collection editor dialog | Low |
| Object | Expandable sub-properties | Medium |
| Binding | Data binding editor | Low |

---

### 2.2 Layout Management Controls

#### 2.2.1 `Dock_Panel` (Medium Priority)
Container that docks children to edges.

```javascript
class Dock_Panel extends Control {
    // Children can dock: Left, Right, Top, Bottom, Fill
    // Visual dock indicator during drag
    // Resize splitters between docked panels
}
```

---

#### 2.2.2 `Anchor_Editor` (Medium Priority)
Visual editor for Anchor property (4 toggle links).

```javascript
class Anchor_Editor extends Control {
    // Visual representation of a rectangle
    // 4 clickable anchors: Top, Bottom, Left, Right
    // Visual feedback for anchored edges
}
```

---

#### 2.2.3 `Dock_Editor` (Medium Priority)
Visual editor for Dock property (6 positions).

```javascript
class Dock_Editor extends Control {
    // 5 buttons: None, Left, Right, Top, Bottom, Fill
    // Visual representation
}
```

---

### 2.3 IDE Shell Controls

#### 2.3.1 `IDE_Shell` (High Priority)
Main application shell with docking window management.

```javascript
class IDE_Shell extends Control {
    // Menu bar
    // Toolbar area
    // Dockable panel system
    // Document tab area
    // Status bar
}
```

---

#### 2.3.2 `Dockable_Panel_System` (High Priority)
Manages dockable/floating panels like VS's tool windows.

```javascript
class Dockable_Panel_System extends Control {
    // Panels can dock Left, Right, Top, Bottom
    // Panels can float as windows
    // Panels can tab together
    // Dock previews during drag
    // Auto-hide functionality
    // Split support
}
```

**Features:**
- [ ] Dock to any edge
- [ ] Tab grouping (multiple panels in same area)
- [ ] Float as window
- [ ] Auto-hide (minimize to edge)
- [ ] Dock preview overlay during drag
- [ ] Save/restore layout
- [ ] Split panels horizontally/vertically

---

#### 2.3.3 `Document_Tab_Container` (High Priority)
Tabbed document interface for open files/designers.

```javascript
class Document_Tab_Container extends Control {
    // Tabs for each open document
    // Close buttons on tabs
    // Tab overflow handling (scroll or dropdown)
    // Drag to reorder tabs
    // Split view support
    // Modified indicator (asterisk)
}
```

**Features:**
- [ ] Closeable tabs
- [ ] Tab reordering via drag
- [ ] Tab overflow menu
- [ ] Split horizontal/vertical
- [ ] Modified state indicator
- [ ] Context menu (Close, Close All, Close Others)
- [ ] Pin tab support

---

#### 2.3.4 `Status_Bar` (Low Priority)
Application status bar.

```javascript
class Status_Bar extends Control {
    // Status text
    // Line/column indicator
    // Encoding selector
    // Line ending selector
    // Zoom slider
    // Background task indicators
}
```

---

### 2.4 Editor Controls

#### 2.4.1 `Code_Editor` (High Priority)
Syntax-highlighted text editor with intellisense support.

```javascript
class Code_Editor extends Control {
    // Syntax highlighting
    // Line numbers
    // Code folding
    // Autocomplete/intellisense
    // Error/warning markers
    // Breakpoint margin
    // Minimap (optional)
}
```

**Recommendation:** Integrate Monaco Editor (VS Code's editor) as a wrapper control rather than building from scratch.

```javascript
class Monaco_Editor_Wrapper extends Control {
    // Wraps Monaco Editor
    // Provides jsgui3-html integration
    // Handles activation/deactivation
}
```

---

#### 2.4.2 `Designer_Code_Toggle` (Medium Priority)
Toggle between Design and Code views.

```javascript
class Designer_Code_Toggle extends Control {
    // Design button
    // Split button (side-by-side)
    // Code button
    // Keyboard shortcuts
}
```

---

### 2.5 Dialog Controls

#### 2.5.1 `Dialog` (Medium Priority)
Modal dialog base class.

```javascript
class Dialog extends Control {
    // Title bar
    // Content area
    // Button area (OK, Cancel, Apply)
    // Modal overlay
    // Keyboard handling (Escape to close)
}
```

---

#### 2.5.2 `Color_Picker_Dialog` (Medium Priority)
Color selection dialog.

```javascript
class Color_Picker_Dialog extends Dialog {
    // Color wheel or square
    // RGB/HSL inputs
    // Hex input
    // Alpha channel (optional)
    // Preset colors
    // Recent colors
}
```

---

#### 2.5.3 `Font_Picker_Dialog` (Medium Priority)
Font selection dialog.

```javascript
class Font_Picker_Dialog extends Dialog {
    // Font family list
    // Font style (Regular, Bold, Italic)
    // Font size
    // Preview
    // Effects (strikeout, underline)
}
```

---

#### 2.5.4 `Collection_Editor_Dialog` (Low Priority)
Generic collection editor for list properties.

```javascript
class Collection_Editor_Dialog extends Dialog {
    // List of items
    // Add/Remove buttons
    // Move Up/Down buttons
    // Property grid for selected item
}
```

---

### 2.6 Utility Controls

#### 2.6.1 `Undo_Redo_Manager` (High Priority)
Command pattern implementation for undo/redo.

```javascript
class Undo_Redo_Manager {
    // Command stack
    // execute(command)
    // undo()
    // redo()
    // canUndo / canRedo
    // Transaction support (group multiple commands)
}
```

**Command Types Needed:**
- Move control
- Resize control
- Add control
- Delete control
- Change property
- Cut/Copy/Paste
- Z-order change

---

#### 2.6.2 `Clipboard_Manager` (Medium Priority)
Handles copy/paste of controls.

```javascript
class Clipboard_Manager {
    // copy(controls)
    // cut(controls)
    // paste(target_surface)
    // Serializes controls to transferable format
}
```

---

#### 2.6.3 `Designer_Context_Menu` (Medium Priority)
Right-click context menu for designer surface.

```javascript
class Designer_Context_Menu extends Control {
    // Cut, Copy, Paste, Delete
    // Bring to Front, Send to Back
    // Align (Left, Center, Right, Top, Middle, Bottom)
    // Make Same Size (Width, Height, Both)
    // Lock Controls
    // View Code
    // Properties
}
```

---

### 2.7 Solution/Project Management

#### 2.7.1 `Solution_Explorer` (Medium Priority)
Project file tree with context menus.

```javascript
class Solution_Explorer extends Control {
    // Tree structure
    // File/folder icons
    // Context menus
    // Drag to reorder/move
    // Rename inline
    // Add/Delete items
}
```

**Enhancement to `Tree_View`:**
- [ ] File type icons
- [ ] Drag and drop to move files
- [ ] Inline renaming
- [ ] Context menu support
- [ ] Virtual loading for large projects

---

#### 2.7.2 `File_Tree_Node` (Medium Priority)
Extended tree node with file-specific features.

```javascript
class File_Tree_Node extends Tree_Node {
    // File type icon
    // Modified indicator
    // Error/warning badge
    // Exclusion indicator
}
```

---

## Part 3: Data Models Required

### 3.1 `Designer_Document` Model
Represents a single form/document being designed.

```javascript
class Designer_Document {
    // root_control: Control - the form/container being designed
    // controls: Map<id, Control_Definition>
    // selected_controls: Array<id>
    // undo_stack: Array<Command>
    // redo_stack: Array<Command>
    // is_modified: boolean
    // file_path: string
}
```

### 3.2 `Control_Definition` Model
Serializable definition of a control.

```javascript
class Control_Definition {
    // id: string
    // type: string (control type name)
    // properties: Map<string, value>
    // children: Array<Control_Definition>
    // parent_id: string
    // z_index: number
}
```

### 3.3 `Control_Metadata` Registry
Registry of available control types and their properties.

```javascript
class Control_Metadata {
    // control_type: string
    // display_name: string
    // icon: string
    // category: string
    // default_size: [width, height]
    // properties: Array<Property_Metadata>
    // events: Array<Event_Metadata>
}
```

### 3.4 `Property_Metadata`
Describes a property for the property grid.

```javascript
class Property_Metadata {
    // name: string
    // display_name: string
    // category: string
    // type: string (string, number, boolean, enum, color, etc.)
    // default_value: any
    // editor: string (editor type to use)
    // enum_values: Array (if type is enum)
    // description: string
    // readonly: boolean
}
```

---

## Part 4: Implementation Priority

### Phase 1: Core Designer (Weeks 1-4)
1. `Designer_Surface` with grid and basic placement
2. `Selection_Handles` for resize
3. `Designer_Toolbox` with drag-to-canvas
4. Enhanced `Property_Grid` with common editors
5. `Undo_Redo_Manager`

### Phase 2: Layout & IDE Shell (Weeks 5-8)
1. `IDE_Shell` main structure
2. `Dockable_Panel_System`
3. `Document_Tab_Container`
4. `Split_Pane` enhancements
5. `Snap_Guide_Overlay`

### Phase 3: Advanced Properties (Weeks 9-12)
1. `Color_Picker_Dialog`
2. `Font_Picker_Dialog`
3. `Anchor_Editor`
4. `Dock_Editor`
5. Collection editors

### Phase 4: Code Integration (Weeks 13-16)
1. `Monaco_Editor_Wrapper` (or custom Code_Editor)
2. `Designer_Code_Toggle`
3. Code generation from designer
4. Designer sync from code changes

### Phase 5: Project Management (Weeks 17-20)
1. `Solution_Explorer`
2. File management
3. Project settings
4. Build integration

---

## Part 5: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         IDE_Shell                                │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                      Menu_Bar                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                      Toolbar_Area                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────┬───────────────────────────────────────────────────┬───────┤
│     │                                                   │       │
│  T  │          Document_Tab_Container                   │   P   │
│  o  │  ┌─────────────────────────────────────────────┐  │   r   │
│  o  │  │                                             │  │   o   │
│  l  │  │         Designer_Surface                    │  │   p   │
│  b  │  │    ┌───────────────────────────────┐       │  │   e   │
│  o  │  │    │   Form being designed         │       │  │   r   │
│  x  │  │    │   ┌───┐  ┌─────────────────┐ │       │  │   t   │
│     │  │    │   │Btn│  │   Text Field    │ │       │  │   y   │
│  /  │  │    │   └───┘  └─────────────────┘ │       │  │       │
│     │  │    │        ┌──────────┐          │       │  │   G   │
│  P  │  │    │        │  Label   │          │       │  │   r   │
│  a  │  │    └───────────────────────────────┘       │  │   i   │
│  l  │  │                                             │  │   d   │
│  e  │  │         Snap_Guide_Overlay                  │  │       │
│  t  │  └─────────────────────────────────────────────┘  │       │
│  t  │                                                   │       │
│  e  │  ┌──────────────────────────────────────────────┐ │       │
│     │  │    Code_Editor (toggled view)                │ │       │
│     │  └──────────────────────────────────────────────┘ │       │
│     │                                                   │       │
├─────┴───────────────────────────────────────────────────┴───────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  Output_Panel  │  Error_List  │  Find_Results              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                      Status_Bar                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Key Technical Challenges

### 6.1 Isomorphic Rendering
All controls must work on both server and client per jsgui3-html conventions:
- Constructor builds structure (runs on both)
- `activate()` attaches event handlers (client only)
- Guard DOM access with `if (this.dom.el)`

### 6.2 Performance with Many Controls
- Virtual rendering for large forms
- Throttled updates during drag/resize
- Efficient hit testing for selection

### 6.3 Serialization/Deserialization
- Save/load form definitions
- Generate code from visual design
- Parse code to update visual design

### 6.4 Undo/Redo Complexity
- Transaction support for compound operations
- Memory management for large stacks
- State snapshot vs command pattern trade-offs

### 6.5 Docking System
- Complex panel arrangements
- Persist and restore layouts
- Smooth drag preview animations

---

## Part 7: Existing Examples to Reference

1. **WYSIWYG Form Builder** - `dev-examples/wysiwyg-form-builder/`
   - Similar drag-drop field creation
   - Property editing
   - Preview mode toggle

2. **Rich Text Editor** - `dev-examples/rich-text-editor/`
   - Toolbar implementation
   - Selection handling

3. **Matrix Demo** - `dev-examples/matrix-demo/`
   - Grid-based layouts

---

## Part 8: Control Count Summary

| Category | Count | Priority |
|----------|-------|----------|
| Core Designer Controls | 5 | High |
| Layout Controls | 3 | Medium |
| IDE Shell Controls | 4 | High |
| Editor Controls | 2 | High |
| Dialog Controls | 4 | Medium |
| Utility Classes | 3 | High |
| Project Management | 2 | Medium |
| Property Editors | 12+ | Mixed |
| **Total New Controls** | **~35** | - |

---

## Part 9: File Structure Recommendation

```
controls/organised/
├── 2-ide/
│   ├── ide_shell.js
│   ├── dockable_panel_system.js
│   ├── document_tab_container.js
│   ├── status_bar.js
│   ├── solution_explorer.js
│   └── README.md
├── 2-designer/
│   ├── designer_surface.js
│   ├── selection_handles.js
│   ├── snap_guide_overlay.js
│   ├── designer_toolbox.js
│   ├── designer_context_menu.js
│   └── README.md
├── 2-property-editors/
│   ├── property_grid.js
│   ├── color_picker.js
│   ├── font_picker.js
│   ├── anchor_editor.js
│   ├── dock_editor.js
│   ├── size_editor.js
│   ├── location_editor.js
│   └── README.md
├── 2-code-editor/
│   ├── monaco_wrapper.js
│   ├── code_editor.js
│   ├── designer_code_toggle.js
│   └── README.md
└── 2-dialogs/
    ├── dialog.js
    ├── color_picker_dialog.js
    ├── font_picker_dialog.js
    ├── collection_editor_dialog.js
    └── README.md

utils/
├── undo_redo_manager.js
├── clipboard_manager.js
├── designer_document.js
├── control_definition.js
└── control_metadata_registry.js
```

---

## Conclusion

Implementing a Visual Studio-like form designer is a substantial undertaking requiring approximately 35+ new controls and utility classes. The existing jsgui3-html framework provides solid foundations with its drag, resize, and selection mixins, as well as basic layout controls.

The recommended approach is to implement in phases, starting with core designer functionality and gradually adding IDE shell features. Integration of an existing code editor like Monaco (used by VS Code) is strongly recommended rather than building from scratch.

Key success factors:
1. Solid undo/redo architecture from the start
2. Well-defined control metadata system
3. Consistent serialization format
4. Performance optimization for complex forms
5. Comprehensive keyboard shortcuts

Estimated total development time: **4-5 months** for a full-featured implementation with a small team.
