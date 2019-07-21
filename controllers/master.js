class MasterApp {

    constructor(program) {
        this.program = program;
    }

    action() {
        console.log('master', this.program.index);
    };
};

module.exports = MasterApp;