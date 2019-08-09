const processLog = require('../services/processLog');
const System = require('../services/system');

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

        this.sys = new System('slave', this.index);
        this.sys.logger.info('  [S] Slave started');
        this.procLog = new processLog(this.index, 'slave');

    }

    /**
     * main action
     */
    action() {

        this.procLog.createRow();

        /**
         * Create
         */
        if (this.add && this.count > 0) {

            this.sys.logger.info('  [S] Action create started');
            this.createAction();

        /**
        * DELETE
        */
        } else if (this.delete && this.count > 0) {

            this.sys.logger.info('  [S] Action delete started');
            this.deleteRows();

        /**
         * UPDATE
         */
        } else if (this.update && this.count > 0) {

            this.sys.logger.info('  [S] Action update started');
            this.updateRows();

        }

    };

    /**
     * create rows
     */
    async createAction() {

        for (let i = 0; i < this.count; i++) {

            const row = new this.sys.RowModel({
                index: this.index,
                text: "xxx-" + i,
                time: new Date()
            });

            await this.sys.sleep();
            this.procLog.changePing();

            row.save( async (err) => {
                if (err) {
                    this.sys.logger.err('  [S] Mongo error...' + err.toString());
                } else {

                    this.sys.logger.info('  [S] Create row ' + i);
                    if( i >= this.count - 1) {
                        await this.procLog.deleteRow();
                        this.sys.mongoClose();
                    }
                }
            });
        }
    }

    /**
     * Delete rows
     */
    deleteRows() {

        let countSuccessOperations = +this.count;
        let deletionProcessMain = deletionProcess.bind(this);
        deletionProcessMain(+this.count);

        /**
        * for sleep in process
        */
        function returnPromise(post, closeFn, close) {
            return new Promise(async (resolve) => {

                const result = await returnResult.call(this, closeFn, close);

                function returnResult(closeFn, close) {
                    this.sys.RowModel.findOne({_id: post.id})
                        .deleteOne()
                        .exec( async (err, n) => {
                            this.sys.logger.info('  [S] Delete exec response from mongo: ' + JSON.stringify(n));

                            if(n.n > 0 && n.ok === 1 && n.deletedCount > 0) countSuccessOperations--;
                            if (close && countSuccessOperations === 0) {
                                await this.procLog.deleteRow();
                                closeFn.mongoClose();
                            }

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
            let result = this.sys.RowModel
                .find({})
                .limit(+count);

            this.sys.logger.info('  [S] Try delete ' + count + ' rows');
            new Promise((resolve, reject) => {
                result.exec((err, posts) => {
                    if (err) {
                        this.sys.logger.err('  [S] Delete error: ' + err.toString());
                        reject(err);
                    }
                    resolve(posts);
                });

            }).then(async (posts) => {

                if (posts.length === 0) {
                    await this.procLog.deleteRow();
                    await this.sys.sleep();
                    this.sys.mongoClose();
                    return;
                }

                for (let i = 0; i < posts.length; i++) {
                    await this.sys.sleep();
                    const close = (i < posts.length - 1) ? false : true;
                    await returnPromise.call(this, posts[i], this.sys, close);
                    this.procLog.changePing();
                };

                // if passed
                await this.sys.sleep();
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
                        this.sys.RowModel.updateOne({_id: post.id}, {text: "uuu-X", time: new Date()},)
                            .exec(async (err, n) => {
                                this.sys.logger.info('  [S] Update exec response from mongo: ' + JSON.stringify(n));
                                if(n.n > 0 && n.ok === 1 && n.nModified > 0) countSuccessOperations--;
                                if (close && countSuccessOperations === 0) {
                                    await this.procLog.deleteRow();
                                    closeFn.mongoClose();
                                }
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
            let result = this.sys.RowModel
                .find({})
                .limit(+count);
            this.sys.logger.info('  [S] Try update ' + count + ' rows');
            new Promise((resolve, reject) => {
                result.exec((err, posts) => {
                    if (err) {
                        this.sys.logger.err('  [S] Update error: ' + err.toString());
                        reject(err);
                    }
                    resolve(posts);
                });

            }).then(async (posts) => {

                if (posts.length === 0) {
                    this.procLog.deleteRow();
                    await this.sys.sleep();
                    this.sys.mongoClose();
                    return;
                }

                for (let i = 0; i < posts.length; i++) {
                    await this.sys.sleep();
                    const close = (i < posts.length - 1) ? false : true;
                    await returnPromise.call(this, posts[i], this.sys, close);
                    this.procLog.changePing();
                };

                // if passed
                await this.sys.sleep();
                if (countSuccessOperations > 0) {
                    updateProcessMain(countSuccessOperations);
                }

            });
        }
    }


}

module.exports = SlaveApp;