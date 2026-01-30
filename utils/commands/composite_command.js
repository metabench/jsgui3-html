const Command = require('./command');

class Composite_Command extends Command {
    constructor(description = 'Composite') {
        super(description);
        this.commands = [];
    }

    add(command) {
        this.commands.push(command);
    }

    execute() {
        this.commands.forEach(cmd => cmd.execute());
        return true;
    }

    undo() {
        [...this.commands].reverse().forEach(cmd => cmd.undo());
    }
}

module.exports = Composite_Command;
