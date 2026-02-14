const jsgui = require('../../../../html-core/html-core');
const Form_Designer = require('../../../../controls/organised/1-standard/1-editor/form_designer');

const build_form_designer_fixture_html = () => {
    const context = new jsgui.Page_Context();

    const designer = new Form_Designer({
        context,
        fields: [
            { id: 'name', label: 'Name', type: 'text', required: true },
            { id: 'email', label: 'Email', type: 'email', required: true },
            { id: 'notes', label: 'Notes', type: 'textarea', required: false }
        ]
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Form Designer Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .actions { margin-top: 12px; display: flex; gap: 8px; }
    ${Form_Designer.css || ''}
  </style>
</head>
<body>
  <div id="designer-wrap">${designer.html}</div>
  <div class="actions">
    <button id="add" type="button">Add Field</button>
    <button id="remove-email" type="button">Remove Email</button>
    <button id="move-notes-up" type="button">Move Notes Up</button>
  </div>
  <script>
    const list = document.querySelector('#designer-wrap .form-designer-list');

    const render_row = (field, idx) => {
      const row = document.createElement('div');
      row.className = 'form-designer-row';
      row.setAttribute('data-field-id', field.id);
      row.innerHTML = [
        '<span class="form-designer-row-order">' + (idx + 1) + '</span>',
        '<span class="form-designer-row-name">' + field.label + '</span>',
        '<span class="form-designer-row-type">' + field.type + '</span>',
        '<span class="form-designer-row-required">' + (field.required ? 'required' : 'optional') + '</span>'
      ].join('');
      return row;
    };

    let fields = [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'notes', label: 'Notes', type: 'textarea', required: false }
    ];

    const rerender = () => {
      list.innerHTML = '';
      fields.forEach((field, idx) => list.appendChild(render_row(field, idx)));
    };

    document.getElementById('add').addEventListener('click', () => {
      fields.push({ id: 'priority', label: 'Priority', type: 'select', required: false });
      rerender();
    });

    document.getElementById('remove-email').addEventListener('click', () => {
      fields = fields.filter(field => field.id !== 'email');
      rerender();
    });

    document.getElementById('move-notes-up').addEventListener('click', () => {
      const index = fields.findIndex(field => field.id === 'notes');
      if (index > 0) {
        const tmp = fields[index - 1];
        fields[index - 1] = fields[index];
        fields[index] = tmp;
        rerender();
      }
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_form_designer_fixture_html
};
