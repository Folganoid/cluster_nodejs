var amqp = require('amqplib/callback_api');
var amqpConn = null;
const CONFIG = require ('../config.js');

class DirectorApp {

    constructor(program) {

        this.program = program;
        this.count = (program.count) ? program.count : 0;
        this.directorCount = (program.directorCount) ? program.directorCount : 0;
    }

    action() {

            amqp.connect(CONFIG.rabbitInit, (err, conn) => {
                if (err) {
                    console.error("[AMQP]", err.message);
                }
                conn.on("error", function(err) {
                    if (err.message !== "Connection closing") {
                        console.error("[AMQP] conn error", err.message);
                    }
                });
                console.log("[AMQP] connected");

                amqpConn = conn;

                amqpConn.createConfirmChannel((err, ch) => {
                    if (err) return;
                    ch.on("error", function(err) {
                        console.error("[AMQP] channel error", err.message);
                    });
                    ch.on("close", function() {
                        console.log("[AMQP] channel closed");
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
            });
    }
};

module.exports = DirectorApp;