const jsgui = require('../html-core/html-core');
const Evented_Class = jsgui.Evented_Class || require('lang-tools').Evented_Class;

class Undo_Redo_Manager extends Evented_Class {
    constructor(spec = {}) {
        super();
        this.max_stack_size = spec.max_stack_size || 100;
        this.merge_timeout = spec.merge_timeout || 500;
        this.persist_key = spec.persist_key || null;

        this.undo_stack = [];
        this.redo_stack = [];
        this._current_transaction = null;
    }

    execute(command) {
        if (!command) return false;
        if (this._current_transaction) {
            this._current_transaction.add(command);
            command.execute();
            return true;
        }

        const last = this.undo_stack[this.undo_stack.length - 1];
        if (last && typeof last.merge === 'function') {
            const merged = last.merge(command);
            if (merged) {
                this.raise('execute', { command: last });
                this.raise('change', { can_undo: this.can_undo(), can_redo: this.can_redo() });
                return true;
            }
        }

        const ok = command.execute();
        if (ok !== false) {
            this.undo_stack.push(command);
            if (this.undo_stack.length > this.max_stack_size) {
                this.undo_stack.shift();
            }
            this.redo_stack = [];
            this.raise('execute', { command });
            this.raise('change', { can_undo: this.can_undo(), can_redo: this.can_redo() });
        }
        return true;
    }

    undo() {
        const command = this.undo_stack.pop();
        if (!command) return;
        command.undo();
        this.redo_stack.push(command);
        this.raise('undo', { command });
        this.raise('change', { can_undo: this.can_undo(), can_redo: this.can_redo() });
    }

    redo() {
        const command = this.redo_stack.pop();
        if (!command) return;
        command.redo();
        this.undo_stack.push(command);
        this.raise('redo', { command });
        this.raise('change', { can_undo: this.can_undo(), can_redo: this.can_redo() });
    }

    can_undo() {
        return this.undo_stack.length > 0;
    }

    can_redo() {
        return this.redo_stack.length > 0;
    }

    clear() {
        this.undo_stack = [];
        this.redo_stack = [];
        this.raise('clear', {});
        this.raise('change', { can_undo: false, can_redo: false });
    }

    begin_transaction(name = 'Transaction') {
        if (this._current_transaction) return;
        const Composite_Command = require('./commands/composite_command');
        this._current_transaction = new Composite_Command(name);
    }

    end_transaction() {
        if (!this._current_transaction) return;
        const txn = this._current_transaction;
        this._current_transaction = null;
        if (txn.commands.length) {
            this.execute(txn);
        }
    }

    abort_transaction() {
        if (!this._current_transaction) return;
        const txn = this._current_transaction;
        this._current_transaction = null;
        txn.undo();
    }

    get_undo_description() {
        const cmd = this.undo_stack[this.undo_stack.length - 1];
        return cmd ? cmd.description : '';
    }

    get_redo_description() {
        const cmd = this.redo_stack[this.redo_stack.length - 1];
        return cmd ? cmd.description : '';
    }

    get_undo_stack() {
        return this.undo_stack.slice();
    }

    get_redo_stack() {
        return this.redo_stack.slice();
    }

    save() {
        if (!this.persist_key || typeof localStorage === 'undefined') return;
        const payload = {
            undo: this.undo_stack.map(cmd => cmd.description),
            redo: this.redo_stack.map(cmd => cmd.description)
        };
        localStorage.setItem(this.persist_key, JSON.stringify(payload));
    }

    restore() {
        if (!this.persist_key || typeof localStorage === 'undefined') return;
        const raw = localStorage.getItem(this.persist_key);
        if (raw) {
            this._persisted = JSON.parse(raw);
        }
    }
}

module.exports = Undo_Redo_Manager;
