const amqp = require('amqplib/callback_api');
const execSync = require('child_process').execSync;
const CONFIG = require ('../config.js');

class MasterApp {

    constructor(program) {
        this.program = program;
        this.index = program.index;
    }

    action() {

        console.log('master');

        amqp.connect(CONFIG.rabbitInit, (error0, connection) => {
            if (error0) {
                throw error0;
            }
            connection.createChannel(async (error1, channel) => {
                if (error1) {
                    throw error1;
                }

                let queue = 'action';

                channel.prefetch(1);
                channel.assertQueue(queue, {
                    durable: false
                });

                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
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

            console.log(" [x] Received %s", msg);

            msg = JSON.parse(msg);
            msg.action = (msg.action == "add") ? "A" : (msg.action == 'delete') ? "D" : "U";

            const execProcess = execSync('node app.js slave -c '+ msg.count +' -i '+ this.index +' -' + msg.action, {stdio: 'inherit'});
            console.log(execProcess);

            setTimeout(resolve, 1000)
        });
    }

};


module.exports = MasterApp;