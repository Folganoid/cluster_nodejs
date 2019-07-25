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

        if (this.add && this.count > 0) {

            this.mongoInit();
            const RowModel = mongoose.model('RowModel', rowSchema);

            for (let i = 0; i < this.count; i++) {

                const row = new RowModel({
                    index: this.index,
                    text: "xxx-" + i,
                    time: new Date()
                });

                row.save((err) => {
                    if (err) {
                        console.log('Mongo error...')
                    } else {
                        console.log(i);
                        this.mongoClose();
                    }
                });
            }
        } else if (this.delete && this.count > 0) {

            this.mongoInit();
            const that = this;
            const RowModel = mongoose.model('RowModel', rowSchema);

            RowModel
                .find({index: 1})
                .limit(+this.count)
                .exec( async function(err, posts) {

                         let cnt = posts.length;

                         for (var post in posts) {

                             await that.sleep(1000);

                             let a = RowModel.findOne({ _id: posts[post].id });
                             a.deleteOne().exec(function (err,n) {
                                 console.log(n);
                                 cnt--;
                                 if (cnt <= 0) that.mongoClose();
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