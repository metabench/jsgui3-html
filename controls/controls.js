



const controls = {
    Active_HTML_Document: require('./organised/1-standard/5-ui/Active_HTML_Document'),
    Arrow_Button: require('./organised/0-core/1-advanced/vector/arrow-button'),
    //Audio_Player: require('./audio-player'),
    Audio_Volume: require('./organised/1-standard/5-ui/audio-volume'),
    Button: require('./organised/0-core/0-basic/0-native-compositional/button'),
    Cell: require('./organised/0-core/0-basic/1-compositional/Cell'),
    // Maybe more advanced?
    Context_Menu: require('./organised/0-core/0-basic/1-compositional/context-menu'),
    //Control: 
    Color_Grid: require('./organised/0-core/0-basic/1-compositional/color-palette'),
    Color_Palette: require('./organised/0-core/0-basic/1-compositional/color-palette'),
    Checkbox: require('./organised/0-core/0-basic/0-native-compositional/checkbox'),
    Combo_Box: require('./organised/0-core/0-basic/1-compositional/combo-box'),
    Dropdown_Menu: require('./organised/0-core/0-basic/1-compositional/Dropdown_Menu'),
    // Not using (data-)connected controls.
    //Data_Grid: require('./connected/data-grid'),
    File_Upload: require('./organised/0-core/0-basic/0-native-compositional/file-upload'),
    Form_Field: require('./organised/1-standard/1-editor/form_field'),
    // maybe 0-basic/0-layout?
    //  A layout control may be / need to be displayed a little differently.
    Grid: require('./organised/0-core/0-basic/1-compositional/grid'),
    Grid_Cell: require('./organised/0-core/0-basic/1-compositional/grid').Cell,
    Horizontal_Menu: require('./organised/1-standard/5-ui/horizontal-menu'),
    Horizontal_Slider: require('./organised/1-standard/5-ui/horizontal-slider'),
    //Data_Item: require('./data-item'),
    Data_Row: require('./organised/1-standard/4-data/data-row'),
    Date_Picker: require('./organised/0-core/0-basic/0-native-compositional/date-picker'),
    Dropdown_List: require('./organised/0-core/0-basic/0-native-compositional/dropdown-list'),
    // Exclude the connected ones for the moment. Moment passed.
    // May not need to actually be 'connected'?
    //  Or other controls may get data connections too.
    File_Tree: require('./organised/1-standard/5-ui/file-tree'),
    File_Tree_Node: require('./organised/1-standard/5-ui/file-tree-node'),
    Icon: require('./organised/0-core/0-basic/0-native-compositional/icon'),
    Item: require('./organised/0-core/0-basic/1-compositional/item'),
    Item_Selector: require('./organised/0-core/0-basic/1-compositional/item-selector'),
    //Item_View: require('./old/item-view'),
    Left_Right_Arrows_Selector: require('./organised/1-standard/2-misc/left-right-arrows-selector'),
    //Vector: require('./vector'),
    Line_Chart: require('./organised/1-standard/5-ui/line-chart'),
    List: require('./organised/0-core/0-basic/1-compositional/list'),
    // could be in forms / standard forms.
    Login: require('./organised/0-core/1-advanced/login'),
    //Media_Scrubber: require('./media-scrubber'),
    Menu_Node: require('./organised/0-core/0-basic/1-compositional/menu-node'),
    Modal: require('./organised/1-standard/6-layout/modal'),
    Month_View: require('./organised/0-core/0-basic/1-compositional/month-view'),
    //Multi_Document_Interface: require('./multi-document-interface'),
    Multi_Layout_Mode: require('./organised/1-standard/6-layout/app/multi-layout-mode'),
    //Object_Editor: require('./editor/object'),
    Panel: require('./organised/1-standard/6-layout/panel'),
    Plus_Minus_Toggle_Button: require('./organised/0-core/0-basic/1-compositional/plus-minus-toggle-button'),
    Property_Editor: require('./organised/1-standard/1-editor/property_editor'),
    // More advanced functionality - may require more work to keep it with the right APIs.
    Popup_Menu_Button: require('./organised/0-core/1-advanced/popup-menu-button'),
    Radio_Button: require('./organised/0-core/0-basic/0-native-compositional/radio-button'),
    Radio_Button_Group: require('./organised/0-core/0-basic/1-compositional/radio-button-group'),
    //Resize_Handle: require('./organised/0-core/0-basic/_resize-handle'),
    Rich_Text_Editor: require('./organised/1-standard/1-editor/Rich_Text_Editor'),
    Scroll_View: require('./organised/0-core/0-basic/1-compositional/scroll-view'),
    Scrollbar: require('./organised/0-core/0-basic/1-compositional/scrollbar'),
    Search_Bar: require('./organised/1-standard/5-ui/search-bar'),
    Select_Options: require('./organised/0-core/0-basic/0-native-compositional/Select_Options'),
    Single_Line: require('./organised/1-standard/6-layout/single-line'),
    Standard_Web_Page: require('./organised/1-standard/3-page/standard-web-page'),
    Start_Stop_Toggle_Button: require('./organised/1-standard/5-ui/start-stop-toggle-button'),
    String_Span: require('./organised/0-core/1-advanced/string-span'),
    Tabbed_Panel: require('./organised/1-standard/6-layout/tabbed-panel'),
    Text_Field: require('./organised/0-core/0-basic/1-compositional/Text_Field'),
    Text_Item: require('./organised/0-core/0-basic/1-compositional/text-item'),
    Text_Input: require('./organised/0-core/0-basic/0-native-compositional/Text_Input'),
    Tile_Slider: require('./organised/1-standard/6-layout/tile-slide'),
    // May be moved to vector?
    Timespan_Selector: require('./organised/0-core/0-basic/1-compositional/timespan-selector'),
    Title_Bar: require('./organised/1-standard/6-layout//title-bar'),
    Titled_Panel: require('./organised/1-standard/6-layout/titled-panel'),
    Toggle_Button: require('./organised/0-core/0-basic/1-compositional/toggle-button'),
    Toolbar: require('./organised/1-standard/5-ui/Toolbar'),
    Toolbox: require('./organised/1-standard/5-ui/toolbox'),
    Tree: require('./organised/1-standard/5-ui/tree'),
    Tree_Node: require('./organised/1-standard/5-ui/tree-node'),
    Vertical_Expander: require('./organised/1-standard/6-layout/vertical-expander'),
    Window: require('./organised/1-standard/6-layout/window'),//,
    //mx: require('../control_mixins/mx')
    Indicator: require('./organised/0-core/0-basic/1-compositional/Indicator'),
    Status_Indicator: require('./organised/0-core/0-basic/1-compositional/Status_Indicator'),
    Validation_Status_Indicator: require('./organised/0-core/0-basic/1-compositional/Validation_Status_Indicator')
}

// a show_validation_status mixin perhaps???
// though having a place in the control where it can display the validation status would be nice too.
//   The validation status of the view.model
//     view.model.validate perhaps ....?

// Though having the view model copy the data model, including data type and validation function.

//   Maybe do more applying validation status to Text_Input too?
//   Maybe make a control that contains both the DMVM Control as well as a validation status indicator.

// Being able to get a validation status indicator there for a control with as little top level code as possible will help.

// Could definitely do with improved html / xhtml like control parsing and composition.
//  Done the basics of it, may need to improve it to cover more cases.
//  Can use this to cut down on composition code.

// compose, render, activate, modify

module.exports = controls;