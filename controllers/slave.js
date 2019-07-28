const mongoose = require('mongoose');
const CONFIG = require ('../config.js');

class SlaveApp {

    constructor(program) {

        this.index = program.index;
        this.add = program.add;
        this.delete = program.delete;
        this.update = program.update;
        this.count = program.count;
    }

    async action() {

        const Schema = mongoose.Schema;

        let rowSchema = new Schema({
            index: Number,
            text: String,
            time: Date,
        });

        /**
         * Create
         */
        if (this.add && this.count > 0) {

            this.mongoInit();
            const RowModel = mongoose.model('RowModel', rowSchema);

            for (let i = 0; i < this.count; i++) {

                const row = new RowModel({
                    index: this.index,
                    text: "xxx-" + i,
                    time: new Date()
                });

                row.save( (err) => {
                    if (err) {
                        console.log('Mongo error...')
                    } else {
                        console.log('+++', i);
                        this.mongoClose();
                    }
                });
            }
        /**
        * DELETE
        */
        } else if (this.delete && this.count > 0) {

            this.mongoInit();
            const RowModel = mongoose.model('RowModel', rowSchema);

            var result = RowModel
                .find({index: this.index})
                .limit(+this.count);

            new Promise((resolve, reject) => {
                    result.exec( (err, posts) => {

                        if (err) {
                            console.log(err.toString());
                            reject(err);
                        }

                        resolve(posts);
                    });
                }).then((posts) => {

                    for (let i = 0 ; i < posts.length ; i++) {

                        new Promise((resolve2, reject2) => {

                            RowModel.findOne({_id: posts[i].id})
                                .deleteOne()
                                .exec((err, n) => {

                                    if(err) {
                                        console.log(err.toString());
                                        reject2(err);
                                    }

                                    resolve2(n);

                                });
                        }).then((n) => {
                            console.log("---", n);
                            this.mongoClose();

                        });
                    }

            });


        }
    };

    mongoInit() {
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
    };

    mongoClose() {
        mongoose.connection.close();
    };

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = SlaveApp;