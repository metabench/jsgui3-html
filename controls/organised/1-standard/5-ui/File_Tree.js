const Tree = require('./../../1-standard/5-ui/Tree');
const File_Tree_Node = require('./File_Tree_Node');

class File_Tree extends Tree {
    constructor(spec = {}) {
        const fs_resource = spec.fs || spec.fs_resource || null;
        const root_path = spec.root_path || spec.path || '';
        const load_children = typeof spec.load_children === 'function'
            ? spec.load_children
            : (fs_resource ? async node => {
                if (fs_resource.list) {
                    return fs_resource.list(node.path || root_path);
                }
                if (fs_resource.get) {
                    return fs_resource.get(node.path || root_path);
                }
                return [];
            } : null);

        if (!spec.nodes && load_children) {
            spec.nodes = [{
                text: root_path || 'Root',
                path: root_path,
                expandable: true,
                load_children
            }];
        }

        spec.__type_name = 'file_tree';
        spec.node_class = File_Tree_Node;

        super(spec);
        this.add_class('file tree file-tree');
        this.fs_resource = fs_resource;
        this.root_path = root_path;
        this.load_children = load_children;
    }
}

module.exports = File_Tree;
