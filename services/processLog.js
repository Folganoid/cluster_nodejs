const mongoose = require('mongoose');
const processRow = require('../models/processRow');
const Logger = require ('../services/logger');


class ProcessLog {

    constructor(index, type) {

        this.index = index;
        this.type = type;

        this.Schema = mongoose.Schema;
        this.processSchema = new this.Schema(processRow);
        this.logger = new Logger('slave', this.index);
    }

    /**
     * create process
     */
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
                this.logger.info("CREATE PROCESS...");
            }
        });

    }

    /**
     * delete process
     */
    deleteRow() {

        const processModel = mongoose.model('processModel', this.processSchema);

        console.log("DDDD", this.id);

        processModel.findOne({_id: this.id})
            .deleteOne()
            .exec((err, n) => {
                this.logger.info("DELETE PROCESS...");
            });
    }
}

module.exports = ProcessLog;