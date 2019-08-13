const Logger = require ('../services/logger');
const System = require('../services/system');
const execSync = require('child_process').execSync;

class DirectorAApp {

    constructor(program) {

        this.index = (program.index) ? program.index : 1;
        this.logger = new Logger('directorA', this.index);
        this.logger.info('[DA] DirectorA started');

    }

    async action() {

        this.sys = new System('directorA', this.index);

        // add fixture
        // const row = new this.sys.CommandModel({
        //     index: this.index,
        //     type: "update",
        //     startedAt: new Date(),
        //     count: 3,
        //     directCount: 4
        // });
        //
        // row.save( async (err) => {
        //     if (err) {
        //         this.sys.logger.err('  [S] Mongo error...' + err.toString());
        //     } else {
        //         this.sys.mongoClose();
        //     }
        // });
        //
        // return;



        while (true) {



            this.sys.CommandModel.find({}).exec((err, n) => {

                if (err) {
                    this.logger.err("[DA] Error: " + err.message);
                    return;
                }

                for (let row of n) {

                    const action = (row.type === "add") ? "A" : (row.type === 'delete') ? "D" : (row.type === 'update') ? "U" : false;
                    const count = (row.count) ? row.count : false;
                    const directCount = (row.directCount) ? row.directCount : false;

                    if (!action || !count || !directCount) {
                        this.logger.err("[DA] bad command, id: " + row._id);
                        continue;
                    }
                    const execProcess = execSync('node app.js director -c ' + count + ' -d ' + directCount + ' -' + action, {stdio: 'inherit'});

                    this.sys.CommandModel.findOne({_id: row._id})
                        .deleteOne()
                        .exec();

                    this.logger.info("[DA] Exec response from director: " + execProcess);


                }
           });

            await this.sys.sleep(3000);
        }



    }

};

module.exports = DirectorAApp;