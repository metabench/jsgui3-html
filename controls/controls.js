
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

    // Exclude the connected ones for the moment. Moment passed.

    File_Tree: require('./connected/file-tree'),
    File_Tree_Node: require('./connected/file-tree-node'),
    Icon: require('./icon'),
    Item: require('./item'),
    Item_Selector: require('./item-selector'),
    //Item_View: require('./old/item-view'),
    Left_Right_Arrows_Selector: require('./vector/left-right-arrows-selector'),
    //Vector: require('./vector'),
    Line_Chart: require('./vector/line-chart'),
    List: require('./list'),

    // could be in forms / standard forms.
    Login: require('./login'),

    //Media_Scrubber: require('./media-scrubber'),
    Menu_Node: require('./menu-node'),
    Modal: require('./layout/modal'),

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

    Search_Bar: require('./search-bar'),

    Single_Line: require('./layout/single-line'),

    Standard_Web_Page: require('./page/standard-web-page'),

    Start_Stop_Toggle_Button: require('./start-stop-toggle-button'),

    String_Span: require('./string-span'),

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
    Toolbox: require('./toolbox'),
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