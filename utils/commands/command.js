class Command {
    constructor(description = '') {
        this.description = description;
        this.timestamp = Date.now();
    }

    execute() {
        return true;
    }

    undo() {}

    redo() {
        return this.execute();
    }

    merge(other_command) {
        return false;
    }
}

module.exports = Command;
