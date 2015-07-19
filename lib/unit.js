"use strict";

let co = require("bluebird").coroutine;
let promisify = require("bluebird").promisify;
let request = require("request");
let glob = promisify(require("glob"));
let path = require("path");
let logger = require('./logger')(module);

function create(parent) {
    let obj = {};

    for (let name in parent) {
        if (parent.hasOwnProperty(name)) {
            if (typeof parent[name] === "function") {
                obj[name] = parent[name];
            } else {
                Object.defineProperty(obj, name, { writable: true, enumerable: true, value: parent[name] });
            }
        }
    }

    return obj;
}

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
            properties[name] = create(require(filename));

            logger.info("Initializing property " + name);
            let value = yield co(properties[name].get.bind(properties[name]))(unit);
            logger.info("Value of " + name + " is " + value);
        }
    }, this);

    this.setProperty = co(function*(name, value) {
        let property = properties[name];

        if (!property) {
            eventHandler("error", "Failed to find property named " + name);
            return;
        }

        try {
            let oldValue = property.value;
            logger.info("Setting property " + name + " to " + value + ", current is " + oldValue);

            yield co(property.set.bind(property))(unit, value);

            eventHandler("propertyChange", { oldValue: oldValue, newValue: value, name: name });
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            eventHandler("error", typeof error === "error" ? error.stack.split("\n") : error);
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
