const jsgui = require('../../../../html-core/html-core');
const Group_Box = require('../../../../controls/organised/1-standard/6-layout/group_box');

const build_group_box_fixture_html = () => {
    const context = new jsgui.Page_Context();
  const { Control } = jsgui;

    const gb_normal = new Group_Box({
        context,
        legend: 'Customer Details',
        as_fieldset: true
    });
    const normal_label = new Control({ context, tag_name: 'label' });
    normal_label.add('Name');
    const normal_input = new Control({ context, tag_name: 'input' });
    normal_input.dom.attributes.type = 'text';
    normal_input.dom.attributes.value = 'Ada';
    gb_normal.content_ctrl.add(normal_label);
    gb_normal.content_ctrl.add(normal_input);

    const gb_invalid = new Group_Box({
        context,
        legend: 'Billing',
        as_fieldset: false,
        invalid: true
    });
    const invalid_label = new Control({ context, tag_name: 'label' });
    invalid_label.add('Card');
    const invalid_input = new Control({ context, tag_name: 'input' });
    invalid_input.dom.attributes.type = 'text';
    invalid_input.dom.attributes.value = '';
    gb_invalid.content_ctrl.add(invalid_label);
    gb_invalid.content_ctrl.add(invalid_input);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Group Box Fixture</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .host { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    ${Group_Box.css || ''}
  </style>
</head>
<body>
  <div class="host">
    <div id="normal">${gb_normal.html}</div>
    <div id="invalid">${gb_invalid.html}</div>
  </div>

  <button id="toggle-invalid">Toggle invalid on Billing</button>
  <script>
    const target = document.querySelector('#invalid .jsgui-group-box');
    const button = document.getElementById('toggle-invalid');
    button.addEventListener('click', () => {
      target.classList.toggle('group-box-invalid');
      if (target.classList.contains('group-box-invalid')) {
        target.setAttribute('aria-invalid', 'true');
      } else {
        target.removeAttribute('aria-invalid');
      }
    });
  </script>
</body>
</html>`;
};

module.exports = {
    build_group_box_fixture_html
};
