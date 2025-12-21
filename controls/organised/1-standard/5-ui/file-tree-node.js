const Tree_Node = require('./tree-node');

class File_Tree_Node extends Tree_Node {
    constructor(spec = {}) {
        if (spec.file || spec.entry) {
            const file_entry = spec.file || spec.entry;
            if (file_entry.name) {
                spec.text = file_entry.name;
            }
            if (file_entry.path) {
                spec.path = file_entry.path;
            }
            if (file_entry.is_directory !== undefined) {
                spec.expandable = !!file_entry.is_directory;
            }
            if (file_entry.type === 'directory') {
                spec.expandable = true;
            }
        }

        spec.__type_name = 'file_tree_node';
        if (spec.expandable === undefined) {
            spec.expandable = false;
        }

        super(spec);
        this.add_class('file');
        if (this.expandable) {
            this.add_class('directory');
        }
        if (spec.path) {
            this.path = spec.path;
        }
    }
}

module.exports = File_Tree_Node;
