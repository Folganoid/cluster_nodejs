var amqp = require('amqplib/callback_api');

class MasterApp {

    constructor(program) {
        this.program = program;
    }

    action() {

        console.log('master');

        amqp.connect('amqp://guest:guest@localhost:5672', (error0, connection) => {
            if (error0) {
                throw error0;
            }
            connection.createChannel((error1, channel) => {
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
     * todo shell command for slave
     *
     * @param msg
     * @returns {Promise<any>}
     */
    startCommand(msg) {
        return new Promise((resolve) => {

            console.log(" [x] Received %s", msg);

            setTimeout(resolve, 1000)
        });
    }

};


module.exports = MasterApp;