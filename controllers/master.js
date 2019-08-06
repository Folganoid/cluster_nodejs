const amqp = require('amqplib/callback_api');
const execSync = require('child_process').execSync;
const CONFIG = require ('../config.js');
const Logger = require ('../services/logger');

class MasterApp {

    constructor(program) {
        this.program = program;
        this.index = program.index;

        this.logger = new Logger('master', this.index);
        this.logger.info(' [M] Master started');
    }

    action() {

        amqp.connect(CONFIG.rabbitInit, (error0, connection) => {
            if (error0) {
                this.logger.err(' [M] Can\'t connect to rabbit: ' + error0.toString());
                throw error0;
            }
            connection.createChannel(async (error1, channel) => {
                if (error1) {
                    this.logger.err(' [M] Can\'t ccreate channel to rabbit: ' + error1.toString());
                    throw error1;
                }

                let queue = 'action';

                channel.prefetch(1);
                channel.assertQueue(queue, {
                    durable: false
                });

                this.logger.info(" [M] Connected to rabbit and waiting... " +  queue);
                channel.consume(queue, async(msg) => {

                    await this.startCommand(msg.content.toString());
                    channel.ack(msg);

                }, {
                    noAck: false
                });

            });
        });

    };

    /**
     * @param msg
     * @returns {Promise<any>}
     */
    startCommand(msg) {
        return new Promise((resolve) => {

            this.logger.info(" [M] Received " + JSON.stringify(msg));

            msg = JSON.parse(msg);
            msg.action = (msg.action == "add") ? "A" : (msg.action == 'delete') ? "D" : "U";

            const execProcess = execSync('node app.js slave -c '+ msg.count +' -i '+ this.index +' -' + msg.action, {stdio: 'inherit'});
            this.logger.info(" [M] Exec response from slave: " + execProcess);

            setTimeout(resolve, 1000)
        });
    }

};


module.exports = MasterApp;