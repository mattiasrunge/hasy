"use strict";

let co = require("bluebird").coroutine;
let promisify = require("bluebird").promisify;
let request = require("request");
let glob = promisify(require("glob"));
let path = require("path");
let logger = require('./logger')(module);

module.exports = function(config) {
    let properties = {};
    let eventHandler = function() {};
    let Type = require("./units/" + config.type + "/index");
    let unit = new Type(config, this);

    this.setup = co(function*() {
        logger.info("Configuring unit " + config.type);
        if (unit.setup) {
            yield unit.setup();
        }

        let files = yield glob(__dirname + "/units/" + config.type + "/properties/*.js");

        for (let filename of files) {
            let name = path.basename(filename, ".js");
            properties[name] = require(filename);
            logger.info("Initializing property " + name);
            let value = yield co(properties[name].get)(unit);
            logger.info("Value of " + name + " is " + value);
        }
    }, this);

    this.setProperty = co(function*(name, value, actionId) {
        let property = properties[name];

        if (!property) {
            eventHandler("error", "Failed to find property named " + name, actionId ? [ actionId ] : []);
            return;
        }

        // if (property.value === value) {
        //     return;
        // }

        try {
            let oldValue = property.value;
            logger.info("Setting property " + name + " to " + value + " is " + oldValue + " for action " + actionId);

            yield co(property.set)(unit, value);

            eventHandler("propertyChange", { oldValue: oldValue, newValue: value, name: name }, actionId ? [ actionId ] : []);
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            eventHandler("error", error.stack.split("\n"), actionId ? [ actionId ] : []);
        }
    }, this);

    this.getProperties = function() {
        return properties;
    };

    this.getName = function() {
        return config.name;
    };

    this.getType = function() {
        return unit.type;
    };

    this.onEvent = function(callback) {
        eventHandler = callback;
    };
};
