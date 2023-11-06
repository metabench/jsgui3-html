

// Could have this render something relatively simple to start with???

// Though investigating how it works with data types and data models will be helpful.

// Having it able to parse / load data from strings into data values / data objects will help, as they may
//   be there within (possibly hidden when using JS?) text inputs, or other basic html elements.

// Maybe it's worth testing the rendering of a whole page here....?

//  Then looking into specific things on it....

//  Also could test some kind of fake? activation on it?
//    Maybe too much code complexity needed for that in the short term.

// Data types are very important too....
//   Want to make sure various things to do with modelling and syncing data correctly, according to the type / schema, works
//     correctly, and also very simply on the higher level API.


// Need to get into testing what would be the server-side generation of HTML.
//   Or at least most of the HTML, possibly not the references to js and css???

// Benchmarking things here would help, trying to get perf numbers in terms of operations / reads / updates per second.
//   That way when developing more and using more complex low and mid-level, can see the speed impact.

// So let's create a HTML page document control, with a window and with a text field or two in that window.

//   Could test for server-side and isomorphic handling of field value changes.
//     And test how long it takes to do 10K / how many get done in 0.25 or 0.1s.

// How many get done in 17ms? 1ms? Number of operations per 1ms could help too - or maybe per 10ms?
//   That's most of the time buffer for a frame at 60fps.

// This may be a good way / place for testing for the speed of setting values with specific and validated types.

// These typed features would / could help a lot with color palette.
//   Should be easy to define, set, create and use these data types.















