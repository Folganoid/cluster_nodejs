const fs = require('fs');

class Logger {

    constructor(controller, index) {

        // init logger
        const path = './logs/'+ controller +'/' + index;
        const fileName = new Date().toISOString() + '.log';

        this.mkdirSyncRecursive(path);

        const SimpleNodeLogger = require('simple-node-logger'),
            opts = {
                logFilePath: path + '/'+ fileName,
                timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
            };

        this.log = SimpleNodeLogger.createSimpleLogger( opts );

    }

    info(message) {
        this.log.info(message, " " ,new Date().toJSON());
    }

    warn(message) {
        this.log.warn(message, " " ,new Date().toJSON());
    }

    err(message) {
        this.log.error(message, " ",new Date().toJSON());
    }


    mkdirSyncRecursive(directory) {

        var path = directory.replace(/\/$/, '').split('/');
        for (var i = 1; i <= path.length; i++) {
            var segment = path.slice(0, i).join('/');
            !fs.existsSync(segment) ? fs.mkdirSync(segment) : null ;
        }
    }

}

module.exports = Logger;