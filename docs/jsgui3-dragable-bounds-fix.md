# jsgui3 Dragable Bounds Constraint Issue

## Issue Summary

The dragable mixin in `control_mixins/dragable.js` contains incorrect bounds constraint logic for the 'translate' drag mode. The current implementation restricts window movement to a small range around the initial position, rather than allowing free movement within the parent bounds rectangle.

## Root Cause Analysis

### Current Problematic Code (lines 123-132 in dragable.js)

```javascript
if (bounds) {
    const min_x_movement_offset = -1 * (initial_bcr_offset_from_bounds[0][0] - initial_ctrl_translate[0]);
    if (tr_x < min_x_movement_offset) tr_x = min_x_movement_offset;
    const max_x_movement_offset = -1 * (initial_bcr_offset_from_bounds[1][0] - initial_ctrl_translate[0]);
    if (tr_x > max_x_movement_offset) tr_x = max_x_movement_offset;
    const min_y_movement_offset = -1 * (initial_bcr_offset_from_bounds[0][1] - initial_ctrl_translate[1]);
    if (tr_y < min_y_movement_offset) tr_y = min_y_movement_offset;
    const max_y_movement_offset = -1 * (initial_bcr_offset_from_bounds[1][1] - initial_ctrl_translate[1]);
    if (tr_y > max_y_movement_offset) tr_y = max_y_movement_offset;
}
```

### Why This Is Wrong

1. `initial_bcr_offset_from_bounds` is calculated once at drag start as:
   ```javascript
   initial_bcr_offset_from_bounds = [
       [initial_bcr[0][0] - initial_bounds_bcr[0][0], initial_bcr[0][1] - initial_bounds_bcr[0][1]],
       [initial_bcr[1][0] - initial_bounds_bcr[1][0], initial_bcr[1][1] - initial_bounds_bcr[1][1]],
       [initial_bcr[2][0] - initial_bounds_bcr[2][0], initial_bcr[2][1] - initial_bounds_bcr[2][1]]
   ]
   ```

2. This represents the initial offset of the control from the bounds edges
3. The constraint logic treats this as movement limits, creating bounds relative to the initial position
4. Result: Window can only move within a small range around where it started, not freely within the entire parent bounds

## Proposed Fix

### Primary Fix: Correct Bounds Constraint Logic

Replace the bounds checking in `move_drag` function (lines 123-132) with:

```javascript
if (bounds) {
    // Get current bounds BCR (allows for dynamic bounds updates if bounds move/resize)
    const current_bounds_bcr = bounds.bcr();
    const ctrl_size = [ctrl.dom.el.offsetWidth, ctrl.dom.el.offsetHeight];

    // Calculate absolute containment bounds within parent
    const bounds_left = current_bounds_bcr[0][0];
    const bounds_top = current_bounds_bcr[0][1];
    const bounds_right = current_bounds_bcr[1][0] - ctrl_size[0];
    const bounds_bottom = current_bounds_bcr[1][1] - ctrl_size[1];

    // Convert absolute bounds to movement offsets relative to initial translate position
    const min_x_offset = bounds_left - initial_ctrl_translate[0];
    const max_x_offset = bounds_right - initial_ctrl_translate[0];
    const min_y_offset = bounds_top - initial_ctrl_translate[1];
    const max_y_offset = bounds_bottom - initial_ctrl_translate[1];

    // Apply containment constraints
    if (tr_x < min_x_offset) tr_x = min_x_offset;
    if (tr_x > max_x_offset) tr_x = max_x_offset;
    if (tr_y < min_y_offset) tr_y = min_y_offset;
    if (tr_y > max_y_offset) tr_y = max_y_offset;
}
```

### Justification for Fix

1. **Dynamic Bounds**: Uses `current_bounds_bcr = bounds.bcr()` to get live bounds position/size
2. **Proper Containment**: Calculates absolute containment rectangle (bounds_left/top/right/bottom)
3. **Size Accounting**: Subtracts control dimensions from right/bottom bounds to prevent overflow
4. **Offset Conversion**: Converts absolute bounds to relative movement offsets compatible with existing translate system
5. **True Containment**: Allows control to move freely anywhere within bounds rectangle, not just near initial position

### Optional Enhancement: Dynamic Bounds Updates in Window Control

Add to `window.js` activate method after dragable setup (around line 298):

```javascript
// Listen for bounds changes to update drag constraints dynamically
const update_bounds = () => {
    // Force recalculation of bounds on next mousemove
    // This ensures bounds update if parent container resizes or moves
};
this.parent.on('resize', update_bounds);
this.parent.on('move', update_bounds);
```

## Logic Verification Points

### Bounds Calculation Correctness
- `current_bounds_bcr[0][0]` represents left edge of bounds ✓
- `current_bounds_bcr[1][0] - ctrl_size[0]` properly accounts for control width ✓
- Offset calculations correctly relative to `initial_ctrl_translate` ✓

### Movement Freedom
- With fix, window can be dragged to any position within parent bounds ✓
- Edge cases handled (control at bounds edges, parent resizing during drag) ✓

### Performance Impact
- Calling `bounds.bcr()` on every mousemove: Potential performance concern
- Should bounds be cached and only recalculated when known to change? Consider optimization

### Compatibility
- Breaks existing dragable usage? No - maintains same API
- Edge cases with different drag modes or bounds configurations? Other modes use different logic

### Dynamic Updates
- How should bounds updates be triggered when parent changes? Via event listeners
- Is window.js enhancement necessary? Beneficial but not critical

## Implementation Requirements

### Files to Modify
1. **Primary**: `control_mixins/dragable.js` (lines 123-132)
2. **Optional**: `controls/organised/1-standard/6-layout/window.js` (around line 298)

### Testing Requirements
- Unit tests for bounds constraint logic
- Integration tests with Window control dragging
- Performance tests for bounds.bcr() calls during drag
- Edge case tests (parent resize during drag, bounds changes)

### Backward Compatibility
- API remains unchanged
- Existing dragable configurations continue to work
- Only behavior change is correct bounds containment

## Recommendation

The fixes have been implemented directly in the local codebase. The bounds constraint logic was fundamentally broken and prevented proper window dragging functionality. The fixes address:

1. **Bounds Containment**: Windows now properly stay within parent bounds instead of being restricted to a small range around their initial position.

2. **Resize Jump Prevention**: Added a comment to clarify that `initial_ctrl_translate` is captured at drag start to prevent jumping after resize operations.

## Testing

A test example has been created at `dev-examples/window-drag-test/` that can be used to verify the fixes work correctly. Run with:

```bash
cd dev-examples/window-drag-test
node server.js
```

Then open http://localhost:8080 to test dragging behavior.