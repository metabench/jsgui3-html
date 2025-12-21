const is_defined = value => value !== undefined && value !== null;

const is_plain_object = value => {
    if (!value || typeof value !== 'object') return false;
    if (Array.isArray(value)) return false;
    return true;
};

const normalize_item = (raw_item, index, options = {}) => {
    const id_prefix = options.id_prefix || 'item';
    const value_key = options.value_key || 'value';
    const label_key = options.label_key || 'label';

    let value = raw_item;
    let label = raw_item;
    let disabled = false;
    let id = undefined;

    if (Array.isArray(raw_item)) {
        value = raw_item[0];
        label = raw_item.length > 1 ? raw_item[1] : raw_item[0];
    } else if (is_plain_object(raw_item)) {
        if (is_defined(raw_item[value_key])) value = raw_item[value_key];
        if (is_defined(raw_item[label_key])) label = raw_item[label_key];
        if (is_defined(raw_item.text) && !is_defined(label)) label = raw_item.text;
        if (is_defined(raw_item.value) && !is_defined(value)) value = raw_item.value;
        if (is_defined(raw_item.label) && !is_defined(label)) label = raw_item.label;
        if (is_defined(raw_item.id)) id = raw_item.id;
        if (is_defined(raw_item.dom_id) && !is_defined(id)) id = raw_item.dom_id;
        disabled = !!raw_item.disabled;
    }

    if (!is_defined(label)) label = value;

    const normalized_id = is_defined(id) ? String(id) : `${id_prefix}-${index}`;
    return {
        id: normalized_id,
        value: value,
        label: is_defined(label) ? String(label) : '',
        disabled: !!disabled,
        original: raw_item,
        index: index
    };
};

const normalize_items = (raw_items, options = {}) => {
    if (!Array.isArray(raw_items)) return [];
    return raw_items.map((raw_item, index) => normalize_item(raw_item, index, options));
};

const find_item_by_value = (items, value) => {
    if (!Array.isArray(items)) return undefined;
    return items.find(item => item.value === value || String(item.value) === String(value));
};

const filter_items = (items, filter_text) => {
    if (!Array.isArray(items)) return [];
    if (!is_defined(filter_text) || filter_text === '') return items.slice();
    const needle = String(filter_text).toLowerCase();
    return items.filter(item => {
        const label = String(item.label || '').toLowerCase();
        const value = String(item.value || '').toLowerCase();
        return label.includes(needle) || value.includes(needle);
    });
};

module.exports = {
    normalize_item,
    normalize_items,
    find_item_by_value,
    filter_items
};
