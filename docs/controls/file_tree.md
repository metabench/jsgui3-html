# File_Tree Control

The `File_Tree` control extends `Tree` with file/directory node helpers.

## Usage

```javascript
const file_tree = new controls.File_Tree({
    context,
    nodes: [
        { text: 'src', expandable: true, nodes: [{ text: 'index.js' }] }
    ]
});
```

## Options

- `nodes`: initial file tree nodes.
- `load_children`: async loader for lazy directories.
- `fs` / `fs_resource`: optional resource used by `load_children`.
- `root_path`: path passed to the loader when no node path is set.

## Notes

- `File_Tree_Node` adds `file` and `directory` CSS classes.
- Directory nodes can be marked with `expandable: true`.

## Tests

- `test/core/tree_controls.test.js`
