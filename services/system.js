const mongoose = require('mongoose');
const CONFIG = require ('../config.js');
const Logger = require ('../services/logger');
const clusterRow = require('../models/clusterRow');

class System {

    constructor(controller, index) {

        this.mongoDB = mongoose;
        this.logger = new Logger(controller, index);

        this.mongoInit();

        this.Schema = this.mongoDB.Schema;
        this.rowSchema = new this.Schema(clusterRow);
        this.RowModel = this.mongoDB.model('RowModel', this.rowSchema);
    }


    /**
     * sync sleep
     * @returns {Promise<any>}
     */
    sleep() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * mongo connection init
     */
    mongoInit() {



        this.logger.info('  [S] MongoDB connection started');
        this.mongoDB.connect(
            'mongodb://'+
            //CONFIG.mongoDbLogin + ':' +
            //CONFIG.mongoDbPassword + '@'+
            CONFIG.mongoDbHost + ':' +
            CONFIG.mongoDbPort + '/'+
            CONFIG.mongoDbBase, {useNewUrlParser: true}
        );

        this.mongoDB.connection.on('connected', () => {
            this.logger.info('  [S] Connect to mongoDB succesfully');
        });
        this.mongoDB.connection.on('error', () => {
            this.logger.err('  [S] Can\'t connect to mongo');
        });
        this.mongoDB.connection.on('disconnected', () => {
            this.logger.info('  [S] Mongo dicsonnected');
        });
    };

    /**
     * mongo connection close
     */
    mongoClose() {
        this.mongoDB.connection.close();
    };



}

module.exports = System;