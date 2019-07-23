const program = require('commander');
const MasterApp = require ('./controllers/master.js');
const SlaveApp = require ('./controllers/slave.js');

program
    .option('-i, --index [indexCount]', 'Node index')
    .option('-A, --add [addRowsCount]', 'add data')
    .option('-U, --update [updateRowsCount]', 'Update data')
    .option('-D, --delete [deleteRowsCount]', 'Delete data');

/**
 * SLAVE
 */
program
    .command('slave')
    .action(() => {
        let slave = new SlaveApp(program);
        slave.action();
    });

/**
 * MASTER
 */
program
    .command('master')
    .action(() => {
        let master = new MasterApp(program);
        master.action()
    });

program.parse(process.argv);
