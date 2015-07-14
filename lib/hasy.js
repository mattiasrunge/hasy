"use strict";

let promisify = require("bluebird").promisify;
let co = require("bluebird").coroutine;
let fs = require("fs");
let path = require("path");
let logger = require("./logger")(module);
let localUnits = require("./local-units");
let remoteUnits = require("./remote-units");
let web = require("./web");
let properties = require("./properties");

let config = {};
let policies = [];

module.exports = {
    loadConfiguration: co(function*(file) {
        file = path.resolve(file || path.join(__dirname, "..", "conf", "config.json"));

        config = JSON.parse(yield promisify(fs.readFile)(file, "utf8"));

        logger.info("Configuration loaded successfully from " + file);

        // Default values
        config.port = config.port || 4000;
        config.units = config.units || {};
        config.servers = config.servers || [];
        config.policies = config.policies || [];
    }),
    loadPolicies: co(function*() {
        if (config.policies.length === 0) {
            return;
        }

        let policyPath = path.join(__dirname, "..", "policies");
        let PolicyTypes = config.policies.map(function(filepath) {
            return require(path.join(policyPath, filepath));
        });

        for (let PolicyType of PolicyTypes) {
            policies.push(new PolicyType(properties));
        }

        logger.info("Loaded policies from: " + config.policies.join(", "));
    }),
    start: co(function*(argv) {
        try {
            yield module.exports.loadConfiguration(argv.config);
            yield localUnits.start(config);
            yield remoteUnits.start(config);
            yield module.exports.loadPolicies();
            yield web.start(config);

            logger.info("Hasy initialized!");
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            process.exit(255);
        }
    })
};
