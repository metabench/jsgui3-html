

#control-core.js

The file control-core.js is a JavaScript file that defines a class called Control_Core. This class extends the Data_Object class from the lang-tools library. The Control_Core class is a base class for controls in the jsgui library, which is a collection of components for building user interfaces. The Control_Core class provides a number of methods and properties for managing a control's DOM element, position, size, and other aspects of its appearance and behavior. Some of the key methods defined in the Control_Core class include:

add_class(): Adds a CSS class to the control's DOM element.
has_class(): Checks if the control's DOM element has a given CSS class.
remove_class(): Removes a CSS class from the control's DOM element.
click(): Adds an event listener for the "click" event.
find_selection_scope(): Returns the selection scope for the control (if it has one).
matches_selector(): Returns whether the control's DOM element matches a given CSS selector.
is_ancestor_of(): Returns whether the control is an ancestor of a given element.
The Control_Core class also defines properties for managing the control's size, position, background, and other visual aspects. These properties include size, pos, background, and disabled. The Control_Core class uses the Proxy object to define setters and getters for these properties, which allows the class to automatically update the control's appearance whenever one of these properties is changed.





