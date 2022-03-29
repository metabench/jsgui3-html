

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
  






