
JSGUI3-HTML Improvements Roadmap
===============================

This section translates `docs/jsgui3_html_improvement_plan.md` into phased milestones.

Phase 1: Core and reliability
-----------------------------
- Add missing native inputs: textarea, number, range, progress, meter.
- Add compositional basics: toggle switch, badge, inline validation message.
- Fix known control bugs (checkbox `el_radio` typo, `checked` sync).
- Baseline a11y on core inputs (roles, labels, focus states).
- Normalize naming duplicates with deprecation aliases.

Phase 2: Data and forms
-----------------------
- Data table with sort, filter, pagination, and a11y semantics.
- Virtual list/grid for large datasets with windowed rendering.
- Form container with validation routing and inline errors.
- Tag/chip input and object editor improvements (schema-driven).
- Reconnect or replace `controls/connected/data-grid.js` with a modern API.

Phase 3: Layout and advanced UX
-------------------------------
- Split pane, accordion, drawer, stepper.
- Window/panel enhancements: snap, dock, resize, z-index management.
- Tree and file tree: lazy loading, multi-select, drag reparent.
- Theming tokens and theme context; improve swaps approach.

Documentation and tests
-----------------------
- Add docs entries for new controls and update README.
- Add dev-examples for complex controls (data table, virtual list, form).
- Add E2E tests for interactive examples; add unit tests for helpers.


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



Could do with examples
    Rendering a few pages of HTML?
    Does that need to be on the server?
    Can it happen within the HTML module?
    Maybe just rendering the HTML would be enough here.


Examples within server could make most sense.
Integration of CSS seems important here...

Want to make a few decent examples on the server.

Multiple available models per Control should be supported - meaning its only using one model at once (or not... could be interesting, could code active_models_limit = 1 and then do other coding in the future to support multiple active models)

Control_Models extends Collection
Control_Views extends Collection

Definitely seems as though building a new Control class from scratch makes the most sense for the MMMVC or MultiModelMultiViewControl class.

MultiModelMultiViewViewModelControl even
  Each view has 1 viewmodel
    Could it have the standard properties model as well as extended properties model?
      Or make the extended properties model extend the standard properties model?
        Will do model extension code if necessary in the future.

May be worth making separate module for these multi-model multi-view (view view-model) controls.
  Get back to breaking some functionality (incl new and upgraded) out of jsgui3?

mmmv-control module perhaps
  The core of it will / should be separated from HTML DOM assumptions?
  And have a specific type of View which gets rendered as HTML.
  Other View type could be rendered as React-Native for example.

A View supporting multiple ViewModels?
  Kind of, in that a model can support different data types?
  Could make sense with both general and control-specific properties. Each model could be or be like an interface.

  Multiple (active) models could work for comparer controls for example. 

Model supporting being substituted for other models?
Multiple signifiers - 'calendar' is an English word, it could be signified in other languages.
  And then a simple text definition of a calendar? Text explanation of it?
  Could (later) involve AI for code writing, which learns how to do the conversions / syntaxes from training data.

srtypes works as a name because there will be a system to register these SR_Types (or SRTypes)

Signifier being a type of representation.
  Symbolic (signifier) representation
Consider compositional representation (eg a large red car), large and red being adjectives that describe the composition of the object.
  Consider adjective use....
    Adjective as descriptive

Compositional / descriptive representation
  Signifiers of those types of representation as well.

Exact composition?
Composition rules?
Definition being part of a system to identify it?
When is the definition built into the word being used?

String names for various types, but put in a framework where it knows the context, and that those names are themselves symbolic representations.

Types being compositional...
  Or the representations being compositional

  Maybe it's all representations, or almost...

  A type definition?
    Though it's more of a definition of the type in one sort of representation or system.

  Different systems may be a good word. As in there are different calendar systems.
    The calendar system could be named, and also have programmatic and/or logical rules.

Sooner or later, want to make a GUI app for dealing with these types.

Type signifiers will generally be words, or programming words and phrases.
Maybe the signifier could be (much more like) a simple English sentence that expresses what it is.
Type notations... these notations are themselves different systems to represent them.

Don't want to get stuck in definitions - want to get stuck into definitions.

Does look like making this elsewhere and putting the core and/or basics into lang-mini would work best.
Lang-types may be best even.

Different types in different languages...

lang-types uses lang-mini
and lang-tools uses / has lang-types

So lang-types won't be in lang-mini for a while at least.
Perhaps lang-mini can be adapted for compatability in a few places.

Full lang-types could be quite complex.
A simple lang-mini implementation would be nice.

Worth doing a little work on a lang-types repo and package though.
Would use lang-mini platform.
Would be nice to have an answer / system for an overall type having different subtypes / ways of expressing it.
  Dates being a common and somewhat complex example.
    But often that complexity is ignored / has convenient coding conventions already.




















multimodel-multiview-viewmodel-control





