const mongoose = require('mongoose');
const CONFIG = require ('../config.js');

class SlaveApp {

    constructor(program) {

        this.index = program.index;
        this.add = program.add;
        this.delete = program.delete;
        this.update = program.update;
    }

    action() {

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

        const Schema = mongoose.Schema;

        let rowSchema = new Schema({
            index: Number,
            text: String,
            time: Date,
        });

        var SomeModel = mongoose.model('SomeModel', rowSchema );

        let row = new SomeModel({
            index: 1,
            text: "xxx",
            time: new Date()
        });

        row.save(function (err) {
            if (err) {
                console.log(err);
            }

            mongoose.connection.close();

        });
    };
}

module.exports = SlaveApp;