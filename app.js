const program = require('commander');
const MasterApp = require ('./controllers/master.js');
const SlaveApp = require ('./controllers/slave.js');

program
    .option('-i, --index [index]', 'Node index')
    .option('-c, --count [count]', 'Node index')
    .option('-A, --add', 'Add data')
    .option('-U, --update', 'Update data')
    .option('-D, --delete', 'Delete data');

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
