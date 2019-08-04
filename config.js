const CONFIG = {
        mongoDbHost: "127.0.0.1",
        mongoDbPort: "27017",
        mongoDbLogin: "mongo",
        mongoDbPassword: "mongo",
        mongoDbBase: "cluster",

        rabbitInit: "amqp://guest:guest@localhost:5672?heartbeat=60"
};

module.exports = CONFIG;