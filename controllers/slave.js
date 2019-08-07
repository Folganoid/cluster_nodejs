const mongoose = require('mongoose');
const CONFIG = require ('../config.js');
const Logger = require ('../services/logger');
const clusterRow = require('../models/clusterRow');
const processLog = require('../services/processLog');

class SlaveApp {

    /**
     * Constructor
     * @param program
     */
    constructor(program) {

        this.index = (program.index) ? program.index : 0;
        this.add = program.add;
        this.delete = program.delete;
        this.update = program.update;
        this.count = program.count;

        this.Schema = mongoose.Schema;

        this.rowSchema = new this.Schema(clusterRow);

        this.logger = new Logger('slave', this.index);
        this.logger.info('  [S] Slave started');

    }

    /**
     * main action
     */
    async action() {

        let procLog = new processLog();
        procLog.createRow(this.index, 'slave');

        /**
         * Create
         */
        if (this.add && this.count > 0) {

            this.logger.info('  [S] Action create started');
            await this.createAction();

        /**
        * DELETE
        */
        } else if (this.delete && this.count > 0) {

            this.logger.info('  [S] Action delete started');
            await this.deleteRows();

        /**
         * UPDATE
         */
        } else if (this.update && this.count > 0) {

            this.logger.info('  [S] Action update started');
            await this.updateRows();

        }

        procLog.deleteRow();
    };

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

    /**
     * sync sleep
     * @returns {Promise<any>}
     */
    sleep() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * create rows
     */
    async createAction() {

        this.mongoInit();
        const RowModel = mongoose.model('RowModel', this.rowSchema);

        for (let i = 0; i < this.count; i++) {

            const row = new RowModel({
                index: this.index,
                text: "xxx-" + i,
                time: new Date()
            });

            await this.sleep();

            row.save( (err) => {
                if (err) {
                    this.logger.err('  [S] Mongo error...' + err.toString());
                } else {

                    this.logger.info('  [S] Create row ' + i);
                    if( i >= this.count - 1) this.mongoClose();
                }
            });
        }
    }

    /**
     * Delete rows
     */
    deleteRows() {

        let countSuccessOperations = +this.count;

        this.mongoInit();
        const RowModel = mongoose.model('RowModel', this.rowSchema);

        let deletionProcessMain = deletionProcess.bind(this);
        deletionProcessMain(+this.count);

        /**
        * for sleep in process
        */
        function returnPromise(post, closeFn, close) {
            return new Promise(async (resolve) => {

                const result = await returnResult.call(this, closeFn, close);

                function returnResult(closeFn, close) {
                    RowModel.findOne({_id: post.id})
                        .deleteOne()
                        .exec((err, n) => {
                            this.logger.info('  [S] Delete exec response from mongo: ' + JSON.stringify(n));

                            if(n.n > 0 && n.ok === 1 && n.deletedCount > 0) countSuccessOperations--;
                            if (close && countSuccessOperations === 0) closeFn.mongoClose();

                            return n;
                        });
                }

                return resolve(result);
            });
        }

        /**
         * delete process
         * @param count
         */
        function deletionProcess(count) {
            // action
            let result = RowModel
                .find({})
                .limit(+count);

            this.logger.info('  [S] Try delete ' + count + ' rows');
            new Promise((resolve, reject) => {
                result.exec((err, posts) => {
                    if (err) {
                        this.logger.err('  [S] Delete error: ' + err.toString());
                        reject(err);
                    }
                    resolve(posts);
                });

            }).then(async (posts) => {

                if (posts.length === 0) {
                    this.mongoClose();
                    return;
                }

                for (let i = 0; i < posts.length; i++) {
                    await this.sleep();
                    const close = (i < posts.length - 1) ? false : true;
                    await returnPromise.call(this, posts[i], this, close);
                };

                // if passed
                await this.sleep();
                if (countSuccessOperations > 0) {
                    deletionProcessMain(countSuccessOperations);
                }

            });
        }
    }

    /**
     * update rows
     */
    updateRows() {

        let countSuccessOperations = +this.count;

        this.mongoInit();
        const RowModel = mongoose.model('RowModel', this.rowSchema);

        let updateProcessMain = updateProcess.bind(this);
        updateProcessMain(+this.count);

        /**
         * for sleep() in promise
         *
         * @param post
         * @param closeFn
         * @param close
         * @returns {Promise<any>}
         */
        function returnPromise(post, closeFn, close) {
            return new Promise(async (resolve) => {

                const result = await returnResult.call(this, closeFn, close);


                    function returnResult(closeFn, close) {
                        RowModel.updateOne({_id: post.id}, {text: "uuu-X", time: new Date()},)
                            .exec((err, n) => {
                                this.logger.info('  [S] Update exec response from mongo: ' + JSON.stringify(n));
                                if(n.n > 0 && n.ok === 1 && n.nModified > 0) countSuccessOperations--;
                                if (close && countSuccessOperations === 0) closeFn.mongoClose();
                                return n;
                            });
                    }

                    return resolve(result);

            });
        }

        /**
         * update process
         * @param count
         */
        function updateProcess(count) {
            // action
            let result = RowModel
                .find({})
                .limit(+count);
            this.logger.info('  [S] Try update ' + count + ' rows');
            new Promise((resolve, reject) => {
                result.exec((err, posts) => {
                    if (err) {
                        this.logger.err('  [S] Update error: ' + err.toString());
                        reject(err);
                    }
                    resolve(posts);
                });

            }).then(async (posts) => {

                if (posts.length === 0) {
                    this.mongoClose();
                    return;
                }

                for (let i = 0; i < posts.length; i++) {
                    await this.sleep();
                    const close = (i < posts.length - 1) ? false : true;
                    await returnPromise.call(this, posts[i], this, close);
                };

                // if passed
                await this.sleep();
                if (countSuccessOperations > 0) {
                    updateProcessMain(countSuccessOperations);
                }

            });
        }
    }


}

module.exports = SlaveApp;