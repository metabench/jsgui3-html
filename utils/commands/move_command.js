const Command = require('./command');

class Move_Command extends Command {
    constructor(target, old_pos, new_pos) {
        super('Move');
        this.target = target;
        this.old_pos = old_pos;
        this.new_pos = new_pos;
    }

    execute() {
        if (this.target) this.target.pos = this.new_pos;
        return true;
    }

    undo() {
        if (this.target) this.target.pos = this.old_pos;
    }
}

module.exports = Move_Command;
