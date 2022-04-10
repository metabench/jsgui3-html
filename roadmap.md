

Make the current controls use parse_mount to save code.
Will be clearer and simpler to code in.
More complex underlying system.





Observable features
    Doing more on the underlying ofp system could help jsgui3 to work in a more standardised way.
    

Examples and tests
Interested in getting screenshot-type renderings of controls. This could be tested against.
See where appearance regressions occurr on a wide variety of controls.

Want to improve styling / theming /rendering.

Smaller examples with controls.
Styling / theming properties set.

Creation of / interaction with stylesheet(s)?
Want flexible system for styles, but also sensible defaults.

Themes definitely make sense.
Also different layouts / css for different devices / screen sizes.

Want it to be easy to create / adapt a theme for an app.

Controls having different rendering for different outputs?
Sizes as small, medium, large, also taking into account the device.
    And possibly heirachy within document?

tiny, small, medium, large, huge
// easy enough scale for sizing
//  could be done with some kinds of sizing table(s).


Icons
-----

Being able to make access to icons very easy will be very useful.
Load / register icons on the server
Be able to reference and use them on both the server and the client.
    Serving with auto-resizing too?
        Would make sense.

So will have more capabilities within jsgui server for the moment.



changes
ctrl.changes({obj change functions})
Would be a useful API lower down.
such as in evented_class?
//  so if there is a 'change' call it checks aganst a specific changes map
    Seems like it would be fastest.
  


0.0.92 onwards:
Will make jsgui3-server work as a standalone command line app.
Various pieces of functionality useful for web servers will be available.
Could even operate as an FTP server?
Want it so that when an empty server is started, it's possible to configure it from a server admin console.
Maybe not to do all that much to start with
Things like compiling code, or viewing through an admin interface what code has compiled.
A file viewer perhaps, viewing files in that directory from where jsgui-server was called.
Installing it to run from the command line.
    probably npm install jsgui3-server -g

Even showing it within a WebView type window, packaged maybe with Electron.

The jsgui3-server app, through its admin interface, should have some place where compilation can be done and monitored.
A file manager type interface would help with directories and items on the FS to be compiled.
Also want compilations that work in memory without needed into access the FS. I think Babel can do this once the
references are loaded, and it outputs as one file.


Babel may become a dev dependency?
Lightweight code deployments will remain a priority, may even increase.
Allowing for compilation of other langs' code to WASM seems very important too.








