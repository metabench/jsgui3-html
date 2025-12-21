const jsgui = require('../html-core/html-core');

const { is_defined } = jsgui;

const STATUS_TOKENS = ['error', 'warn', 'info', 'success'];

const get_status_class = (prefix, status) => (status ? `${prefix}-${status}` : '');

const apply_field_status = (ctrl, spec = {}) => {
    const prefix = spec.prefix || 'field-status';

    ctrl.field_status = '';

    ctrl.attach_field_aria = (input_ctrl, message_ctrl, status) => {
        if (!input_ctrl || !input_ctrl.dom || !input_ctrl.dom.attributes) return;
        if (message_ctrl && message_ctrl.dom && message_ctrl.dom.attributes) {
            if (!message_ctrl.dom.attributes.id) {
                message_ctrl.dom.attributes.id = message_ctrl.__id;
            }
            input_ctrl.dom.attributes['aria-describedby'] = message_ctrl.dom.attributes.id;
        }
        if (status === 'error') {
            input_ctrl.dom.attributes['aria-invalid'] = 'true';
        } else {
            input_ctrl.dom.attributes['aria-invalid'] = 'false';
        }
    };

    ctrl.set_field_status = (status, detail = {}) => {
        if (ctrl.field_status) {
            ctrl.remove_class(get_status_class(prefix, ctrl.field_status));
        }
        const next_status = is_defined(status) ? String(status) : '';
        ctrl.field_status = next_status;
        if (next_status) {
            ctrl.add_class(get_status_class(prefix, next_status));
        }

        if (detail.message_ctrl) {
            if (detail.message_ctrl.set_status) {
                detail.message_ctrl.set_status(next_status);
            }
            if (is_defined(detail.message) && detail.message_ctrl.set_message) {
                detail.message_ctrl.set_message(detail.message);
            }
        }
        if (detail.badge_ctrl) {
            if (detail.badge_ctrl.set_status) {
                detail.badge_ctrl.set_status(next_status);
            }
            if (is_defined(detail.badge_text) && detail.badge_ctrl.set_text) {
                detail.badge_ctrl.set_text(detail.badge_text);
            }
        }
        if (detail.input_ctrl) {
            ctrl.attach_field_aria(detail.input_ctrl, detail.message_ctrl, next_status);
        }
    };

    ctrl.clear_field_status = detail => {
        ctrl.set_field_status('', detail || {});
    };

    return ctrl;
};

module.exports = {
    STATUS_TOKENS,
    apply_field_status,
    get_status_class
};
