const amqp = require('amqplib/callback_api');
const execSync = require('child_process').execSync;
const CONFIG = require ('../config.js');
const Logger = require ('../services/logger');

class MasterApp {

    constructor(program) {
        this.program = program;
        this.index = program.index;
    }

    action() {

        this.logger = new Logger('master', this.index);
        this.logger.info(' [M] Master started');

        amqp.connect(CONFIG.rabbitInit, (error0, connection) => {
            if (error0) {
                this.logger.err(' [M] Can\'t connect to rabbit: ' + error0.toString());
                return setTimeout(() => {this.action()}, 5000);
            }
            connection.on("error", (err) => {
                if (err.message !== "Connection closing") {
                    this.logger.err('[D] Can\'t connect to rabbit: ' + err.toString());
                }

            });
            connection.on("close", () => {
                this.logger.warn("[D] AMQP reconnecting");
                return setTimeout(() => {this.action()}, 5000);
            });
            this.logger.info('[D] Rabbit connected');

            connection.createChannel(async (error1, channel) => {
                if (error1) {
                    this.logger.err(' [M] Can\'t create channel to rabbit: ' + error1.toString());
                    throw error1;
                }

                let queue = 'action';

                channel.prefetch(1);
                channel.assertQueue(queue, {
                    durable: false
                });

                this.logger.info(" [M] Connected to rabbit and waiting... " +  queue);

                try {
                    channel.consume(queue, async (msg) => {

                        await this.startCommand.call(this, msg.content.toString());
                        if (channel) channel.ack(msg);

                    }, {
                        noAck: false
                    });
                } catch (e) {
                    this.logger.err( '[M] Exec command error: ' + e.message);
                }

            });
        });

    };

    /**
     * @param msg
     * @returns {Promise<any>}
     */
    startCommand(msg) {
        return new Promise((resolve, reject) => {

            this.logger.info(" [M] Received " + JSON.stringify(msg));

            msg = JSON.parse(msg);
            msg.action = (msg.action == "add") ? "A" : (msg.action == 'delete') ? "D" : "U";

            try {
                const execProcess = execSync('node app.js slave -c ' + msg.count + ' -i ' + this.index + ' -' + msg.action, {stdio: 'inherit'});
                this.logger.info(" [M] Exec response from slave: " + execProcess);
                setTimeout(resolve, 1000)
            } catch (e) {
                reject(e.message);
            }
        });
    }

};


module.exports = MasterApp;