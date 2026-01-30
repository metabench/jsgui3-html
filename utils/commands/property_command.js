const Command = require('./command');

class Property_Command extends Command {
    constructor(target, name, old_value, new_value) {
        super(`Set ${name}`);
        this.target = target;
        this.name = name;
        this.old_value = old_value;
        this.new_value = new_value;
    }

    execute() {
        if (this.target) this.target[this.name] = this.new_value;
        return true;
    }

    undo() {
        if (this.target) this.target[this.name] = this.old_value;
    }
}

module.exports = Property_Command;
