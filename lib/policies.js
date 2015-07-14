"use strict";

let path = require("path");
let co = require("bluebird").coroutine;
let logger = require("./logger")(module);
let properties = require("./properties");

let policies = [];

module.exports = {
    start: co(function*(config) {
        if (config.policies.length === 0) {
            return;
        }

        logger.info("Loading policies...");

        let policyPath = path.join(__dirname, "..", "policies");
        policies = config.policies.map(function(filepath) {
            let Type = require(path.join(policyPath, filepath));
            logger.info("Loaded policy " + filepath);
            return new Type(properties);
        });

        logger.info("Done loading policies");
    })
};
