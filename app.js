const program = require('commander');
const MasterApp = require ('./controllers/master.js');
const SlaveApp = require ('./controllers/slave.js');
const CONFIG = require ('./config.js');
let mongoose = require('mongoose');

mongoose.connect(
    'mongodb://'+
    CONFIG.mongoDbLogin + ':' +
    CONFIG.mongoDbPassword + '@'+
    CONFIG.mongoDbHost + ':' +
    CONFIG.mongoDbPort + '/'+
    CONFIG.mongoDbBase, {useNewUrlParser: true}
);

mongoose.connection.on('connected', function(){
    console.log('Connect to Mongo successfully...');
});
mongoose.connection.on('error', function(){
    console.log('Can\'t connect to mongo...');
});
mongoose.connection.on('disconnected', function(){
    console.log('Mongo dicsonnected...');
});
mongoose.connection.close();

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
        console.log(CONFIG.mongoDbHost);
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
