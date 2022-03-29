const jsgui = require('../../html-core/html-core');
const Tree = require('../tree');

// This may need to be connected with a resource.
//  Specified with an API.
//   Possibly move to a 'data' or 'connected' dir.
//    or resource? As in it will need access to a resource to work.
//   That resource will be available on the client-side.

// Possibly some controls will only work in a connected mode.



class File_Tree extends Tree {
    constructor(spec) {

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

        const context = this.context;

        // Make the published resources available?



        let fs_resource = spec.fs || spec.fs_resource;
        if (fs_resource) {
            this.fs_resource = fs_resource;
        } else {
            let resources = context.resources;

            // The website resource.
            //  That's critical to many servers.
            //  Don't want to assume it's the only / main resource in all configs though.

            // Or a control's context should be set to the webserver.
            //  That makes more sense.
            //   The webserver (resource) can be encapsulated in a more general server.

            // The FS resource will / may only be published within the website resource
            //  Can have the website resource provide some access code.



            console.log('File_Tree context resources', resources);
            console.log('File_Tree context.resource_pool', context.resource_pool);
            console.log('Object.keys(context)', Object.keys(context));

            // Maybe should assume the website context in some cases, rather than the server context.
            //  Want easier way of accessing the web page context.

            // .page_context ?
            //   get that from the context?
            
            // 

            // find the 'fs' resource within the context.

            // Want to get the website resource.
            //  Maybe do some more work on collections too. Indexing, storing, retrieving, using the tree kvs feature.


            // context.resource_pool.resources

            // Publishing should add a resource to the pool.
            //  It does now, to the website pool.

            // then get the fs resource from the local pool.
            //  Should work on both the client and the server.




            //throw 'stop';

        }

        // can we get it from the page_context resources?



        // Need to respond to events from the fs_resource.
        //  Client-side, it should automatically wire up requests to the resource.


        // Camera could be a camera object that can provide data.
        //  On the client should go through a data service.
        //this.camera = spec.camera;

        //console.log('File_Tree_Node spec', spec);

        if (!spec.el) {
            //let tn;
            this.compose_file_tree();
        }
    }
    compose_file_tree() {
        // Show it at its root.
        //  Async composition?

        // Seems like async composition is necessary.

        // Could even do parse-mount?






    }
    activate() {
        // Client-side, we need to connect to the resource.
        //  Initialise a new Data_Resource?
        //   Or the Data_Resource would have been initialised?

        // Being able to get a list of available resources would be useful.
        //  context.resources
        //   think that's the client-side resource pool?

        // Need to get access to an equivalent resource on the client-side with the same JS API.






    }
}

module.exports = File_Tree;