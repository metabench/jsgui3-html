# Chapter 11: Controls Not Yet Built — Enterprise & Application

> jsgui3-html has ~145 controls. That's impressive.  
> But premium toolkits ship 300+. Here's what's missing — and how to build each one.

---

## 11.1 What We Already Have (Quick Inventory)

Before specifying what's missing, here's the landscape of what exists:

| Category | Count | Examples |
|----------|:-----:|---------|
| **Form inputs** | ~20 | Button, Text_Input, Checkbox, Radio, Toggle_Switch, Combo_Box, File_Upload, Tag_Input, Number_Stepper, Password_Input |
| **Data display** | ~10 | Data_Table, Tree_View, Tree_Table, Virtual_List, Virtual_Grid, Property_Grid, List |
| **Layout** | ~15 | Panel, Window, Tabbed_Panel, Accordion, Split_Pane, Drawer, Modal, Stack, Cluster, Center, Grid_Gap, Stepper, Single_Line |
| **Navigation** | ~8 | Horizontal_Menu, Breadcrumbs, Toolbar, Pagination, Context_Menu, Dropdown_Menu, Popup_Menu_Button |
| **Indicators** | ~10 | Badge, Chip, Spinner, Skeleton_Loader, Progress_Bar, Toast, Tooltip, Meter, Alert_Banner, Status_Indicator |
| **Pickers** | ~6 | Date_Picker, Time_Picker, Datetime_Picker, Month_View, Calendar, Color_Picker |
| **Charts** | ~1 | Line_Chart |
| **Editors** | ~5 | Rich_Text_Editor, Object_Editor, Property_Editor, Form_Container, Form_Field |
| **Misc** | ~10 | Avatar, Rating_Stars, Reorderable_List, Search_Bar, Scrollbar, Scroll_View, Audio_Volume |

**Total: ~145 controls**

---

## 11.2 Missing: Sidebar Navigation

### What It Is
A collapsible vertical navigation panel — the left rail found in every SaaS app (Slack, Linear, Notion, VS Code). Supports nested sections, icons, badges, and collapse-to-icon-only mode.

### Why It's Needed
Every serious application needs a primary navigation structure. Currently, jsgui3-html has `Horizontal_Menu` and `Drawer`, but no dedicated sidebar with collapse animation, active indicators, and section grouping.

### Spec

```javascript
const sidebar = new Sidebar_Nav({
    items: [
        { icon: 'home', label: 'Dashboard', href: '/' },
        { icon: 'inbox', label: 'Inbox', badge: 12, href: '/inbox' },
        { type: 'section', label: 'Projects' },
        { icon: 'folder', label: 'Alpha', href: '/projects/alpha' },
        { icon: 'folder', label: 'Beta', href: '/projects/beta',
          children: [
              { label: 'Tasks', href: '/projects/beta/tasks' },
              { label: 'Files', href: '/projects/beta/files' }
          ]
        },
        { type: 'separator' },
        { icon: 'settings', label: 'Settings', href: '/settings', position: 'bottom' }
    ],
    collapsed: false,        // Start expanded
    collapse_breakpoint: 768 // Auto-collapse below 768px
});
```

### Visual States
- **Expanded:** 240px wide, icon + label + optional badge for each item
- **Collapsed:** 56px wide, icon only with tooltip on hover
- **Active item:** Left border accent + tinted background
- **Hover:** Subtle background highlight
- **Section headers:** Uppercase, muted, small text — non-interactive
- **Nested items:** Indented, collapsible with rotate-chevron animation

### CSS Tokens Needed
`--sidebar-width`, `--sidebar-collapsed-width`, `--sidebar-bg`, `--sidebar-item-height`, `--sidebar-active-bg`, `--sidebar-active-border`

### Implementation Complexity: **Medium** (2–3 days)
Builds on existing `Drawer` + `List` + `Menu_Node` patterns. Main complexity is the collapse animation (width transition with overflow hidden) and responsive breakpoint handling.

---

## 11.3 Missing: Command Palette

### What It Is
A keyboard-triggered search overlay (Ctrl+K / Cmd+K) for finding and executing actions — like VS Code's command palette or Raycast.

### Why It's Needed
This is the premium UX pattern. Every modern productivity app has one. It requires fuzzy search, categorised results, keyboard navigation, and recent/frequent tracking.

### Spec

```javascript
const palette = new Command_Palette({
    commands: [
        { id: 'new-file', label: 'New File', category: 'File', shortcut: 'Ctrl+N', icon: 'file-plus' },
        { id: 'open-settings', label: 'Open Settings', category: 'App', shortcut: 'Ctrl+,', icon: 'settings' },
        { id: 'toggle-theme', label: 'Toggle Dark Mode', category: 'View', icon: 'moon' },
        // ... hundreds of commands
    ],
    placeholder: 'Type a command...',
    max_results: 8,
    show_recent: true,
    show_shortcuts: true,
    fuzzy_match: true
});

// Trigger
document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        palette.open();
    }
});
```

### Visual Spec
- **Overlay:** Centered, 560px wide, dark semi-transparent backdrop
- **Input:** Large text input at top, auto-focused
- **Results:** Scrollable list below input, max 8 visible
- **Each result:** Icon + label + category tag + keyboard shortcut (right-aligned, monospace)
- **Active result:** Highlighted background, keyboard arrows to navigate
- **Empty state:** "No results for '...'" with muted text
- **Animation:** Fade in + slight scale-up (150ms)

### Dependencies
- `Text_Input` (search field)
- `List` (results display)
- `Modal` (overlay)
- New: fuzzy string matching algorithm

### Implementation Complexity: **Medium-High** (3–4 days)

---

## 11.4 Missing: Notification Center

### What It Is
A slide-in panel (from right edge) showing a feed of notifications grouped by time, with read/unread states, actions, and clear-all.

### Why It's Needed
`Toast` handles transient messages. But apps need a persistent notification history — what happened while you were away, actionable items, system alerts.

### Spec

```javascript
const notifications = new Notification_Center({
    groups: [
        {
            label: 'Today',
            items: [
                { type: 'info', title: 'Build succeeded', body: 'Project Alpha deployed to staging', time: '2m ago', read: false, actions: [{ label: 'View', onClick: ... }] },
                { type: 'warning', title: 'Storage 80% full', body: '4.2 GB of 5 GB used', time: '1h ago', read: false }
            ]
        },
        {
            label: 'Yesterday',
            items: [
                { type: 'success', title: 'Export complete', body: 'report_q4.pdf is ready', time: 'Yesterday 3:42 PM', read: true }
            ]
        }
    ],
    unread_count: 2,
    empty_message: 'All caught up!',
    position: 'right'  // Slides in from right
});
```

### Visual Spec
- **Panel:** 360px wide, full height, slides in from right with shadow
- **Header:** "Notifications" title + unread count badge + "Mark all read" action + close button
- **Groups:** Date section headers (Today, Yesterday, This Week, Older)
- **Items:** Type icon (coloured) + title (bold) + body (muted) + timestamp + action buttons
- **Unread indicator:** Blue dot on left edge
- **Empty state:** Illustration + "All caught up!" text
- **Dismiss:** Swipe right or click × per item

### Implementation Complexity: **Medium** (2–3 days)
Uses `Drawer` (slide-in) + `List` (items) + `Badge` (count).

---

## 11.5 Missing: Wizard / Multi-Step Form

### What It Is
A guided multi-step workflow with a progress indicator, step validation, and navigation between steps.

### Why It's Needed
`Stepper` exists as a layout container, but there's no dedicated wizard with built-in progress, validation gates, and step-skipping logic. Complex forms (account setup, checkout, configuration) need this.

### Spec

```javascript
const wizard = new Wizard({
    steps: [
        {
            id: 'account', title: 'Account Details', icon: 'user',
            content: account_form,   // A Form_Container or Panel
            validate: () => account_form.is_valid()
        },
        {
            id: 'preferences', title: 'Preferences', icon: 'settings',
            content: preferences_panel,
            optional: true           // Can be skipped
        },
        {
            id: 'review', title: 'Review', icon: 'check-circle',
            content: review_summary
        }
    ],
    on_complete: (data) => submit(data),
    show_step_numbers: true,
    allow_skip: false,          // Must go in order
    progress_style: 'bar'       // 'bar' | 'dots' | 'numbered'
});
```

### Visual Spec
- **Progress bar:** Horizontal at top — steps connected by lines, active step highlighted, completed steps show checkmarks
- **Step content:** Fills the main area below the progress bar
- **Footer:** "Back" (ghost button) on left, "Next" (primary button) on right, "Skip" if step is optional
- **Validation:** "Next" is disabled until step validates; error shake animation on invalid attempt
- **Completed step:** Green checkmark icon replacing the step number

### Implementation Complexity: **Medium** (2–3 days)
Extends `Stepper` with validation, content swapping, and progress rendering.

---

## 11.6 Missing: Kanban Board

### What It Is
A columnar drag-and-drop task board (like Trello, Jira, Linear boards). Columns represent states; cards represent items.

### Why It's Needed
Project management, workflow management, and status boards are fundamental to business applications.

### Spec

```javascript
const board = new Kanban_Board({
    columns: [
        { id: 'todo', title: 'To Do', color: '#6c757d', limit: 10 },
        { id: 'in-progress', title: 'In Progress', color: '#4361ee', limit: 5 },
        { id: 'review', title: 'Review', color: '#f4a261', limit: 3 },
        { id: 'done', title: 'Done', color: '#2a9d8f' }
    ],
    cards: [
        { id: 1, column: 'todo', title: 'Design login page', tags: ['design'], assignee: 'JD', priority: 'high' },
        { id: 2, column: 'in-progress', title: 'API endpoints', tags: ['backend'], assignee: 'SA' }
    ],
    on_move: (card_id, from_column, to_column, position) => { ... },
    allow_add: true,
    compact_mode: false
});
```

### Visual Spec
- **Columns:** Vertical lanes, scrollable horizontally if they don't fit
- **Column header:** Title + card count badge + WIP limit indicator + "Add card" button
- **Cards:** Rounded rect with title, optional tags (coloured chips), assignee avatar, priority dot
- **Drag:** Card lifts with shadow + rotation on grab, drop zone highlights
- **WIP limit:** Turn column header amber when at limit, red when over
- **Compact mode:** Shows title only, no tags/avatar

### Dependencies
- `Reorderable_List` (drag within columns)
- `Panel` (columns and cards)
- `Chip` (tags)
- `Avatar` (assignees)
- New: cross-column drag-and-drop

### Implementation Complexity: **High** (4–5 days)

---

## 11.7 Missing: Timeline

### What It Is
A vertical or horizontal chronological display of events — for activity feeds, changelogs, project milestones.

### Spec

```javascript
const timeline = new Timeline({
    items: [
        { date: '2024-01-15', title: 'Project started', body: 'Initial commit', icon: 'rocket', color: 'primary' },
        { date: '2024-02-01', title: 'Alpha release', body: 'First internal release', icon: 'flag', color: 'success' },
        { date: '2024-03-10', title: 'Bug reported', body: 'Memory leak in chart rendering', icon: 'alert', color: 'danger' }
    ],
    orientation: 'vertical',    // 'vertical' | 'horizontal'
    alternating: true,          // Items alternate left/right
    connector_style: 'solid'    // 'solid' | 'dashed' | 'dotted'
});
```

### Visual Spec
- **Vertical:** Central line with dots at each event, content cards alternating left/right
- **Dot:** Coloured circle matching the event type, with icon inside
- **Connector:** Line connecting dots, with subtle animation on scroll into view
- **Card:** Date header + title + body text, with hover lift

### Implementation Complexity: **Low-Medium** (1–2 days)

---

## 11.8 Missing: Image Gallery / Carousel

### What It Is
A swipeable/navigable container for images or cards, with thumbnails, lightbox, and autoplay.

### Spec

```javascript
const gallery = new Image_Gallery({
    items: [
        { src: '/img/photo1.jpg', thumb: '/img/thumb1.jpg', caption: 'Sunset over the mountains' },
        { src: '/img/photo2.jpg', thumb: '/img/thumb2.jpg', caption: 'City lights at night' }
    ],
    mode: 'carousel',       // 'carousel' | 'grid' | 'masonry'
    autoplay: false,
    show_thumbnails: true,
    lightbox: true,          // Click to open fullscreen overlay
    transition: 'slide',     // 'slide' | 'fade' | 'zoom'
    arrows: true,
    dots: true
});
```

### Visual Spec
- **Carousel mode:** Single image visible, left/right arrow buttons, dot indicators below
- **Grid mode:** Responsive CSS grid of thumbnails, click to open lightbox
- **Lightbox:** Fullscreen dark overlay with image, left/right navigation, close button, caption below
- **Transition:** Smooth slide between images (200ms ease-out)

### Implementation Complexity: **Medium** (2–3 days)
`Tile_Slider` exists and handles some sliding, but lacks lightbox, thumbnails, and responsive grid.

---

## 11.9 Missing: Inline / Cell Editing in Data_Table

### What It Is
The ability to click a cell in a `Data_Table` and edit its value directly — like a spreadsheet.

### Why It's Needed
`Data_Table` currently handles display, sorting, filtering, and pagination. But business apps need inline editing for quick updates without opening a separate form.

### Spec

```javascript
const table = new Data_Table({
    columns: [
        { key: 'name', label: 'Name', editable: true, editor: 'text' },
        { key: 'status', label: 'Status', editable: true, editor: 'select', options: ['Active', 'Inactive'] },
        { key: 'amount', label: 'Amount', editable: true, editor: 'number', format: 'currency' },
        { key: 'date', label: 'Date', editable: true, editor: 'date' }
    ],
    rows: data,
    on_cell_edit: (row, column, old_value, new_value) => { ... },
    edit_mode: 'click',      // 'click' | 'double-click' | 'always'
    tab_navigation: true     // Tab moves to next editable cell
});
```

### Visual Spec
- **Normal cell:** Standard text display
- **Editing cell:** Cell becomes an input (text, select, date picker, number), auto-focused, blue border
- **Tab navigation:** Tab/Shift+Tab moves between editable cells, Enter confirms, Escape cancels
- **Dirty indicator:** Subtle left-border accent on modified rows
- **Commit animation:** Brief green flash on save success, red shake on error

### Implementation Complexity: **High** (3–4 days)
Requires coordination between `Data_Table`, input controls, and the MVVM data binding layer.

---

## 11.10 Summary: Enterprise Controls Priority

| Control | Priority | Complexity | Dependencies | Days |
|---------|:--------:|:----------:|:------------:|:----:|
| Sidebar Navigation | **P0** | Medium | Drawer, List, Menu_Node | 2–3 |
| Wizard / Multi-Step | **P0** | Medium | Stepper, Form_Container | 2–3 |
| Inline Cell Editing | **P0** | High | Data_Table, Inputs | 3–4 |
| Command Palette | **P1** | Medium-High | Text_Input, List, Modal | 3–4 |
| Notification Center | **P1** | Medium | Drawer, List, Badge | 2–3 |
| Image Gallery | **P1** | Medium | Tile_Slider | 2–3 |
| Timeline | **P2** | Low-Medium | List, Badge | 1–2 |
| Kanban Board | **P2** | High | Reorderable_List, Panel | 4–5 |

**Total estimated effort: 20–27 days**

---

**Next:** [Chapter 12 — Missing Controls: Data Visualisation & Creative](./12-missing-dataviz-creative.md)
