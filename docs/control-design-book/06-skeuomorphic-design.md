# Chapter 6: Skeuomorphic Design Deep Dive

> A pixel-by-pixel guide to the Win32 / Visual Studio Classic visual language,  
> with annotated SVG illustrations and CSS implementation patterns.

---

## 6.1 The Visual Language of Win32

The Win32 visual language was designed under severe constraints: 640×480 pixels, 256-color displays, no anti-aliasing, no transparency, no sub-pixel rendering. Every visual trick had to be achieved with solid-color rectangles and single-pixel lines.

The result was a design system of extraordinary economy:

- **Two colors create depth.** A white pixel on the top edge and a dark pixel on the bottom edge is all that's needed to make a surface look raised.
- **Inverting the pair creates sunken.** Dark on top, light on bottom.
- **No gradients needed for most controls.** Just strategic 1px lines.
- **Every pixel is intentional.** Nothing is decorative; everything communicates state.

This economy makes Win32 the ideal skeuomorphic style for a JavaScript library: it's achievable with pure CSS, performs well (no `blur()`, no `gradient()`), and is visually unambiguous.

**SVG References:**  
- [svg-02-vs-classic-buttons.svg](./svg-02-vs-classic-buttons.svg) — buttons, inputs, tabs, scrollbars  
- [svg-03-vs-classic-windows.svg](./svg-03-vs-classic-windows.svg) — windows, dialogs, tool panels  

---

## 6.2 The 3D Border System

The foundation of every Win32 control is the **beveled border**: a multi-layer frame of colored lines that creates the illusion of a physical surface with directional lighting.

### Light Source

Win32 assumes a light source at the **top-left** corner. This is consistent across all controls:

```
      Light ☀️
        ↘
    ┌─────────────┐  ← Highlighted edge (lit)
    │             │
    │   SURFACE   │
    │             │
    └─────────────┘  ← Shadowed edge (dark)
                  ↗
              Shadow
```

### Raised Surface (Buttons)

A raised surface sticks _out_ from the background. It is lit from above-left and shadowed below-right.

```
Pixel structure (each = 1px):

┌────────────────────────────────┐
│ FFFFFF │ FFFFFF │ FFFFFF │ 404040│  ← Row 1: white highlight, dark corner
├────────┼────────────────┼──────┤
│ FFFFFF │ F0F0F0 │ F0F0F0│808080│  ← Row 2: inner highlight, inner shadow
├────────┤                ├──────┤
│ FFFFFF │                │808080│  ← Middle: ButtonFace (#D4D0C8)
├────────┤                ├──────┤
│ FFFFFF │ 808080 │808080 │808080│  ← Inner shadow row
├────────┼────────────────┼──────┤
│ 404040 │ 404040 │ 404040│404040│  ← Outer dark shadow row
└────────────────────────────────┘
```

**CSS implementation using `box-shadow`:**

```css
.win32-raised {
    border: none;
    background: #D4D0C8;
    box-shadow:
        /* Layer 1: Outer bottom-right dark shadow */
        inset -1px -1px 0 0 #404040,
        /* Layer 2: Outer top-left highlight */
        inset 1px 1px 0 0 #FFFFFF,
        /* Layer 3: Inner bottom-right shadow */
        inset -2px -2px 0 0 #808080,
        /* Layer 4: Inner top-left light */
        inset 2px 2px 0 0 #F0F0F0;
}
```

### Sunken Surface (Inputs)

A sunken surface is _pressed into_ the background. The lighting is inverted.

```css
.win32-sunken {
    border: none;
    background: #FFFFFF;
    box-shadow:
        /* Layer 1: Outer bottom-right light */
        inset -1px -1px 0 0 #F0F0F0,
        /* Layer 2: Outer top-left shadow */
        inset 1px 1px 0 0 #808080,
        /* Layer 3: Inner bottom-right highlight */
        inset -2px -2px 0 0 #FFFFFF,
        /* Layer 4: Inner top-left dark shadow */
        inset 2px 2px 0 0 #404040;
}
```

### Etched Surface (Group Boxes)

An etched border looks like two parallel grooves cut into the surface:

```css
.win32-etched {
    border: none;
    padding-top: 12px;
    background: transparent;
    box-shadow:
        /* Outer groove: dark on top/left */
        inset 1px 1px 0 0 #808080,
        /* Inner groove: light on bottom/right */
        inset 2px 2px 0 0 #FFFFFF,
        inset -1px -1px 0 0 #808080,
        inset -2px -2px 0 0 #FFFFFF;
}
```

### Pressed Button

When a raised button is pressed, it transitions to a sunken appearance:

```css
.win32-raised:active {
    box-shadow:
        inset 1px 1px 0 0 #808080,
        inset -1px -1px 0 0 #FFFFFF,
        inset 2px 2px 0 0 #404040;
    /* Shift text 1px to simulate physical press */
    padding: 5px 11px 3px 13px;
}
```

The text shifting 1px down-right is a crucial detail: it makes the button feel like a physical object being pressed.

---

## 6.3 System Colors Reference

Win32 uses named system colors. Here is the complete mapping to jsgui3 theme tokens:

| System Color | Token | Light Theme | Dark Theme (inv.) |
|-------------|-------|:-----------:|:-----------------:|
| `ButtonFace` | `--theme-color-surface` | `#D4D0C8` | `#3C3C3C` |
| `ButtonHighlight` | `--theme-color-highlight` | `#FFFFFF` | `#5C5C5C` |
| `ButtonShadow` | `--theme-color-shadow` | `#808080` | `#1C1C1C` |
| `3DDarkShadow` | `--theme-color-dark-shadow` | `#404040` | `#000000` |
| `3DLight` | `--theme-3d-light` | `#F0F0F0` | `#4C4C4C` |
| `Window` | `--theme-color-bg` | `#FFFFFF` | `#1E1E1E` |
| `WindowText` | `--theme-color-text` | `#000000` | `#D4D4D4` |
| `Highlight` | `--theme-color-primary` | `#0A246A` | `#264F78` |
| `HighlightText` | `--theme-color-primary-text` | `#FFFFFF` | `#FFFFFF` |
| `GrayText` | `--theme-color-text-muted` | `#808080` | `#666666` |
| `ActiveCaption` | `--theme-titlebar-start` | `#0A246A` | `#0A246A` |
| `GradientActiveCaption` | `--theme-titlebar-end` | `#3A6EA5` | `#3A6EA5` |
| `InactiveCaptionGradient` | `--theme-titlebar-inactive` | `#7A96DF` | `#555555` |

---

## 6.4 Control-Specific Rendering Rules

### Buttons

**Normal:** Raised 3D, `ButtonFace` fill, black text, sharp corners, Tahoma 11px  
**Hover:** No visible change (original Win32) or very subtle lighten (VS 2003+)  
**Pressed:** Sunken 3D, text shifts +1px right and +1px down  
**Disabled:** Embossed text pattern: white text at offset (+1,+1), then gray text on top  
**Focused:** 1px dotted black rectangle _inside_ the button (4px inset from edges)  
**Default button:** Extra 1px black border outside the 3D border  

```css
.win32-button:disabled {
    color: transparent;
    text-shadow:
        1px 1px 0 #FFFFFF,
        0 0 0 #A0A0A0;
}

.win32-button:focus-visible {
    outline: 1px dotted #000000;
    outline-offset: -4px;
}

.win32-button.default-button {
    box-shadow:
        0 0 0 1px #000000,  /* Extra outer border */
        inset -1px -1px 0 0 #404040,
        inset 1px 1px 0 0 #FFFFFF,
        inset -2px -2px 0 0 #808080,
        inset 2px 2px 0 0 #F0F0F0;
}
```

### Text Inputs

**Normal:** Sunken 3D border, white background, black text, no placeholder animation  
**Focused:** Blue inner border (on XP+) or unchanged (Classic)  
**Disabled:** Gray background (`ButtonFace`), gray text  
**Read-only:** Gray background, black text, no sunken border  

### Checkboxes

13×13 pixel sunken box:
- Unchecked: empty white interior
- Checked: black checkmark path (3 connected lines: down-right, down-left at steeper angle)
- Indeterminate: small gray square in center
- Label: 4px gap between box and text

### Radio Buttons

12px diameter sunken circle:
- Unselected: empty white interior
- Selected: 4px diameter filled black circle in center
- Label: 4px gap between circle and text

### Scrollbars

17px wide (mandatory — this is hardcoded in Win32):
- **Track:** Dithered pattern (every other pixel gray/white)
- **Thumb:** Raised 3D rectangle, minimum 17px tall
- **Arrow buttons:** 17×17 raised 3D with tiny arrow glyph
- **Page up/down areas:** Track pattern, darker when actively scrolling

### Tab Controls

- **Active tab:** Raised, extends 2px below the panel border (visually connected to the panel)
- **Inactive tabs:** 2px shorter than active, slightly recessed
- **Tab panel:** Bordered with 3D raised border
- **Tab padding:** 8px horizontal, 4px vertical

### Menu Bars and Menus

- **Menu bar:** Flat `ButtonFace` background, underlined access keys (Alt+letter)
- **Menu items:** White background, blue (`Highlight`) on hover
- **Separators:** Horizontal etched line (dark + light, 1px gap)
- **Keyboard shortcuts:** Right-aligned, lighter color
- **Menu icons:** 16×16 in the left gutter (24px wide gutter)
- **Checkmarks:** Small ✓ in the icon gutter area

### Progress Bars

- **Track:** Sunken 3D border enclosing the bar
- **Fill:** Green (#00A000) rectangular blocks, 12px wide, 2px gap between blocks
- **No smooth gradient** — this is the defining visual characteristic
- **The blocks are the skeuomorphic element** — they mimic physical LED segments

### Status Bars

- **Background:** `ButtonFace` with a 1px dark line at the top edge
- **Sections:** Sunken rectangles separated by 2px gaps
- **Text:** Left-aligned within each section
- **Sizing grip:** Cross-hatch pattern in the bottom-right corner (3 diagonal rows of small raised dots)

---

## 6.5 The Flat Toolbar Revolution (VS 2003 Style)

Visual Studio 2003 introduced a variation on Win32 toolbars that became hugely influential: **flat buttons that raise on hover**.

In classic Win32, toolbar buttons were always raised 3D (always visible borders). VS 2003 changed this:

- **Normal:** Flat (no visible border at all)
- **Hover:** Raised 3D border appears, background lightens slightly
- **Pressed:** Sunken 3D (borders invert)
- **Toggled on:** Sunken with a slight color tint

This is called "cool" toolbar style and was the precursor to modern flat toolbar designs.

```css
.win32-toolbar-button {
    /* Normal: invisible borders */
    background: transparent;
    border: none;
    box-shadow: none;
}

.win32-toolbar-button:hover {
    /* Hover: raised 3D appears */
    background: #F0EDE0;
    box-shadow:
        inset -1px -1px 0 0 #808080,
        inset 1px 1px 0 0 #FFFFFF;
}

.win32-toolbar-button:active {
    /* Pressed: sunken */
    background: #E8E4DC;
    box-shadow:
        inset 1px 1px 0 0 #808080,
        inset -1px -1px 0 0 #FFFFFF;
}
```

### Toolbar Grips

Classic toolbars had "grip" handles — small dotted patterns on the left edge that indicated the toolbar could be dragged/docked:

```
  ▪ ▪     ← Two columns of small raised dots
  ▪ ▪     
  ▪ ▪     
  ▪ ▪     
  ▪ ▪     
```

---

## 6.6 Title Bars and Window Chrome

### Active Window Title Bar

The active window has a gradient title bar:

```
Left (#0A246A dark navy) ─────────── Right (#3A6EA5 medium blue)
```

- **Title text:** White, bold, Tahoma
- **Window icon:** 16×16, left-aligned, 4px from edge
- **System buttons:** Right-aligned, 16×14 raised 3D buttons

The system buttons contain small glyphs:
- **Minimize:** ▁ (horizontal line near bottom)
- **Maximize:** □ (outlined rectangle with bold top edge)
- **Close:** ✕ (two crossing diagonal lines)

### Inactive Window Title Bar

Same layout but with a gray gradient:

```
Left (#7A96DF light blue) ─────────── Right (#A6CAF0 very light blue)
```

Title text: light gray on the inactive gradient.

---

## 6.7 Implementing Win32 Theme in jsgui3

### Complete Theme Token Set

```javascript
const win32_classic_theme = {
    name: 'win32',
    tokens: {
        // Surface colors
        color_bg:              '#ECE9D8',
        color_surface:         '#D4D0C8',
        color_surface_elevated: '#E8E4DC',
        color_text:            '#000000',
        color_text_secondary:  '#333333',
        color_text_muted:      '#808080',
        
        // 3D border colors
        color_highlight:       '#FFFFFF',
        color_shadow:          '#808080',
        color_dark_shadow:     '#404040',
        '3d_light':            '#F0F0F0',
        
        // Accent
        color_primary:         '#0A246A',
        color_primary_text:    '#FFFFFF',
        color_focus:           '#000000',
        color_danger:          '#CC0000',
        color_success:         '#008000',
        color_warning:         '#FFD700',
        
        // Title bar
        titlebar_start:        '#0A246A',
        titlebar_end:          '#3A6EA5',
        titlebar_inactive_start: '#7A96DF',
        titlebar_inactive_end:   '#A6CAF0',
        
        // No rounded corners
        radius_1: '0px', radius_2: '0px',
        radius_3: '0px', radius_full: '0px',
        
        // Tight spacing
        space_1: '2px', space_2: '4px',
        space_3: '8px', space_4: '12px',
        
        // Classic typography
        font_family_base: 'Tahoma, "Segoe UI", sans-serif',
        font_size_base:   '11px',
        line_height:      '1.3',
        
        // No shadows (depth is via borders)
        shadow_1: 'none', shadow_2: 'none', shadow_3: 'none',
        
        // No transitions (instant, snappy)
        transition_fast:   '0ms',
        transition_normal: '0ms',
        transition_slow:   '0ms',
        
        border_width: '2px'
    }
};
```

### Theme CSS File

The full CSS for a Win32 theme would define:

1. **Global token overrides** (as above)
2. **Button rendering** (raised 3D, press state, disabled embossed text)
3. **Input rendering** (sunken 3D, white background)
4. **Checkbox and radio** (sunken boxes/circles)
5. **Tab control** (raised active tab, shorter inactive tabs)
6. **Scrollbar** (17px wide, arrow buttons, raised thumb)
7. **Progress bar** (chunky green blocks)
8. **Menu bar and menus** (flat bar, access keys, blue hover)
9. **Toolbar** (flat buttons that raise on hover)
10. **Window chrome** (gradient title bar, system buttons, status bar)
11. **Group box** (etched border with label gap)
12. **List and grid** (alternating rows, blue selection highlight)

---

## 6.8 Comparison: Win32 Classic vs. VS Code Dark

To appreciate the distance between Win32 and modern design, compare the same Property Grid control in both modes:

| Aspect | Win32 Classic | VS Code Dark |
|--------|:------------:|:------------:|
| Background | #ECE9D8 warm gray | #252526 dark gray |
| Grid lines | 1px #808080 solid | 1px #3E3E42 solid |
| Category headers | #E8E4DC raised bar, bold text | #37373D flat bar, uppercase 11px |
| Selected row | #0A246A navy, white text | #094771 dark blue, white text |
| Value cells | White sunken #FFFFFF | #1E1E1E flat |
| Font | Tahoma 8pt | Segoe UI 13px |
| Color swatches | 13×13 sunken rect | 14×14 rounded rect |
| Description pane | Sunken well at bottom | Hidden by default |
| Scrollbar | 17px, raised arrows | 10px, overlay style |
| Borders | Every cell has visible borders | Minimal, row-level only |

Both are information-dense, professional controls. But they come from different visual universes. jsgui3-html must be able to render both from the same Grid control constructor.
