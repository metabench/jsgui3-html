Mixins allow for composition of Control functionality.
Enables functionality to be made in a way that will apply to controls in general

Specific mixins? That require a specific API?
Only works on input elements for example?

.view seems apparrent as an ovbious property name now.
.model also seems like it could be of use.
Now only .controller seems as though it my be excessive, with the control itself being the controller.

.model holding (and sometimes acting like) .value.
Would still have a .value property, or allow for one. Could become more standard.
ctrl.value may be a useful property in many or most cases.
  Too complicated to be useful or efficient in some cases? Or it would correspond with .model.
  Maybe it could be iterable or something efficient.


// ctrl.view.size.mode = 'mid-icon'.
// or when writing the control, write code that operates specific to the view's size mode.

// and single (horizontal) line size mode. May be very relevant for text input, eg input a directory name.

// view.rounding = '4px'. view.box.rounding perhaps?

// The model and view distinction will help with situations such as different rendering on mobile and desktop, but
//   where the data being edited is and must be the same format.
//   Would help to make it clearer what functionality gets swapped.

// Need to incrementally add these features.
//   The base implementation can be added, then controls made to make use of them.

// view.size.mode = 



Or size modes are variable depending on what the control displays anyway?
Don't want some very info-sparse things to become full screen too readily (like windows 8 in places)
Allow the programmer to have easy control over them
Then give the programmer the components to give the application user easy control over them

Can have different UI tools available such as minimise to list.





Different size modes here?
0 - 0,0 hidden
1 - 1,1 1 pixel square ?? unnecessary ?? or the tinyiest, maybe make as 0,0 anyway
2 - defaults as very small eg 12x12
    but could show as 16x16? even 32x32 on high-res?
3 - mini eg 24x24
4 - small-mid icon size eg 32x32, 64x64
5 - mid icon size 128x128
6 - large thumbnail / large icon 256x256 / small picture
7 - business card size eg 512x512, 512x1024 (or mini app size?)
8 - mid app window eg 980x1400 iPhone screen
9 - large app window eg a tablet?
10 - full screen (or maximised app window, almost full screen??)
11 - multi screen / appears in multiple browser windows for size


or:

0: hidden
1: minimised (such as an icon, or item in a list (popup list that shows the minimised items maybe))
2: small / showing
     (if too small to use, preview or very restricted info)
3: mid
    could expect maybe 1/4 or even 1/2 of a large screen. decent sized panel.
4: large
    could be full screen or full size of browser window
      may need some flexibility and functionality to determine exactly how it is operating.


// Mode 0 probably needs no definition in the Control code.
// Mode 1: mini(mised)
// Mode 2: small
// Mode 3: medium
// Mode 4: large

// Mobile first would be a focus on mode 2.

// Mode 4 maybe won't need much definition or any at all.
//  Could be some automatic differences from mode 3
//    Such as nav panel on the left visible rather than requires press to make popup show the nav.

// Mode 3 could show 2 (or even 3) mode 2 views side-by-side
// Then mode 4 could show 2 mode 3s above and below.

// They can act as guidelines for how much functionality can be made to fit into a currently vaguely defined area of UI.
//   Could make a more precise definition, such as 'small' has to fit on some specific iPhone, such as iPhone SE.
//     And could have options / sensible defaults about how things get displayed in slightly larger areas, but still essentially
//       the same layout.






Could even make a Small_Calendar Control perhaps?
  With a built in restriction that it only works in 'small' mode, or if it is used in a larger mode it either just shows small
  or enlarged but not customised for the larger display area.
  Essentially Small_Calendar would not be dense with information, it could display well on a big screen at a conference.
    Could display well on a mobile phone screen.

Large_Calendar could use the same code elements (controls?) as the Medium or Mid_Calendar

// S_Calendar?
// Calendar_S perhaps?

Calendar seems like a very good fairly general purpose UI control to really focus on.
Not all that complex, but somewhat complex.
Very useful
Could potentially contain somewhat complex data, flexibility on how it gets displayed.

Data Connector as well?
We can have the data model definition. Then the data itself gets obtained from / synced with some external source.

Model.data could make sense....
Even model.data.value
     model.data.connection makes sense.

Not all controls would need a defined model, or data.
.data would automaticaly apply to .model I think.

Type definitions looks like it's within Grammar.
Want to be able to represent the types in different ways, but the most efficient and lowest level ways seems great to have, possibly as a default.
IO as JSON of course would be of use.
  Could use JSON string hexes for the sake of coding simplicity if we do use binary data at a lower level.
    Maybe 24 and 32 bit integers for representing colors rgb and rgba in various places.

Some of this possibly goes in lang-mini or lang-tools?
Or another lang lib?

jsgui3-mvc perhaps?
Seems more like it't the next part of html.
It's kind of a layer on top of the existing core.
It may also be a replacement for some of the existing core. Possibly functionality will be put in place with mixins.
Maybe activation will be done through a mixin. Not sure....?

Definitions of what controls do specifically to data
Then can get into details of how they do it.

Control interface? Control data interface? Data model data schema?
Simply expressing what type of data a control works with makes sense.
However want this to be extensible when appropriate... will find a way to do that of course.

Many current mixins are (only) to do with the view.
The date mixin is to do with the model.

Will be better to set up the control so that it knows what data type it's interacting with.

Possibly jsgui3-model does make a lot of sense to start.
It's the data model. It's the class that represents / is the data model (rules).
Then it's the data itself.

Then a schema API....?
  Want it to be flexible.
  A few options to base it on

A number
A binary sequence (even length in bits???)
  Length in bits could make sense for UI to do with components of larger values.
A string
Some JSON
  With that JSON following some rules...?

A validate function being enough?
A normalise function too? As in it takes a value expressed somehow, parses / corrects it if possible (and checks its valid too)?

Want a fairly consistent API.
.validate
.parse (could be used even when input is expected to be in the right format)

Always use observables for these functions?
Could work better with remote execution (of parts), easy integration of remote execution, or processing in other threads.










model.schema?
model.value?













May have some shortcuts.
Or could make then once the coding conventions / boilerplate that emerges becomes clearer.








So 5 overall size modes could be enough.
May be worth doing more work on specifically editing online values and maybe text.
Could be a nice focus. Having components that do it in a nice way, and specified so that less code needs to be changed to change the 
way the UI works, easy to add to or modify standard UI options.

Construction / amendment / composition functions.
External calling of controls' composition functions would work here.
  So to extend a color palette or calendar control, there are already functions to compose it that can be used (or not used) by subclasses.
    Could make them available at the module / constructor level ie Control.composition_functions or whatever.







The size mode could influence display modes of inner components?


// icon, small, mid, large, max
//  possible display modes.

// Not just size display mode options
//  Horizontal or vertical option for some things.
//   Like menus.

// When defining the display modes:
//  Declare / define the supported display modes
//   with names?
//  The display modes don't need to be mutually exclusive
//  Though display mode sets would be exclusive.
//  Display mode option sets?
//   Meaning exclusive horizontal or vertical.
//   Exclusive small or large, but can be small horizontal etc.

// Display modes may become a kind of 'core' functionality for every control.
//  Or the more complex controls at least.
//  Still makes sense to have some controls not using them.






// Could have various different approximate display shapes too

// Item control
// item.data property
//  and it renders that data.
//   options for how it renders the data
//    and that can depend on various display mode settings.

// Display_Mode class?
//  So it's the overall characteristics of how a Control gets displayed.
//   May be better applied as a mixin.
//   Mixin could use a Control_Display_Mode class. Or Control_Display_Modes possibly...?
//    Control_Display_Mode_Environment ???
//     So that control itself has a Display_Mode_Environment ???
//      And then when a Display_Mode is used, it's an Active Display_Mode.

// Display_Modes mixin
//  Would add the Control_Display_Modes class instance to the Control instance
//   Then specific display mode settings would be used

// Better to start simply?
//  Use various size presets?
//  Set up the size presets?

// Display modes for both size and style / other appearance properties?
//  Perhaps.

// Display modes config...
//  Could have to do with the available interactions, so more than just show and hide and size which can be done through CSS.

// A programmatic description of how things get displayed.
//  And in general terms.

// Applying some general principles
//  Determining the layout from the content and available space.

// Upgradability of existing controls would be useful too.
//  eg Color_Palette serves as a core for color palette functionality.
//  Subclasses would be able to add / swap components.
//   Or a different display mode setup can hook into such changes?
















// square
// rect
//  4:3, 3:4
//  16:10, 10:16
// full size in one direction
// full size in both x and y directions
// extended (popup) full size




// notdisplayed
// 1pixel?
// vsmall icon
// small icon
// smallmid icon
// mid icon
// large icon
// businesscard / smallapp / smallphoneapp?
// midapp
// largeapp
// fullscreen
// multiscreen

// fulllargescreen

// A Control could work out what needs to be displayed depending on its size.
// Could be displayed / rendered very differently depending on its size.

// Popup / popout / popover resizing would be useful for interacting with smaller components. Editing near same place too.

// How can the Control be represented at all of these different sizes?
// Could consider news stories being presented... headlines, abbreviated headlines, headline and thumbnail, headline and intro, headline and some of the story, headline and full story.

// Mid icon with enough room for text? Would be wider so it can contain a name.
//  Could make some examples with info on cities... info on planets...







