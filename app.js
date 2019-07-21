let program = require('commander');
let MasterApp = require ('./controllers/master.js');
let SlaveApp = require ('./controllers/slave.js');

program
    .option('-i, --index [indexCount]', 'Node index')
    .option('-A, --add [addRowsCount]', 'add data')
    .option('-U, --update [updateRowsCount]', 'Update data')
    .option('-D, --delete [deleteRowsCount]', 'Delete data');

program
    .command('slave')
    .action(() => {
        let slave = new SlaveApp(program);
        slave.action();
    });

program
    .command('master')
    .action(() => {
        let master = new MasterApp(program);
        master.action()
    });

program.parse(process.argv);
