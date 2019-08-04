const mongoose = require('mongoose');
const CONFIG = require ('../config.js');

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

        this.rowSchema = new this.Schema({
            index: Number,
            text: String,
            time: Date,
        });
    }

    /**
     * main action
     */
    action() {

        /**
         * Create
         */
        if (this.add && this.count > 0) {

            this.createAction();

        /**
        * DELETE
        */
        } else if (this.delete && this.count > 0) {

            this.deleteRows();

        /**
         * UPDATE
         */
        } else if (this.update && this.count > 0) {

            this.updateRows();

        }
    };

    /**
     * mongo connection init
     */
    mongoInit() {
        mongoose.connect(
            'mongodb://'+
            //CONFIG.mongoDbLogin + ':' +
            //CONFIG.mongoDbPassword + '@'+
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
                    console.log('Mongo error...')
                } else {

                    console.log('+++', i);
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

        // for sleep() in promise
        function returnPromise(post, closeFn, close) {
            return new Promise(async (resolve) => {

                const result = await returnResult(closeFn, close);

                function returnResult(closeFn, close) {
                    RowModel.findOne({_id: post.id})
                        .deleteOne()
                        .exec((err, n) => {
                            console.log("---", n);

                            if(n.n > 0 && n.ok === 1 && n.deletedCount > 0) countSuccessOperations--;
                            if (close && countSuccessOperations === 0) closeFn.mongoClose();

                            return n;
                        });
                }

                return resolve(result);
            });
        }

        function deletionProcess(count) {
            // action
            let result = RowModel
                .find({})
                .limit(+count);
            console.log("DDDDD", count);
            new Promise((resolve, reject) => {
                result.exec((err, posts) => {
                    if (err) {
                        console.log(err.toString());
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
                    await returnPromise(posts[i], this, close);
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

        this.mongoInit();
        const RowModel = mongoose.model('RowModel', this.rowSchema);

        let result = RowModel
            .find({})
            .limit(+this.count);

        // for sleep() in promise
        function returnPromise(post, closeFn, close) {
            return new Promise(async (resolve) => {

                const result = await returnResult(closeFn, close);

                function returnResult(closeFn, close) {
                    RowModel.updateOne({_id: post.id}, {text: "uuu-X", time: new Date()},)
                        .exec((err, n) => {
                            console.log("***", n);
                            if (close) closeFn.mongoClose();
                            return n;
                        });
                }

                return resolve(result);
            });
        }

        // action
        new Promise((resolve, reject) => {
            result.exec( (err, posts) => {

                if (err) {
                    console.log(err.toString());
                    reject(err);
                }
                console.log(posts);
                resolve(posts);
            });

        }).then(async (posts) => {

            if (posts.length === 0) {
                this.mongoClose();
            }

            for ( let i = 0; i < posts.length; i++) {
                await this.sleep();
                const close = (i < posts.length-1) ? false : true;
                returnPromise(posts[i], this, close);
            };

        });
    }


}

module.exports = SlaveApp;