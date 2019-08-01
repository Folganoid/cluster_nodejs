var amqp = require('amqplib/callback_api');

class MasterApp {

    constructor(program) {
        this.program = program;
    }

    action() {

        console.log('master');

        amqp.connect('amqp://localhost', (error0, connection) => {
            if (error0) {
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    throw error1;
                }

                var queue = 'action';

                channel.assertQueue(queue, {
                    durable: false
                });

                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

                channel.consume(queue, async (msg) => {
                    console.log(" [x] Received %s", msg.content.toString());
                }, {
                    noAck: true
                });
            });
        });



    };
};


module.exports = MasterApp;