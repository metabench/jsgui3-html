const jsgui = require('../html-core/html-core');
const Tree = require('./tree');

class File_Tree extends Tree {
    constructor(spec) {
        /*
        if (spec.camera) {
            spec.text = spec.camera.name;
        }
        */

        spec.__type_name = 'file_tree';

        // Could be a directory too?
        /*
        if (spec.file) {
            let file = spec.file;
            let filename = file.name;
            spec.text = file.name;
            
        }
        */


        // FS_Resource is an obvious data source.
        


        //spec.expandable = false;

        super(spec);
        this.add_class('file tree file-tree');


        let fs_resource = spec.fs || spec.fs_resource;
        if (fs_resource) {
            this.fs_resource = fs_resource;
        }

        // Need to respond to events from the fs_resource.
        //  Client-side, it should automatically wire up requests to the resource.


        // Camera could be a camera object that can provide data.
        //  On the client should go through a data service.
        //this.camera = spec.camera;

        //console.log('File_Tree_Node spec', spec);

        if (!spec.el) {
            //let tn;
            compose_file_tree();
        }
    }
    compose_file_tree() {

    }
    activate() {

    }
}

module.exports = File_Tree;