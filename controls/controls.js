/**
 * Created by James on 16/09/2016.
 */
// Standard control set
// Addon projects?
//  Control projects?
//  Control repos
//  Control packages?
// Package is the right terminology
// Standard control package
// Flexiboard control package
// Control packages can be chained so they add to each other, add to jsgui?
//  Or may be worth breaking out of that object to store controls at some points?
// Get jsgui2 into a more stable core, with useful controls, and then also build control packages.
// In many cases, it makes sense for controls to be registered with jsgui, but it may be best not to require it when not necessary.
// Could add a lot of controls to the jsgui object here.

// Observable_View
// Observer
// Observer_Multi_UI
//  could have plugs / hooks
//  different ways of viewing items.


// Also want a view a bit like VS code.
//  Application_View
//   Do want a full screen observable / observables application view.

// Or tree view.
//  Maybe will access that tree through a Data_Resource.


// May be worth taking Data_Resource out of jsgui3



// Be able to connect the UI to the Data_Resource_Pool
// 
//  Could do with a few more automatic data resources / resources
//  Want to be able to administer images
//   Add and remove
//    A general purpose KVS for use as a cms would help.
//   Specialised image cms would be very useful too.
//    Different versions of images, getting file hashes of them, resized versions including small thumbnails.





//  Data_Resource_Pool
//  Client_Data_Resource_Pool
//  Server_Data_Resource_Pool

// Then these resources and resource pools get published through a resource publisher.
//  Would need admin auth.

// Auth_Data_Resource
//  Have some app logic, and a few DB connectors / adapters.

// Need a few data adapter sets.
//  May be able to specify them using functional programming.




var controls = {
    Arrow_Button: require('./vector/arrow-button'),
    //Audio_Player: require('./audio-player'),
    Audio_Volume: require('./audio-volume'),
    Button: require('./button'),
    Context_Menu: require('./context-menu'),
    //Control: 
    Color_Palette: require('./color-palette'),
    Combo_Box: require('./combo-box'),


    // Not using (data-)connected controls.
    //Data_Grid: require('./connected/data-grid'),

    File_Upload: require('./file-upload'),
    Grid: require('./grid'),
    Horizontal_Menu: require('./horizontal-menu'),
    Horizontal_Slider: require('./horizontal-slider'),
    //Data_Item: require('./data-item'),
    Data_Row: require('./data-row'),
    Date_Picker: require('./date-picker'),
    Dropdown_List: require('./dropdown-list'),


    // Exclude the connected ones for the moment.
    //File_Tree: require('./connected/file-tree'),
    //File_Tree_Node: require('./connected/file-tree-node'),

    Item: require('./item'),
    Item_Selector: require('./item-selector'),
    Item_View: require('./item-view'),
    Left_Right_Arrows_Selector: require('./vector/left-right-arrows-selector'),
    //Vector: require('./vector'),
    Line_Chart: require('./vector/line-chart'),
    List: require('./list'),


    // could be in forms / standard forms.
    Login: require('./login'),


    //Media_Scrubber: require('./media-scrubber'),
    Menu_Node: require('./menu-node'),
    Month_View: require('./month-view'),
    //Multi_Document_Interface: require('./multi-document-interface'),
    Multi_Layout_Mode: require('./layout/app/multi-layout-mode'),
    //Object_Editor: require('./editor/object'),
    Panel: require('./layout/panel'),
    Plus_Minus_Toggle_Button: require('./plus-minus-toggle-button'),
    Popup_Menu_Button: require('./popup-menu-button'),
    Radio_Button: require('./radio-button'),
    Radio_Button_Group: require('./radio-button-group'),
    Resize_Handle: require('./resize-handle'),
    Scroll_View: require('./scroll-view'),
    Scrollbar: require('./scrollbar'),
    Single_Line: require('./layout/single-line'),
    Start_Stop_Toggle_Button: require('./start-stop-toggle-button'),
    Tabbed_Panel: require('./layout/tabbed-panel'),
    Text_Field: require('./text-field'),
    Text_Item: require('./text-item'),
    Text_Input: require('./text-input'),
    Tile_Slider: require('./layout/tile-slide'),

    // May be moved to vector?
    Timespan_Selector: require('./timespan-selector'),
    Title_Bar: require('./layout/title-bar'),
    Titled_Panel: require('./layout/titled-panel'),
    Toggle_Button: require('./toggle-button'),
    Tree: require('./tree'),
    Tree_Node: require('./tree-node'),
    Vertical_Expander: require('./layout/vertical-expander'),
    Window: require('./layout/window')//,
    //mx: require('../control_mixins/mx')
}

// Could definitely do with improved html / xhtml like control parsing and composition.
//  Done the basics of it, may need to improve it to cover more cases.
//  Can use this to cut down on composition code.

// compose, render, activate, modify

module.exports = controls;