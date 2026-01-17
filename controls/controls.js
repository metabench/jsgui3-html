/**
 * jsgui3-html Controls
 *
 * Main exports for all jsgui3-html controls.
 *
 * Stability Tiers:
 * - STABLE: Safe for production use
 * - EXPERIMENTAL: API may change
 * - DEPRECATED: Will be removed in v1.0.0
 */

'use strict';

// ============================================
// STABLE API - Safe for production use
// ============================================

const controls = {
    Active_HTML_Document: require('./organised/1-standard/5-ui/Active_HTML_Document'),
    Arrow_Button: require('./organised/0-core/1-advanced/vector/arrow-button'),
    //Audio_Player: require('./audio-player'),
    Audio_Volume: require('./organised/1-standard/5-ui/audio-volume'),
    Alert_Banner: require('./organised/1-standard/5-ui/alert_banner'),
    Accordion: require('./organised/1-standard/6-layout/accordion'),
    Badge: require('./organised/0-core/0-basic/1-compositional/badge'),
    Button: require('./organised/0-core/0-basic/0-native-compositional/button'),
    Canvas: require('./organised/0-core/1-advanced/Canvas'),
    Breadcrumbs: require('./organised/1-standard/5-ui/breadcrumbs'),
    Cell: require('./organised/0-core/0-basic/1-compositional/Cell'),
    // Maybe more advanced?
    Context_Menu: require('./organised/0-core/0-basic/1-compositional/context-menu'),
    //Control: 
    Color_Grid: require('./organised/0-core/0-basic/1-compositional/color-grid'),
    Color_Palette: require('./organised/0-core/0-basic/1-compositional/color-palette'),
    Checkbox: require('./organised/0-core/0-basic/0-native-compositional/checkbox'),
    Combo_Box: require('./organised/0-core/0-basic/1-compositional/combo-box'),
    Cluster: require('./organised/1-standard/6-layout/cluster'),
    Dropdown_Menu: require('./organised/0-core/0-basic/1-compositional/Dropdown_Menu'),
    Drawer: require('./organised/1-standard/6-layout/drawer'),
    // Not using (data-)connected controls.
    Data_Grid: require('./connected/data-grid'),
    File_Upload: require('./organised/0-core/0-basic/0-native-compositional/file-upload'),
    Form_Container: require('./organised/1-standard/1-editor/form_container'),
    Form_Field: require('./organised/1-standard/1-editor/form_field'),
    // maybe 0-basic/0-layout?
    //  A layout control may be / need to be displayed a little differently.
    Grid: require('./organised/0-core/0-basic/1-compositional/grid'),
    Grid_Gap: require('./organised/1-standard/6-layout/grid_gap'),
    Grid_Cell: require('./organised/0-core/0-basic/1-compositional/grid').Cell,
    Horizontal_Menu: require('./organised/1-standard/5-ui/horizontal-menu'),
    Horizontal_Slider: require('./organised/1-standard/5-ui/horizontal-slider'),
    //Data_Item: require('./data-item'),
    Data_Row: require('./organised/1-standard/4-data/data-row'),
    Data_Table: require('./organised/1-standard/4-data/data_table'),
    Date_Picker: require('./organised/0-core/0-basic/0-native-compositional/date-picker'),
    Dropdown_List: require('./organised/0-core/0-basic/0-native-compositional/dropdown-list'),
    Email_Input: require('./organised/0-core/0-basic/0-native-compositional/email_input'),
    // Exclude the connected ones for the moment. Moment passed.
    // May not need to actually be 'connected'?
    //  Or other controls may get data connections too.
    File_Tree: require('./organised/1-standard/5-ui/file-tree'),
    File_Tree_Node: require('./organised/1-standard/5-ui/file-tree-node'),
    Icon: require('./organised/0-core/0-basic/0-native-compositional/icon'),
    Inline_Validation_Message: require('./organised/1-standard/1-editor/inline_validation_message'),
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
    Meter: require('./organised/0-core/0-basic/0-native-compositional/meter'),
    Modal: require('./organised/1-standard/6-layout/modal'),
    Month_View: require('./organised/0-core/0-basic/1-compositional/month-view'),
    //Multi_Document_Interface: require('./multi-document-interface'),
    Master_Detail: require('./organised/1-standard/6-layout/master_detail'),
    Matrix: require('./matrix/Matrix'),
    Multi_Layout_Mode: require('./organised/1-standard/6-layout/app/multi-layout-mode'),
    //Object_Editor: require('./editor/object'),
    Number_Input: require('./organised/0-core/0-basic/0-native-compositional/number_input'),
    Number_Stepper: require('./organised/0-core/0-basic/1-compositional/number_stepper'),
    Object_Editor: require('./organised/1-standard/1-editor/object'),
    Panel: require('./organised/1-standard/6-layout/panel'),
    Pagination: require('./organised/1-standard/5-ui/pagination'),
    Plus_Minus_Toggle_Button: require('./organised/0-core/0-basic/1-compositional/plus-minus-toggle-button'),
    Property_Editor: require('./organised/1-standard/1-editor/property_editor'),
    Progress_Bar: require('./organised/0-core/0-basic/0-native-compositional/progress_bar'),
    // More advanced functionality - may require more work to keep it with the right APIs.
    Popup_Menu_Button: require('./organised/0-core/1-advanced/popup-menu-button'),
    Pop_Over: require('./organised/1-standard/5-ui/pop_over'),
    Radio_Button: require('./organised/0-core/0-basic/0-native-compositional/radio-button'),
    Radio_Button_Group: require('./organised/0-core/0-basic/1-compositional/radio-button-group'),
    //Resize_Handle: require('./organised/0-core/0-basic/_resize-handle'),
    Reorderable_List: require('./organised/1-standard/5-ui/reorderable_list'),
    Rich_Text_Editor: require('./organised/1-standard/1-editor/Rich_Text_Editor'),
    Rich_Text_Toolbar: require('./organised/1-standard/1-editor/rich_text_toolbar'),
    Scroll_View: require('./organised/0-core/0-basic/1-compositional/scroll-view'),
    Scrollbar: require('./organised/0-core/0-basic/1-compositional/scrollbar'),
    Search_Bar: require('./organised/1-standard/5-ui/search-bar'),
    Select_Options: require('./organised/0-core/0-basic/0-native-compositional/Select_Options'),
    Single_Line: require('./organised/1-standard/6-layout/single-line'),
    Split_Pane: require('./organised/1-standard/6-layout/split_pane'),
    Stack: require('./organised/1-standard/6-layout/stack'),
    Standard_Web_Page: require('./organised/1-standard/3-page/standard-web-page'),
    Start_Stop_Toggle_Button: require('./organised/1-standard/5-ui/start-stop-toggle-button'),
    String_Span: require('./organised/0-core/1-advanced/string-span'),
    Tag_Input: require('./organised/1-standard/1-editor/tag_input'),
    Tabbed_Panel: require('./organised/1-standard/6-layout/tabbed-panel'),
    Tel_Input: require('./organised/0-core/0-basic/0-native-compositional/tel_input'),
    Textarea: require('./organised/0-core/0-basic/0-native-compositional/textarea'),
    Text_Field: require('./organised/0-core/0-basic/1-compositional/Text_Field'),
    Text_Item: require('./organised/0-core/0-basic/1-compositional/text-item'),
    Text_Input: require('./organised/0-core/0-basic/0-native-compositional/Text_Input'),
    Tile_Slider: require('./organised/1-standard/6-layout/tile-slide'),
    Toast: require('./organised/1-standard/5-ui/toast'),
    Toggle_Switch: require('./organised/0-core/0-basic/1-compositional/toggle_switch'),
    Stepped_Slider: require('./organised/0-core/0-basic/1-compositional/stepped_slider'),
    // May be moved to vector?
    Timespan_Selector: require('./organised/0-core/0-basic/1-compositional/timespan-selector'),
    Title_Bar: require('./organised/1-standard/6-layout/title-bar'),
    Titled_Panel: require('./organised/1-standard/6-layout/titled-panel'),
    Toggle_Button: require('./organised/0-core/0-basic/1-compositional/toggle-button'),
    Toolbar: require('./organised/1-standard/5-ui/Toolbar'),
    Toolbox: require('./organised/1-standard/5-ui/toolbox'),
    Tooltip: require('./organised/1-standard/5-ui/tooltip'),
    Tree: require('./organised/1-standard/5-ui/tree'),
    Tree_Node: require('./organised/1-standard/5-ui/tree-node'),
    Tree_Table: require('./organised/1-standard/4-data/tree_table'),
    Url_Input: require('./organised/0-core/0-basic/0-native-compositional/url_input'),
    Vertical_Expander: require('./organised/1-standard/6-layout/vertical-expander'),
    Center: require('./organised/1-standard/6-layout/center'),
    Stepper: require('./organised/1-standard/6-layout/stepper'),
    Window: require('./organised/1-standard/6-layout/window'),//,
    //mx: require('../control_mixins/mx')
    Indicator: require('./organised/0-core/0-basic/1-compositional/Indicator'),
    Status_Indicator: require('./organised/0-core/0-basic/1-compositional/Status_Indicator'),
    Validation_Status_Indicator: require('./organised/0-core/0-basic/1-compositional/Validation_Status_Indicator'),
    Range_Input: require('./organised/0-core/0-basic/0-native-compositional/range_input'),
    Password_Input: require('./organised/0-core/0-basic/0-native-compositional/password_input'),
    Virtual_List: require('./organised/1-standard/4-data/virtual_list'),
    Virtual_Grid: require('./organised/1-standard/4-data/virtual_grid'),
    Error_Summary: require('../validation/error_summary')
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

// ============================================
// EXPERIMENTAL API - Subject to change
// ============================================

controls.experimental = {};

// ============================================
// DEPRECATED API - Will be removed in v1.0.0
// ============================================

// These are legacy aliases for backwards compatibility.
// They emit deprecation warnings when used.
// See docs/migrations/naming_normalization.md for migration guide.

controls.deprecated = {
    // Legacy camelCase names - use Camel_Case versions instead
    FormField: require('./organised/1-standard/1-editor/FormField'),
    PropertyEditor: require('./organised/1-standard/1-editor/PropertyEditor')
};

// Also export at top level for backwards compatibility
// (will emit deprecation warnings)
controls.FormField = controls.deprecated.FormField;
controls.PropertyEditor = controls.deprecated.PropertyEditor;

module.exports = controls;
