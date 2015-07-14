"use strict";

let promisify = require("bluebird").promisify;
let co = require("bluebird").coroutine;
let fs = require("fs");
let path = require("path");
let logger = require("./logger")(module);
let localUnits = require("./local-units");
let remoteUnits = require("./remote-units");
let io = require("./io");
let properties = require("./properties");
let polices = require("./policies");

module.exports = {
    loadConfiguration: co(function*(file) {
        file = path.resolve(file || path.join(__dirname, "..", "conf", "config.json"));

        let config = JSON.parse(yield promisify(fs.readFile)(file, "utf8"));

        logger.info("Configuration loaded successfully from " + file);

        // Default values
        config.port = config.port || 4000;
        config.units = config.units || {};
        config.servers = config.servers || [];
        config.policies = config.policies || [];

        return config;
    }),
    start: co(function*(argv) {
        try {
            let config = yield module.exports.loadConfiguration(argv.config);
            yield localUnits.start(config);
            yield remoteUnits.start(config);
            yield polices.start(config);
            yield io.start(config);

            logger.info("Hasy initialized!");
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            process.exit(255);
        }
    })
};
