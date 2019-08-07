const mongoose = require('mongoose');
const processRow = require('../models/processRow');
const CONFIG = require ('../config.js');
const Logger = require ('../services/logger');

class ProcessLog {

    constructor(index, type) {

        this.index = index;
        this.type = type;

        this.Schema = mongoose.Schema;
        this.processSchema = new this.Schema(processRow);
        this.logger = new Logger('slave', this.index);
    }

    createRow() {

        const processModel = mongoose.model('processModel', this.processSchema);

        const row = new processModel({
            index: this.index,
            startedAt: new Date(),
            type: this.type
        });

        row.save( (err, data) => {
            if (err) {
            } else {
                this.id = data._id;
                console.log(this.id);
            }
        });

    }

    deleteRow() {

        const processModel = mongoose.model('processModel', this.processSchema);

        processModel.findOne({_id: this.id})
            .deleteOne()
            .exec((err, n) => {
                console.log(n);
            });
    }

    /**
     * mongo connection init
     */
    mongoInit() {

        this.logger.info('  [S] MongoDB connection started');
        mongoose.connect(
            'mongodb://'+
            //CONFIG.mongoDbLogin + ':' +
            //CONFIG.mongoDbPassword + '@'+
            CONFIG.mongoDbHost + ':' +
            CONFIG.mongoDbPort + '/'+
            CONFIG.mongoDbBase, {useNewUrlParser: true}
        );

        mongoose.connection.on('connected', () => {
            this.logger.info('  [S] Connect to mongoDB succesfully');
        });
        mongoose.connection.on('error', () => {
            this.logger.err('  [S] Can\'t connect to mongo');
        });
        mongoose.connection.on('disconnected', () => {
            this.logger.info('  [S] Mongo dicsonnected');
        });
    };

    /**
     * mongo connection close
     */
    mongoClose() {
        mongoose.connection.close();
    };

}

module.exports = ProcessLog;