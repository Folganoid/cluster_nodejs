var amqp = require('amqplib/callback_api');

class DirectorApp {

    constructor(program) {

        this.program = program;
        this.count = program.count;
        this.add = program.add;
        this.delete = program.delete;
        this.update = program.update;
    }

    action() {

        amqp.connect('amqp://guest:guest@localhost:5672', (error0, connection) => {
            if (error0) {
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    throw error1;
                }
                var queue = 'action';
                var action = (this.add) ? "add" : (this.delete) ? "delete" : "update";
                var msg = '{"action": "'+ action +'", "count": 100}';

                channel.assertQueue(queue, {
                    durable: false
                });

                for(let i = 0; i < this.count; i++) {
                    channel.sendToQueue(queue, Buffer.from(msg));
                    console.log(" ["+ i +"] Sent %s", msg);
                }
            });

            setTimeout(function() {
                connection.close();
                process.exit(0)
            }, 1000);

        });
    }

};

module.exports = DirectorApp;