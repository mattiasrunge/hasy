"use strict";

let promisifyAll = require("bluebird").promisifyAll;
let co = require("bluebird").coroutine;
let fs = promisifyAll(require("fs"));
let path = require("path");
let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let logger = require("./logger")(module);
let units = require("./units");
let web = require("./web");
let properties = require("./properties");

let config = {};

module.exports = {
    loadConfiguration: co(function*(file) {
        file = path.resolve(file || path.join(__dirname, "..", "conf", "config.json"));

        config = JSON.parse(yield fs.readFileAsync(file, "utf8"));

        logger.info("Configuration loaded successfully from " + file);

        // Default values
        config.port = config.port || 3000;
        config.units = config.units || {};
        config.servers = config.servers || [];
        config.policies = config.policies || [];
    }),
    start: co(function*(argv) {
        try {
            yield module.exports.loadConfiguration(argv.config);
            yield units.start(config);
            yield web.start(config);

            logger.info("Hasy initialized!");
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            process.exit(255);
        }
    })
};
