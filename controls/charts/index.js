/**
 * Chart Controls Index
 * 
 * Exports all chart types for convenient importing.
 */

const Chart_Base = require('./Chart_Base');
const Bar_Chart = require('./Bar_Chart');
const Pie_Chart = require('./Pie_Chart');
const Area_Chart = require('./Area_Chart');
const Scatter_Chart = require('./Scatter_Chart');
const Function_Graph = require('./Function_Graph');

module.exports = {
    Chart_Base,
    Bar_Chart,
    Pie_Chart,
    Area_Chart,
    Scatter_Chart,
    Function_Graph,

    // Aliases
    BarChart: Bar_Chart,
    PieChart: Pie_Chart,
    AreaChart: Area_Chart,
    ScatterChart: Scatter_Chart,
    FunctionGraph: Function_Graph
};
