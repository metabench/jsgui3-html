const Command = require('./command');

class Add_Command extends Command {
    constructor(container, control) {
        super('Add');
        this.container = container;
        this.control = control;
    }

    execute() {
        if (this.container && this.control) this.container.add(this.control);
        return true;
    }

    undo() {
        if (this.container && this.control) this.container.remove(this.control);
    }
}

module.exports = Add_Command;
