const jsgui = require('../html-core/html-core');
const Tree_Node = require('./tree-node');

class File_Tree_Node extends Tree_Node {
    constructor(spec) {
        /*
        if (spec.camera) {
            spec.text = spec.camera.name;
        }
        */


        // Could be a directory too?

        if (spec.file) {
            let file = spec.file;
            let filename = file.name;
            spec.text = file.name;
            spec.__type_name = 'file_tree_node';
        }

        spec.expandable = false;

        super(spec);
        this.add_class('file');
        // Camera could be a camera object that can provide data.
        //  On the client should go through a data service.
        //this.camera = spec.camera;

        //console.log('File_Tree_Node spec', spec);





        if (!spec.el) {
            let tn;

            /*
            this.add(tn = new Tree_Node({
                context: this.context,
                text: 'Info'
            }));
            tn.active();
            //console.log('tn.dom.el', tn.dom.el);
            //tn.activate(tn.dom.el);
            let tn_videos;
            this.add(tn_videos = new Tree_Node({
                context: this.context,
                text: 'Videos',
                state: 'contracted'
            }));
            tn_videos.on('expand', e_expand => {
                // if there are 0 nodes then add them...
                (async () => {
                    console.log('e_expand', e_expand);
                    console.log('this.context.cameras', this.context.cameras);
                    console.log('Object.keys(this.context.cameras)', Object.keys(this.context.cameras));
                    let url_files = spec.camera.name + '/files.json';
                    console.log('url_files', url_files);
                    let corner_files = await this.context.cameras.get(url_files);
                    console.log('corner_files', corner_files);
                })();
            });
            // then all the videos for the camera
            console.log('this.camera', this.camera);
            // can get data back through the camera data service.
            // asyncronously load the camera videos data.
            tn.active();
            */
        }
    }
}

module.exports = File_Tree_Node;