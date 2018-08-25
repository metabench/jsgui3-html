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

var controls = {
    Arrow_Button: require('./arrow-button'),
    Audio_Player: require('./audio-player'),
    Audio_Volume: require('./audio-volume'),
    Button: require('./button'),
    Context_Menu: require('./context-menu'),
    Color_Palette: require('./color-palette'),
    Combo_Box: require('./combo-box'),
    File_Upload: require('./file-upload'),
    Grid: require('./grid'),
    Horizontal_Menu: require('./horizontal-menu'),
    Horizontal_Slider: require('./horizontal-slider'),
    Data_Item: require('./data-item'),
    Data_Row: require('./data-row'),
    Date_Picker: require('./date-picker'),
    Dropdown_List: require('./dropdown-list'),
    File_Tree: require('./file-tree'),
    File_Tree_Node: require('./file-tree-node'),
    Item: require('./item'),
    Item_Selector: require('./item-selector'),
    Item_View: require('./item-view'),
    Left_Right_Arrows_Selector: require('./left-right-arrows-selector'),
    //Vector: require('./vector'),
    Line_Chart: require('./line-chart'),
    List: require('./list'),
    Login: require('./login'),
    Media_Scrubber: require('./media-scrubber'),
    Menu_Node: require('./menu-node'),
    Month_View: require('./month-view'),
    //Multi_Document_Interface: require('./multi-document-interface'),
    Multi_Layout_Mode: require('./multi-layout-mode'),
    Object_Editor: require('./editor/object'),
    Panel: require('./panel'),
    Plus_Minus_Toggle_Button: require('./plus-minus-toggle-button'),
    Popup_Menu_Button: require('./popup-menu-button'),
    Radio_Button: require('./radio-button'),
    Radio_Button_Group: require('./radio-button-group'),
    Resize_Handle: require('./resize-handle'),
    Scroll_View: require('./scroll-view'),
    Scrollbar: require('./scrollbar'),
    Single_Line: require('./single-line'),
    Start_Stop_Toggle_Button: require('./start-stop-toggle-button'),
    Tabs: require('./tabs'),
    Tabbed_Panel: require('./tabbed-panel'),
    Text_Field: require('./text-field'),
    Text_Item: require('./text-item'),
    Text_Input: require('./text-input'),
    Tile_Slider: require('./tile-slide'),
    Timespan_Selector: require('./timespan-selector'),
    Title_Bar: require('./title-bar'),
    Titled_Panel: require('./titled-panel'),
    Toggle_Button: require('./toggle-button'),
    Tree: require('./tree'),
    Tree_Node: require('./tree-node'),
    Vertical_Expander: require('./vertical-expander'),
    Window: require('./window'),


    mx: require('../control_mixins/mx')
}

module.exports = controls;