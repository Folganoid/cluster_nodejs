var amqp = require('amqplib/callback_api');
var amqpConn = null;
const CONFIG = require ('../config.js');
const Logger = require ('../services/logger');

class DirectorApp {

    constructor(program) {

        this.program = program;
        this.count = (program.count) ? program.count : 0;
        this.index = (program.index) ? program.index : 1;
        this.directorCount = (program.directorCount) ? program.directorCount : 0;

        this.logger = new Logger('director', this.index);
        this.logger.info('[D] Director started');
    }

    action() {

        amqp.connect(CONFIG.rabbitInit, (err, conn) => {
            if (err) {
                this.logger.err('[D] Can\'t connect to rabbit: ' + err.toString());
            }
            conn.on("error", (err) => {
                if (err.message !== "Connection closing") {
                    this.logger.err('[D] Can\'t connect to rabbit: ' + err.toString());
                }
            });
            this.logger.info('[D] Rabbit connected');

            this.startPublisher(conn);
        });
    }

    startPublisher(amqpConn) {
        amqpConn.createConfirmChannel((err, ch) => {
            if (err) return;
            ch.on("error", (err) => {
                this.logger.err('[D] rabbit channel error: ' + err.toString());
            });
            ch.on("close", () => {
                this.logger.info('[D] rabbit channel closed');
            });

            var queue = 'action';
            var action = (this.program.add) ? "add" : (this.program.delete) ? "delete" : "update";
            var msg = '{"action": "'+ action +'", "count": '+ this.count +'}';

            ch.assertQueue(queue, {
                durable: false
            });

            for(let i = 0; i < this.directorCount; i++) {
                ch.sendToQueue(queue, Buffer.from(msg));
                console.log(" ["+ i +"] Sent %s", msg);
            }
            setTimeout(() => {amqpConn.close();}, 1000);

        });
    }
};

module.exports = DirectorApp;