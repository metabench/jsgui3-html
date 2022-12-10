class Icon_Library_View extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'icon_library_view';
        super(spec);
        const {context} = this;
        this.add_class('icon-library-view');

        // Add a field for the default icon library.
        field(this, 'library', spec.library || 'default');

        // Retrieve the selected library.
        const library = this.library;

        // Create the library name element.
        this.libraryName = new jsgui.p({
            context: context,
            class: 'library-name',
            text: library.name
        });

        // Add the library name element to the Icon_Library_View control.
        this.add(this.libraryName);

        // Create the icon list element.
        this.iconList = new jsgui.ul({
            context: context,
            class: 'icon-list'
        });

        // Populate the icon list with icons from the library.
        for (const [key, html] of Object.entries(library.iconMap)) {
            const icon = new jsgui.li({
                context: context,
                class: 'icon',
                html: html
            });
            this.iconList.add(icon);
        }

        // Add the icon list element to the Icon_Library_View control.
        this.add(this.iconList);
    }
}
