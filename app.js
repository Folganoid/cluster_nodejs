const program = require('commander');
const MasterApp = require ('./controllers/master.js');
const SlaveApp = require ('./controllers/slave.js');
const DirectorApp = require('./controllers/director');

program
    .option('-i, --index [index]', 'Node index')
    .option('-c, --count [count]', 'row count')
    .option('-d, --directorCount [directorCount]', 'director count')
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
        master.action();
    });

/**
 * DIRECTOR
 */
program
    .command('director')
    .action(() => {
        let director = new DirectorApp(program);
        director.action();
    });



program.parse(process.argv);
