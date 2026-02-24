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
    Activity_Feed: require('./organised/1-standard/4-data/Activity_Feed'),
    Admin_Theme: require('./organised/1-standard/4-data/Admin_Theme'),
    Arrow_Button: require('./organised/0-core/1-advanced/vector/Arrow_Button'),
    //Audio_Player: require('./Audio_Player'),
    Audio_Volume: require('./organised/1-standard/5-ui/Audio_Volume'),
    Alert_Banner: require('./organised/1-standard/5-ui/Alert_Banner'),
    Accordion: require('./organised/1-standard/6-layout/Accordion'),
    Avatar: require('./organised/0-core/0-basic/1-compositional/Avatar'),
    Badge: require('./organised/0-core/0-basic/1-compositional/Badge'),
    Button: require('./organised/0-core/0-basic/0-native-compositional/Button'),
    Canvas: require('./organised/0-core/1-advanced/Canvas'),
    Breadcrumbs: require('./organised/1-standard/5-ui/Breadcrumbs'),
    Calendar: require('./organised/0-core/0-basic/1-compositional/Calendar'),
    Cell: require('./organised/0-core/0-basic/1-compositional/Cell'),
    // Maybe more advanced?
    Context_Menu: require('./organised/0-core/0-basic/1-compositional/Context_Menu'),
    //Control: 
    Chip: require('./organised/0-core/0-basic/1-compositional/Chip'),
    Color_Grid: require('./organised/0-core/0-basic/1-compositional/Color_Grid'),
    Color_Palette: require('./organised/0-core/0-basic/1-compositional/Color_Palette'),
    Color_Picker: require('./organised/0-core/0-basic/1-compositional/Color_Picker'),
    Color_Picker_Tabbed: require('./organised/0-core/0-basic/1-compositional/Color_Picker_Tabbed'),
    Checkbox: require('./organised/0-core/0-basic/0-native-compositional/Checkbox'),
    Combo_Box: require('./organised/0-core/0-basic/1-compositional/Combo_Box'),
    Console_Panel: require('./organised/1-standard/5-ui/Console_Panel'),
    Command_Palette: require('./organised/1-standard/5-ui/Command_Palette'),
    Code_Editor: require('./organised/1-standard/1-editor/Code_Editor'),
    Cluster: require('./organised/1-standard/6-layout/Cluster'),
    Dropdown_Menu: require('./organised/0-core/0-basic/1-compositional/Dropdown_Menu'),
    Drawer: require('./organised/1-standard/6-layout/Drawer'),
    // Not using (data-)connected controls.
    Data_Grid: require('./connected/Data_Grid'),
    Data_Filter: require('./organised/1-standard/4-data/Data_Filter'),
    Datetime_Picker: require('./organised/0-core/0-basic/1-compositional/Datetime_Picker'),
    File_Upload: require('./organised/0-core/0-basic/0-native-compositional/File_Upload'),
    Filter_Chips: require('./organised/1-standard/5-ui/Filter_Chips'),
    Form_Container: require('./organised/1-standard/1-editor/Form_Container'),
    Form_Designer: require('./organised/1-standard/1-editor/Form_Designer'),
    Form_Field: require('./organised/1-standard/1-editor/Form_Field'),
    // maybe 0-basic/0-layout?
    //  A layout control may be / need to be displayed a little differently.
    Grid: require('./organised/0-core/0-basic/1-compositional/Grid'),
    Group_Box: require('./organised/1-standard/6-layout/Group_Box'),
    Grid_Gap: require('./organised/1-standard/6-layout/Grid_Gap'),
    Grid_Cell: require('./organised/0-core/0-basic/1-compositional/Grid').Cell,
    Horizontal_Menu: require('./organised/1-standard/5-ui/Horizontal_Menu'),
    Horizontal_Slider: require('./organised/1-standard/5-ui/Horizontal_Slider'),
    //Data_Item: require('./Data_Item'),
    Data_Row: require('./organised/1-standard/4-data/Data_Row'),
    Data_Table: require('./organised/1-standard/4-data/Data_Table'),
    Date_Picker: require('./organised/0-core/0-basic/0-native-compositional/Date_Picker'),
    Dropdown_List: require('./organised/0-core/0-basic/0-native-compositional/Dropdown_List'),
    Email_Input: require('./organised/0-core/0-basic/0-native-compositional/Email_Input'),
    // Exclude the connected ones for the moment. Moment passed.
    // May not need to actually be 'connected'?
    //  Or other controls may get data connections too.
    File_Tree: require('./organised/1-standard/5-ui/File_Tree'),
    File_Tree_Node: require('./organised/1-standard/5-ui/File_Tree_Node'),
    Icon: require('./organised/0-core/0-basic/0-native-compositional/Icon'),
    Icon_Button: require('./organised/1-standard/5-ui/Icon_Button'),
    Inline_Validation_Message: require('./organised/1-standard/1-editor/Inline_Validation_Message'),
    Key_Value_Table: require('./organised/1-standard/4-data/Key_Value_Table'),
    Item: require('./organised/0-core/0-basic/1-compositional/Item'),
    Item_Selector: require('./organised/0-core/0-basic/1-compositional/Item_Selector'),
    //Item_View: require('./old/item-view'),
    Left_Right_Arrows_Selector: require('./organised/1-standard/2-misc/Left_Right_Arrows_Selector'),
    //Vector: require('./vector'),
    Line_Chart: require('./organised/1-standard/5-ui/Line_Chart'),
    Link_Button: require('./organised/1-standard/5-ui/Link_Button'),
    List: require('./organised/0-core/0-basic/1-compositional/List'),
    Log_Viewer: require('./organised/1-standard/4-data/Log_Viewer'),
    // could be in forms / standard forms.
    Login: require('./organised/0-core/1-advanced/Login'),
    //Media_Scrubber: require('./Media_Scrubber'),
    Menu_Node: require('./organised/0-core/0-basic/1-compositional/Menu_Node'),
    Message_Web_Page: require('./organised/1-standard/3-page/Message_Web_Page'),
    Meter: require('./organised/0-core/0-basic/0-native-compositional/Meter'),
    Modal: require('./organised/1-standard/6-layout/Modal'),
    Month_View: require('./organised/0-core/0-basic/1-compositional/Month_View'),
    //Multi_Document_Interface: require('./multi-document-interface'),
    Master_Detail: require('./organised/1-standard/6-layout/Master_Detail'),
    Matrix: require('./matrix/Matrix'),
    Multi_Layout_Mode: require('./organised/1-standard/6-layout/app/multi-layout-mode'),
    //Object_Editor: require('./editor/object'),
    Number_Input: require('./organised/0-core/0-basic/0-native-compositional/Number_Input'),
    Number_Stepper: require('./organised/0-core/0-basic/1-compositional/Number_Stepper'),
    Object_Editor: require('./organised/1-standard/1-editor/Object'),
    Panel: require('./organised/1-standard/6-layout/Panel'),
    Pagination: require('./organised/1-standard/5-ui/Pagination'),
    Plus_Minus_Toggle_Button: require('./organised/0-core/0-basic/1-compositional/Plus_Minus_Toggle_Button'),
    Property_Editor: require('./organised/1-standard/1-editor/Property_Editor'),
    Property_Grid: require('./organised/1-standard/1-editor/Property_Grid'),
    Property_Viewer: require('./organised/1-standard/0-viewer/Property_Viewer'),
    Progress_Bar: require('./organised/0-core/0-basic/0-native-compositional/Progress_Bar'),
    // More advanced functionality - may require more work to keep it with the right APIs.
    Popup_Menu_Button: require('./organised/0-core/1-advanced/Popup_Menu_Button'),
    Pop_Over: require('./organised/1-standard/5-ui/Pop_Over'),
    Radio_Button: require('./organised/0-core/0-basic/0-native-compositional/Radio_Button'),
    Radio_Button_Group: require('./organised/0-core/0-basic/1-compositional/Radio_Button_Group'),
    Radio_Button_Tab: require('./organised/1-standard/6-layout/Radio_Button_Tab'),
    Rating_Stars: require('./organised/0-core/0-basic/1-compositional/Rating_Stars'),
    //Resize_Handle: require('./organised/0-core/0-basic/_resize-handle'),
    Reorderable_List: require('./organised/1-standard/5-ui/Reorderable_List'),
    Resource_Viewer: require('./organised/1-standard/0-viewer/Resource_Viewer'),
    Rich_Text_Editor: require('./organised/1-standard/1-editor/Rich_Text_Editor'),
    Rich_Text_Toolbar: require('./organised/1-standard/1-editor/Rich_Text_Toolbar'),
    Scroll_View: require('./organised/0-core/0-basic/1-compositional/Scroll_View'),
    Scrollbar: require('./organised/0-core/0-basic/1-compositional/Scrollbar'),
    Search_Bar: require('./organised/1-standard/5-ui/Search_Bar'),
    Separator: require('./organised/0-core/0-basic/1-compositional/Separator'),
    Select_Options: require('./organised/0-core/0-basic/0-native-compositional/Select_Options'),
    Single_Line: require('./organised/1-standard/6-layout/Single_Line'),
    Skeleton_Loader: require('./organised/0-core/0-basic/1-compositional/Skeleton_Loader'),
    Spinner: require('./organised/0-core/0-basic/1-compositional/Spinner'),
    Split_Pane: require('./organised/1-standard/6-layout/Split_Pane'),
    Stat_Card: require('./organised/1-standard/4-data/Stat_Card'),
    Status_Dashboard: require('./organised/1-standard/4-data/Status_Dashboard'),
    Status_Bar: require('./organised/1-standard/5-ui/Status_Bar'),
    Stack: require('./organised/1-standard/6-layout/Stack'),
    Standard_Web_Page: require('./organised/1-standard/3-page/Standard_Web_Page'),
    Start_Stop_Toggle_Button: require('./organised/1-standard/5-ui/Start_Stop_Toggle_Button'),
    Split_Button: require('./organised/1-standard/5-ui/Split_Button'),
    String_Span: require('./organised/0-core/1-advanced/String_Span'),
    Tag_Input: require('./organised/1-standard/1-editor/Tag_Input'),
    Tabbed_Panel: require('./organised/1-standard/6-layout/Tabbed_Panel'),
    Tel_Input: require('./organised/0-core/0-basic/0-native-compositional/Tel_Input'),
    Textarea: require('./organised/0-core/0-basic/0-native-compositional/Textarea'),
    Text_Field: require('./organised/0-core/0-basic/1-compositional/Text_Field'),
    Text_Item: require('./organised/0-core/0-basic/1-compositional/Text_Item'),
    Text_Input: require('./organised/0-core/0-basic/0-native-compositional/Text_Input'),
    Time_Picker: require('./organised/0-core/0-basic/1-compositional/Time_Picker'),
    Tile_Slider: require('./organised/1-standard/6-layout/Tile_Slide'),
    Toast: require('./organised/1-standard/5-ui/Toast'),
    Toggle_Switch: require('./organised/0-core/0-basic/1-compositional/Toggle_Switch'),
    Stepped_Slider: require('./organised/0-core/0-basic/1-compositional/Stepped_Slider'),
    // May be moved to vector?
    Timespan_Selector: require('./organised/0-core/0-basic/1-compositional/Timespan_Selector'),
    Title_Bar: require('./organised/1-standard/6-layout/Title_Bar'),
    Titled_Panel: require('./organised/1-standard/6-layout/Titled_Panel'),
    Toggle_Button: require('./organised/0-core/0-basic/1-compositional/Toggle_Button'),
    Toolbar: require('./organised/1-standard/5-ui/Toolbar'),
    Toolbox: require('./organised/1-standard/5-ui/Toolbox'),
    Tooltip: require('./organised/1-standard/5-ui/Tooltip'),
    Tree: require('./organised/1-standard/5-ui/Tree'),
    Tree_Node: require('./organised/1-standard/5-ui/Tree_Node'),
    Tree_View: require('./organised/1-standard/4-data/Tree_View'),
    Tree_Table: require('./organised/1-standard/4-data/Tree_Table'),
    Up_Down_Arrow_Buttons: require('./organised/1-standard/2-misc/Up_Down_Arrow_Buttons'),
    Url_Input: require('./organised/0-core/0-basic/0-native-compositional/Url_Input'),
    Vertical_Expander: require('./organised/1-standard/6-layout/Vertical_Expander'),
    Center: require('./organised/1-standard/6-layout/Center'),
    Stepper: require('./organised/1-standard/6-layout/Stepper'),
    Window: require('./organised/1-standard/6-layout/Window'),
    Window_Manager: require('./organised/1-standard/6-layout/Window_Manager'),
    //mx: require('../control_mixins/mx')
    Indicator: require('./organised/0-core/0-basic/1-compositional/Indicator'),
    Status_Indicator: require('./organised/0-core/0-basic/1-compositional/Status_Indicator'),
    Validation_Status_Indicator: require('./organised/0-core/0-basic/1-compositional/Validation_Status_Indicator'),
    Range_Input: require('./organised/0-core/0-basic/0-native-compositional/Range_Input'),
    Password_Input: require('./organised/0-core/0-basic/0-native-compositional/Password_Input'),
    Virtual_List: require('./organised/1-standard/4-data/Virtual_List'),
    Virtual_Grid: require('./organised/1-standard/4-data/Virtual_Grid'),
    Error_Summary: require('../validation/error_summary'),

    // ── New controls (sprint batch) ──
    Sidebar_Nav: require('./organised/1-standard/6-layout/Sidebar_Nav'),
    Wizard: require('./organised/1-standard/5-ui/Wizard'),
    Inline_Cell_Edit: require('./organised/1-standard/4-data/Inline_Cell_Edit'),
    Markdown_Viewer: require('./organised/1-standard/0-viewer/Markdown_Viewer'),
    Bar_Chart: require('./organised/1-standard/4-data/Bar_Chart'),
    Pie_Chart: require('./organised/1-standard/4-data/Pie_Chart'),
    Sparkline: require('./organised/1-standard/4-data/Sparkline'),
    Area_Chart: require('./organised/1-standard/4-data/Area_Chart'),
    Gauge: require('./organised/1-standard/4-data/Gauge')
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
