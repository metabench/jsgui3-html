/**
 * Example: Master-Detail View with Synchronized Navigation
 * 
 * This example demonstrates:
 * - Master-detail pattern
 * - Synchronized selection between views
 * - Nested data binding
 * - Conditional rendering
 * - Complex computed properties
 */

const jsgui = require('../html-core/html-core');
const { Data_Object } = require('lang-tools');
const Data_Model_View_Model_Control = require('../html-core/Data_Model_View_Model_Control');

class MasterDetailView extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Data model
        this.data.model = new Data_Object({
            items: spec.items || [],
            selectedItemId: null
        });
        
        // View model
        this.view.data.model = new Data_Object({
            searchText: '',
            viewMode: 'split', // 'split', 'master-only', 'detail-only'
            showEmptyState: true
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
            ['items', 'searchText'],
            (items, searchText) => {
                if (!searchText) return items;
                
                const search = searchText.toLowerCase();
                return items.filter(item => {
                    return item.title.toLowerCase().includes(search) ||
                           (item.description || '').toLowerCase().includes(search);
                });
            },
            {
                propertyName: 'filteredItems',
                target: this.view.data.model
            }
        );
        
        // Computed: selected item
        this.computed(
            [this.data.model, this.view.data.model],
            ['filteredItems', 'selectedItemId'],
            (items, selectedId) => {
                if (!selectedId || !items) return null;
                return items.find(item => item.id === selectedId) || null;
            },
            {
                propertyName: 'selectedItem',
                target: this.view.data.model
            }
        );
        
        // Computed: selected item index
        this.computed(
            [this.data.model, this.view.data.model],
            ['filteredItems', 'selectedItemId'],
            (items, selectedId) => {
                if (!selectedId || !items) return -1;
                return items.findIndex(item => item.id === selectedId);
            },
            {
                propertyName: 'selectedIndex',
                target: this.view.data.model
            }
        );
        
        // Computed: has previous item
        this.computed(
            this.view.data.model,
            ['selectedIndex'],
            (index) => index > 0,
            { propertyName: 'hasPrevious' }
        );
        
        // Computed: has next item
        this.computed(
            this.view.data.model,
            ['selectedIndex', 'filteredItems'],
            (index, items) => {
                return items && index >= 0 && index < items.length - 1;
            },
            { propertyName: 'hasNext' }
        );
        
        // Computed: navigation info
        this.computed(
            this.view.data.model,
            ['selectedIndex', 'filteredItems'],
            (index, items) => {
                if (index < 0 || !items || items.length === 0) {
                    return '';
                }
                return `${index + 1} of ${items.length}`;
            },
            { propertyName: 'navigationInfo' }
        );
    }
    
    setupWatchers() {
        // Update empty state when filtered items change
        this.watch(
            this.view.data.model,
            'filteredItems',
            (items) => {
                this.view.data.model.showEmptyState = !items || items.length === 0;
            }
        );
        
        // Clear selection if selected item is filtered out
        this.watch(
            this.view.data.model,
            'selectedItem',
            (item) => {
                if (!item && this.data.model.selectedItemId) {
                    this.data.model.selectedItemId = null;
                }
            }
        );
    }
    
    selectItem(itemId) {
        this.data.model.selectedItemId = itemId;
        
        // Change to detail view on mobile
        if (this.view.data.model.viewMode === 'split') {
            // Could add responsive logic here
        }
    }
    
    selectPrevious() {
        const items = this.view.data.model.filteredItems;
        const currentIndex = this.view.data.model.selectedIndex;
        
        if (currentIndex > 0) {
            this.data.model.selectedItemId = items[currentIndex - 1].id;
        }
    }
    
    selectNext() {
        const items = this.view.data.model.filteredItems;
        const currentIndex = this.view.data.model.selectedIndex;
        
        if (currentIndex >= 0 && currentIndex < items.length - 1) {
            this.data.model.selectedItemId = items[currentIndex + 1].id;
        }
    }
    
    compose() {
        this.add_class('master-detail-view');
        
        // Container for split view
        const container = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'split-container'
        });
        
        // Master pane
        const masterPane = this.createMasterPane();
        container.add(masterPane);
        
        // Detail pane
        const detailPane = this.createDetailPane();
        container.add(detailPane);
        
        this.add(container);
    }
    
    createMasterPane() {
        const pane = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'master-pane'
        });
        
        // Search box
        const searchBox = new jsgui.Control({
            context: this.context,
            tagName: 'input',
            attrs: {
                type: 'text',
                placeholder: 'Search items...'
            }
        });
        
        searchBox.on('input', (e) => {
            this.view.data.model.searchText = e.target.value;
        });
        
        pane.add(searchBox);
        
        // Items list
        this.itemsList = new jsgui.Control({
            context: this.context,
            tagName: 'ul',
            class: 'items-list'
        });
        
        this.renderMasterList();
        pane.add(this.itemsList);
        
        // Watch for changes
        this.watch(
            this.view.data.model,
            ['filteredItems', 'selectedItemId'],
            () => this.renderMasterList()
        );
        
        // Empty state
        const emptyState = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'empty-state',
            content: 'No items found'
        });
        
        this.watch(
            this.view.data.model,
            'showEmptyState',
            (show) => {
                if (show) {
                    emptyState.show();
                } else {
                    emptyState.hide();
                }
            },
            { immediate: true }
        );
        
        pane.add(emptyState);
        
        return pane;
    }
    
    renderMasterList() {
        this.itemsList.clear();
        
        const items = this.view.data.model.filteredItems || [];
        const selectedId = this.data.model.selectedItemId;
        
        items.forEach(item => {
            const li = new jsgui.Control({
                context: this.context,
                tagName: 'li',
                class: 'item'
            });
            
            if (item.id === selectedId) {
                li.add_class('selected');
            }
            
            // Title
            const title = new jsgui.Control({
                context: this.context,
                tagName: 'div',
                class: 'item-title',
                content: item.title
            });
            li.add(title);
            
            // Subtitle
            if (item.subtitle) {
                const subtitle = new jsgui.Control({
                    context: this.context,
                    tagName: 'div',
                    class: 'item-subtitle',
                    content: item.subtitle
                });
                li.add(subtitle);
            }
            
            li.on('click', () => this.selectItem(item.id));
            
            this.itemsList.add(li);
        });
    }
    
    createDetailPane() {
        const pane = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'detail-pane'
        });
        
        // Navigation bar
        const navbar = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'detail-navbar'
        });
        
        // Previous button
        const prevBtn = new jsgui.Control({
            context: this.context,
            tagName: 'button',
            content: '← Previous'
        });
        
        this.watch(
            this.view.data.model,
            'hasPrevious',
            (has) => {
                if (prevBtn.dom.el) {
                    prevBtn.dom.el.disabled = !has;
                }
            },
            { immediate: true }
        );
        
        prevBtn.on('click', () => this.selectPrevious());
        navbar.add(prevBtn);
        
        // Nav info
        const navInfo = new jsgui.Control({
            context: this.context,
            tagName: 'span',
            class: 'nav-info'
        });
        
        this.watch(
            this.view.data.model,
            'navigationInfo',
            (info) => {
                navInfo.clear();
                navInfo.add(info);
            },
            { immediate: true }
        );
        
        navbar.add(navInfo);
        
        // Next button
        const nextBtn = new jsgui.Control({
            context: this.context,
            tagName: 'button',
            content: 'Next →'
        });
        
        this.watch(
            this.view.data.model,
            'hasNext',
            (has) => {
                if (nextBtn.dom.el) {
                    nextBtn.dom.el.disabled = !has;
                }
            },
            { immediate: true }
        );
        
        nextBtn.on('click', () => this.selectNext());
        navbar.add(nextBtn);
        
        pane.add(navbar);
        
        // Detail content
        this.detailContent = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'detail-content'
        });
        
        this.renderDetail();
        pane.add(this.detailContent);
        
        // Watch for selection changes
        this.watch(
            this.view.data.model,
            'selectedItem',
            () => this.renderDetail()
        );
        
        return pane;
    }
    
    renderDetail() {
        this.detailContent.clear();
        
        const item = this.view.data.model.selectedItem;
        
        if (!item) {
            const placeholder = new jsgui.Control({
                context: this.context,
                tagName: 'div',
                class: 'detail-placeholder',
                content: 'Select an item to view details'
            });
            this.detailContent.add(placeholder);
            return;
        }
        
        // Title
        const title = new jsgui.Control({
            context: this.context,
            tagName: 'h2',
            content: item.title
        });
        this.detailContent.add(title);
        
        // Metadata
        if (item.metadata) {
            const meta = new jsgui.Control({
                context: this.context,
                tagName: 'div',
                class: 'metadata'
            });
            
            Object.entries(item.metadata).forEach(([key, value]) => {
                const metaItem = new jsgui.Control({
                    context: this.context,
                    tagName: 'div',
                    content: `${key}: ${value}`
                });
                meta.add(metaItem);
            });
            
            this.detailContent.add(meta);
        }
        
        // Description
        if (item.description) {
            const desc = new jsgui.Control({
                context: this.context,
                tagName: 'p',
                content: item.description
            });
            this.detailContent.add(desc);
        }
        
        // Content
        if (item.content) {
            const content = new jsgui.Control({
                context: this.context,
                tagName: 'div',
                class: 'item-content',
                content: item.content
            });
            this.detailContent.add(content);
        }
    }
}

// Usage example
function createExample() {
    const context = new jsgui.Page_Context();
    
    // Sample data
    const items = [
        {
            id: 1,
            title: 'Introduction to MVVM',
            subtitle: 'Design Patterns',
            description: 'Learn about the Model-View-ViewModel pattern',
            metadata: {
                author: 'John Doe',
                date: '2025-01-15',
                category: 'Architecture'
            },
            content: 'MVVM is a software architectural pattern that facilitates separation of development...'
        },
        {
            id: 2,
            title: 'Data Binding Best Practices',
            subtitle: 'Advanced Topics',
            description: 'Master the art of declarative data binding',
            metadata: {
                author: 'Jane Smith',
                date: '2025-02-20',
                category: 'Development'
            },
            content: 'Effective data binding can dramatically simplify your application code...'
        },
        {
            id: 3,
            title: 'Computed Properties',
            subtitle: 'Core Concepts',
            description: 'Understanding reactive computed values',
            metadata: {
                author: 'Bob Wilson',
                date: '2025-03-10',
                category: 'Basics'
            },
            content: 'Computed properties automatically update when their dependencies change...'
        },
        {
            id: 4,
            title: 'Performance Optimization',
            subtitle: 'Advanced Topics',
            description: 'Optimize your data binding performance',
            metadata: {
                author: 'Alice Brown',
                date: '2025-03-25',
                category: 'Performance'
            },
            content: 'Learn techniques to minimize unnecessary re-renders and computations...'
        }
    ];
    
    const view = new MasterDetailView({
        context,
        items
    });
    
    // Select first item by default
    setTimeout(() => {
        view.selectItem(1);
    }, 100);
    
    // Enable debugging
    const { BindingDebugTools } = require('../html-core/BindingDebugger');
    BindingDebugTools.inspect(view);
    
    return view;
}

if (require.main === module) {
    const view = createExample();
    console.log('\nRendered HTML:');
    console.log(view.html);
}

module.exports = MasterDetailView;
