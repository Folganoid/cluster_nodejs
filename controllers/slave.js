class SlaveApp {

    constructor(program) {

        this.index = program.index;
        this.add = program.add;
        this.delete = program.delete;
        this.update = program.update;

    }

    action() {
        console.log('slave', this.index);
    };
}

module.exports = SlaveApp;