"use strict";

let co = require("bluebird").coroutine;
let Unit = require("./unit");
let logger = require("./logger")(module);
let socket = require("socket.io-client");
let properties = require("./properties");

let servers = [];

module.exports = {
    start: co(function*(config) {
        if (config.servers.length === 0) {
            return;
        }

        let promises = config.servers.map(function(host) {
            return new Promise(function(resolve, reject) {
                let io = socket(host);
                io.properties = [];

                io.on("connect", function() {
                    io.emit("getProperties", {}, function(error, list) {
                        servers.push(io);
                        logger.info("Connected to " + host);
                        io.properties = list;
                        io.properties.forEach(properties.register.bind(null, module.exports));
                        resolve();
                    });
                });

                io.on("propertyChange", module.exports.onPropertyChange.bind(null, io));

                io.on("disconnect", function() {
                    logger.info("Disconnected from " + host + ", will try to reconnect...");
                    servers.splice(servers.indexOf(io), 1);
                    io.properties.forEach(properties.unregister);
                });
            });
        });

        return promises;
    }),
    onPropertyChange: function(io, data) {
        let property = io.properties.filter(function(property) {
            return property.unitId === data.unitId && property.name === data.data.name;
        })[0];

        if (!property) {
            logger.error("Got property change for unknown property", data);
            return;
        }

        property.value = data.data.newValue;

        properties.handleEvent("propertyChange", data);
    },
    setProperty: function(unitId, name, value) {
        let io = false;

        servers.forEach(function(i) {
            i.properties.forEach(function(property) {
            if (property.unitId === unitId && property.name === name) {
                io = i;
            }
            });
        });

        if (!io) {
            throw new Error("Got property change for unknown property", data);
        }

        return new Promise(function(resolve, reject) {
            io.emit("setProperty", { unitId: unitId, name: name, value: value }, function(error) {
                    if (error) {
                        return reject("Failed to set property", { unitId: property.unitId, name: property.name, value: value }, error);
                    }

            resolve();
            });
        });
    }
};
