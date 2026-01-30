const Command = require('./command');

class Resize_Command extends Command {
    constructor(target, old_size, new_size) {
        super('Resize');
        this.target = target;
        this.old_size = old_size;
        this.new_size = new_size;
    }

    execute() {
        if (this.target) this.target.size = this.new_size;
        return true;
    }

    undo() {
        if (this.target) this.target.size = this.old_size;
    }
}

module.exports = Resize_Command;
