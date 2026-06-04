/**
 * Example: Data Grid with Sorting and Filtering
 * 
 * This example demonstrates:
 * - Collection binding
 * - Computed filtering and sorting
 * - Array transformations
 * - Complex property dependencies
 * - Performance patterns
 */

const jsgui = require('../html-core/html-core');
const { Data_Object } = require('lang-tools');
const Data_Model_View_Model_Control = require('../html-core/Data_Model_View_Model_Control');

class DataGrid extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        super(spec);
        
        // Data model - raw data
        this.data.model = new Data_Object({
            rows: spec.items || spec.rows || [],
            columns: spec.columns || []
        });
        
        // View model - UI state
        this.view.data.model = new Data_Object({
            sortColumn: null,
            sortDirection: 'asc',
            filterText: '',
            pageSize: spec.pageSize || 10,
            currentPage: 0,
            selectedRows: []
        });
        
        this.setupComputed();
        this.setupWatchers();
        
        if (!spec.el) {
            this.compose();
        }
    }
    
    setupComputed() {
        // Computed: filtered items
        this.computed(
            [this.data.model, this.view.data.model],
            ['rows', 'filterText'],
            (rows, filterText) => {
                if (!filterText) return rows;
                
                const searchLower = filterText.toLowerCase();
                return rows.filter(item => {
                    return Object.values(item).some(value => {
                        return String(value).toLowerCase().includes(searchLower);
                    });
                });
            },
            { 
                propertyName: 'filteredItems',
                target: this.view.data.model
            }
        );
        
        // Computed: sorted items
        this.computed(
            this.view.data.model,
            ['filteredItems', 'sortColumn', 'sortDirection'],
            (items, column, direction) => {
                if (!column || !items) return items;
                
                const sorted = [...items].sort((a, b) => {
                    const aVal = a[column];
                    const bVal = b[column];
                    
                    if (aVal === bVal) return 0;
                    if (aVal == null) return 1;
                    if (bVal == null) return -1;
                    
                    const comparison = aVal > bVal ? 1 : -1;
                    return direction === 'asc' ? comparison : -comparison;
                });
                
                return sorted;
            },
            {
                propertyName: 'sortedItems',
                target: this.view.data.model
            }
        );
        
        // Computed: total pages
        this.computed(
            this.view.data.model,
            ['sortedItems', 'pageSize'],
            (items, pageSize) => {
                if (!items) return 0;
                return Math.ceil(items.length / pageSize);
            },
            {
                propertyName: 'totalPages',
                target: this.view.data.model
            }
        );
        
        // Computed: visible items (paginated)
        this.computed(
            this.view.data.model,
            ['sortedItems', 'currentPage', 'pageSize'],
            (items, page, pageSize) => {
                if (!items) return [];
                const start = page * pageSize;
                return items.slice(start, start + pageSize);
            },
            {
                propertyName: 'visibleItems',
                target: this.view.data.model
            }
        );
        
        // Computed: result info
        this.computed(
            this.view.data.model,
            ['filteredItems', 'visibleItems', 'currentPage', 'pageSize'],
            (filtered, visible, page, pageSize) => {
                if (!filtered || filtered.length === 0) {
                    return 'No results';
                }
                
                const start = page * pageSize + 1;
                const end = Math.min(start + visible.length - 1, filtered.length);
                return `Showing ${start}-${end} of ${filtered.length} results`;
            },
            {
                propertyName: 'resultInfo',
                target: this.view.data.model
            }
        );
    }
    
    setupWatchers() {
        // Reset to first page when filter changes
        this.watch(
            this.view.data.model,
            'filterText',
            () => {
                this.view.data.model.set('currentPage', 0);
            }
        );
        
        // Reset to first page when sort changes
        this.watch(
            this.view.data.model,
            ['sortColumn', 'sortDirection'],
            () => {
                this.view.data.model.set('currentPage', 0);
            }
        );
    }
    
    toggleSort(column) {
        const current_sort_column = this.view.data.model.sortColumn;
        const current_sort_direction = this.view.data.model.sortDirection;

        if (current_sort_column === column) {
            // Toggle direction
            this.view.data.model.set(
                'sortDirection',
                current_sort_direction === 'asc' ? 'desc' : 'asc'
            );
        } else {
            // New column
            this.view.data.model.set('sortColumn', column);
            this.view.data.model.set('sortDirection', 'asc');
        }
    }
    
    goToPage(page) {
        const totalPages = this.view.data.model.totalPages;
        if (page >= 0 && page < totalPages) {
            this.view.data.model.set('currentPage', page);
        }
    }
    
    toggleRowSelection(rowIndex) {
        const selected = Array.isArray(this.view.data.model.selectedRows)
            ? this.view.data.model.selectedRows.slice()
            : [];
        const index = selected.indexOf(rowIndex);
        
        if (index >= 0) {
            selected.splice(index, 1);
        } else {
            selected.push(rowIndex);
        }
        
        this.view.data.model.set('selectedRows', selected);
    }
    
    compose() {
        this.add_class('data-grid');
        
        // Filter input
        const filterContainer = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'grid-filter'
        });
        
        const filterInput = new jsgui.Control({
            context: this.context,
            tagName: 'input',
            attrs: {
                type: 'text',
                placeholder: 'Filter results...'
            }
        });
        
        filterInput.on('input', (e) => {
            this.view.data.model.set('filterText', e.target.value);
        });
        
        filterContainer.add(filterInput);
        this.add(filterContainer);
        
        // Results info
        const resultsInfo = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'results-info'
        });
        
        this.watch(
            this.view.data.model,
            'resultInfo',
            (info) => {
                resultsInfo.clear();
                resultsInfo.add(info);
            },
            { immediate: true }
        );
        
        this.add(resultsInfo);
        
        // Table
        this.tableContainer = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'table-container'
        });
        
        this.renderTable();
        this.add(this.tableContainer);
        
        // Watch for data changes and re-render
        this.watch(
            this.view.data.model,
            'visibleItems',
            () => this.renderTable()
        );
        
        // Pagination
        this.paginationContainer = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'pagination'
        });
        
        this.renderPagination();
        this.add(this.paginationContainer);
        
        this.watch(
            this.view.data.model,
            ['currentPage', 'totalPages'],
            () => this.renderPagination()
        );
    }
    
    renderTable() {
        this.tableContainer.clear();
        
        const table = new jsgui.Control({
            context: this.context,
            tagName: 'table'
        });
        
        // Header
        const thead = new jsgui.Control({
            context: this.context,
            tagName: 'thead'
        });
        
        const headerRow = new jsgui.Control({
            context: this.context,
            tagName: 'tr'
        });
        
        const columns = Array.isArray(this.data.model.columns) ? this.data.model.columns : [];
        columns.forEach(col => {
            const th = new jsgui.Control({
                context: this.context,
                tagName: 'th'
            });
            
            const isSorted = this.view.data.model.sortColumn === col.field;
            const direction = this.view.data.model.sortDirection;
            
            th.add(col.label);
            
            if (isSorted) {
                th.add(direction === 'asc' ? ' ▲' : ' ▼');
                th.add_class('sorted');
            }
            
            th.on('click', () => this.toggleSort(col.field));
            th.add_class('sortable');
            
            headerRow.add(th);
        });
        
        thead.add(headerRow);
        table.add(thead);
        
        // Body
        const tbody = new jsgui.Control({
            context: this.context,
            tagName: 'tbody'
        });
        
        const items = Array.isArray(this.view.data.model.visibleItems) ? this.view.data.model.visibleItems : [];
        const currentPage = this.view.data.model.currentPage;
        const pageSize = this.view.data.model.pageSize;
        const selectedRows = Array.isArray(this.view.data.model.selectedRows) ? this.view.data.model.selectedRows : [];
        
        items.forEach((item, idx) => {
            const row = new jsgui.Control({
                context: this.context,
                tagName: 'tr'
            });
            
            const globalIndex = currentPage * pageSize + idx;
            const isSelected = selectedRows.includes(globalIndex);
            
            if (isSelected) {
                row.add_class('selected');
            }
            
            row.on('click', () => this.toggleRowSelection(globalIndex));
            
            columns.forEach(col => {
                const td = new jsgui.Control({
                    context: this.context,
                    tagName: 'td'
                });
                
                let value = item[col.field];
                
                // Apply formatter if provided
                if (col.formatter) {
                    value = col.formatter(value, item);
                }
                
                td.add(String(value != null ? value : ''));
                row.add(td);
            });
            
            tbody.add(row);
        });
        
        table.add(tbody);
        this.tableContainer.add(table);
    }
    
    renderPagination() {
        this.paginationContainer.clear();
        
        const currentPage = this.view.data.model.currentPage;
        const totalPages = this.view.data.model.totalPages;
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevBtn = new jsgui.Control({
            context: this.context,
            tagName: 'button',
            content: '← Previous'
        });
        
        if (currentPage === 0) {
            prevBtn.dom.attributes.disabled = 'disabled';
            prevBtn.dom.el && (prevBtn.dom.el.disabled = true);
        }
        
        prevBtn.on('click', () => this.goToPage(currentPage - 1));
        this.paginationContainer.add(prevBtn);
        
        // Page info
        const pageInfo = new jsgui.Control({
            context: this.context,
            tagName: 'span',
            content: `Page ${currentPage + 1} of ${totalPages}`
        });
        this.paginationContainer.add(pageInfo);
        
        // Next button
        const nextBtn = new jsgui.Control({
            context: this.context,
            tagName: 'button',
            content: 'Next →'
        });
        
        if (currentPage >= totalPages - 1) {
            nextBtn.dom.attributes.disabled = 'disabled';
            nextBtn.dom.el && (nextBtn.dom.el.disabled = true);
        }
        
        nextBtn.on('click', () => this.goToPage(currentPage + 1));
        this.paginationContainer.add(nextBtn);
    }
}

// Usage example
function createExample() {
    const context = new jsgui.Page_Context();
    
    // Sample data
    const items = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28, department: 'Engineering' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 35, department: 'Sales' },
        { id: 3, name: 'Carol White', email: 'carol@example.com', age: 42, department: 'Marketing' },
        { id: 4, name: 'David Brown', email: 'david@example.com', age: 31, department: 'Engineering' },
        { id: 5, name: 'Eve Davis', email: 'eve@example.com', age: 29, department: 'HR' },
        { id: 6, name: 'Frank Wilson', email: 'frank@example.com', age: 38, department: 'Sales' },
        { id: 7, name: 'Grace Lee', email: 'grace@example.com', age: 33, department: 'Engineering' },
        { id: 8, name: 'Henry Clark', email: 'henry@example.com', age: 45, department: 'Management' },
        { id: 9, name: 'Ivy Martinez', email: 'ivy@example.com', age: 27, department: 'Marketing' },
        { id: 10, name: 'Jack Taylor', email: 'jack@example.com', age: 36, department: 'Engineering' }
    ];
    
    const columns = [
        { field: 'id', label: 'ID' },
        { field: 'name', label: 'Name' },
        { field: 'email', label: 'Email' },
        { 
            field: 'age', 
            label: 'Age',
            formatter: (val) => val ? `${val} years` : '-'
        },
        { field: 'department', label: 'Department' }
    ];
    
    const grid = new DataGrid({
        context,
        items,
        columns,
        pageSize: 5
    });
    
    // Test sorting
    console.log('\nSorting by name...');
    grid.toggleSort('name');
    
    // Test filtering
    setTimeout(() => {
        console.log('\nFiltering for "Engineering"...');
        grid.view.data.model.set('filterText', 'Engineering');
    }, 100);
    
    // Enable debugging
    const { BindingDebugTools } = require('../html-core/BindingDebugger');
    BindingDebugTools.inspect(grid);
    
    return grid;
}

if (require.main === module) {
    const grid = createExample();
    console.log('\nRendered HTML:');
    console.log(grid.html);
}

module.exports = DataGrid;
