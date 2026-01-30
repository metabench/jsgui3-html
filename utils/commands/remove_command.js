const Command = require('./command');

class Remove_Command extends Command {
    constructor(container, control) {
        super('Remove');
        this.container = container;
        this.control = control;
    }

    execute() {
        if (this.container && this.control) this.container.remove(this.control);
        return true;
    }

    undo() {
        if (this.container && this.control) this.container.add(this.control);
    }
}

module.exports = Remove_Command;
