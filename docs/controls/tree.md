# Tree Control

The `Tree` control renders hierarchical nodes with selection, lazy loading, and keyboard navigation.

## Usage

```javascript
const tree = new controls.Tree({
    context,
    nodes: [
        { text: 'Root', nodes: [{ text: 'Child' }] }
    ],
    multi_select: false,
    drag_reparent: true
});
```

## Options

- `nodes`: array of node specs.
- `multi_select`: enable multi-select ARIA state.
- `drag_reparent`: enable drag-to-reparent nodes.
- `selectable`: enable node selection (default `true`).
- `node_class`: custom node class.

## Lazy Loading

Provide a `load_children` function on a node spec:

```javascript
const tree = new controls.Tree({
    context,
    nodes: [{
        text: 'Lazy Root',
        load_children: async () => [{ text: 'Loaded Child' }]
    }]
});
```

## Keyboard

- `ArrowUp` / `ArrowDown`: move selection through visible nodes.
- `ArrowRight`: expand or move into children.
- `ArrowLeft`: collapse or move to parent.
- `Enter` / `Space`: select active node.

## Methods

- `get_visible_nodes()` returns visible nodes in order.
- `set_active_node(node)` updates active node and ARIA state.

## Tests

- `test/core/tree_controls.test.js`
