/**
 * Example: Data Transform Resource
 *
 * Demonstrates a minimal "resource" object that transforms structured data
 * into HTML. This keeps the example runnable while showing the shape of a
 * reusable transformation layer.
 */

const escape_html = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

class Data_Transform_Resource {
    constructor(spec = {}) {
        this.name = spec.name || 'data_transform_resource';
        this.description = spec.description || 'Transforms structured input into HTML output.';
        this.input_type = spec.input_type || 'object';
        this.output_type = spec.output_type || 'html';
        this.transform = typeof spec.transform === 'function'
            ? spec.transform
            : (() => '');
    }

    transform_data(input, options = {}) {
        return this.transform(input, options);
    }
}

const user_cards_resource = new Data_Transform_Resource({
    name: 'user_cards',
    description: 'Render an array of users into a card list.',
    input_type: 'Array<User>',
    output_type: 'HTML string',
    transform(users, options = {}) {
        const title = options.title || 'User Directory';
        const safe_title = escape_html(title);
        const items = Array.isArray(users) ? users : [];
        const cards_html = items.map((user) => {
            const safe_name = escape_html(user.name || 'Unnamed');
            const safe_role = escape_html(user.role || 'Unknown role');
            const safe_email = escape_html(user.email || 'unknown@example.com');
            return [
                '<article class="user-card">',
                `  <h2>${safe_name}</h2>`,
                `  <p class="user-role">${safe_role}</p>`,
                `  <a href="mailto:${safe_email}">${safe_email}</a>`,
                '</article>'
            ].join('\n');
        }).join('\n');

        return [
            '<section class="user-cards">',
            `  <header><h1>${safe_title}</h1></header>`,
            `  <div class="user-card-grid">${cards_html}</div>`,
            '</section>'
        ].join('\n');
    }
});

const create_sample_users = () => ([
    { name: 'Alice Johnson', role: 'Engineering Lead', email: 'alice@example.com' },
    { name: 'Bob Smith', role: 'Product Designer', email: 'bob@example.com' },
    { name: 'Carol White', role: 'Operations Manager', email: 'carol@example.com' }
]);

const run_example = () => {
    const users = create_sample_users();
    const html = user_cards_resource.transform_data(users, {
        title: 'Example Transform Output'
    });

    console.log('Resource name:', user_cards_resource.name);
    console.log('Description:', user_cards_resource.description);
    console.log('Input type:', user_cards_resource.input_type);
    console.log('Output type:', user_cards_resource.output_type);
    console.log('\nGenerated HTML:\n');
    console.log(html);

    return html;
};

if (require.main === module) {
    run_example();
}

module.exports = {
    Data_Transform_Resource,
    user_cards_resource,
    create_sample_users,
    run_example
};
