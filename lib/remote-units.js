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
                logger.info("Connecting to " + host + "...");
                let io = socket(host);
                io.properties = [];

                io.on("connect", function() {
                    io.emit("getProperties", {}, function(error, list) {
                        servers.push(io);
                        logger.info("Connected to " + host);
                        io.properties = list;
                        io.properties.forEach(properties.register.bind(null, module.exports));
                    });
                });

                io.on("propertyChange", function(data) {
                    properties.handleEvent("propertyChange", data);
                });

                io.on("disconnect", function() {
                    logger.info("Disconnected from " + host + ", will try to reconnect...");
                    servers.splice(servers.indexOf(io), 1);
                    io.properties.forEach(properties.unregister);
                });

                resolve();
            });
        });

        return promises;
    }),
    setProperty: function(unitId, name, value) {
        let io = servers.filter(function(i) {
            return i.properties.filter(function(property) {
                return property.unitId === unitId && property.name === name;
            }).length > 0;
        })[0];

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
