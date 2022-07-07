2022 - For them moment, will not make substantial additions to the code in control-core, control-enh.
Will make additional functionality available through mixins.
May make ctrl-enh use those mixins.
Could even move ctrl-enh code to new mixins.
Not sure.
Improving Collection could help Control on a lower level.

Next piece of functionality:
  .display or .display_modes property.

  .display makes most sense because can have .display.modes, .display.mode and it's a decent short word to open up a lot more API.

  This will be a programmer friendly way to declare how controls will display when they could display in a variety of different ways
  More flexibility when writing controls.

  ctrl (or this) .display.modes.setup(o_display_modes_setup) perhaps.
  Want to make the control functionality available from outside control constructor functions and class functions too.






