"use strict";

let promisifyAll = require("bluebird").promisifyAll;
let co = require("bluebird").coroutine;
let fs = promisifyAll(require("fs"));
let path = require("path");
let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let logger = require("../lib/logger")(module);

module.exports = function() {
    let sockets = [];
    let eventHandlers = [];
    let config = {};
    let policies = [];
    let actions = {};

    this.loadConfiguration = co(function*(file) {
        file = path.resolve(file || path.join(__dirname, "conf", "config.json"));

        config = JSON.parse(yield fs.readFileAsync(file, "utf8"));

        logger.info("Configuration loaded successfully from " + file);

        // Default values
        config.hosts = config.hosts || [];
        config.servers = config.servers || [];
        config.port = config.port || 3001;
    }, this);

    this.startServer = co(function*() {
        // Serve static documents
        app.use(express.static(path.join(__dirname, "public")));

        // Setup client APIs
        io.on("connection", function(socket) {
            logger.info("A new websocket client connected from " + socket.handshake.address.address);
/*
            socket.on("setProperty", function(data) {
                if (!data.unitId || !data.name || typeof data.value === "undefined") {
                    console.error("Malformed setProperty data", data);
                    return;
                }

                this.units[data.unitId].instance.setProperty(data.name, data.value, data.actionId);
            }.bind(this));*/
        }.bind(this));

        // Start HTTP server
        server.listen(config.port);
    }, this);

    this.start = co(function*(argv) {
        try {
            yield this.loadConfiguration(argv.config);

            yield this.connectToServers();

            yield this.loadPolicies();

            yield this.startServer();

            logger.info("Hasy Control initialized!");
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            process.exit(255);
        }
    }, this);

    this.triggerPropertyChange = co(function*(data) {
        let handlers = eventHandlers.filter(function(item) {
            return item.unitId === data.unitId && item.name === data.data.name;
        });

        let socket = sockets.filter(function(socket) {
            return Object.keys(socket.units).indexOf(data.unitId) !== -1;
        })[0];

        if (socket && socket.units[data.unitId].properties[data.data.name]) {
            socket.units[data.unitId].properties[data.data.name].value = data.data.newValue;
        }

        if (actions[data.actionId]) {
            actions[data.actionId].resolve();
        }

        for (let handler of handlers) {
            co(handler.eventHandler)(data.data);
        }
    }, this);

    this.onPropertyChange = function(unitId, name, eventHandler) {
        eventHandlers.push({ unitId: unitId, name: name, eventHandler: eventHandler });
    };

    this.setProperty = function(unitId, name, value) {
        return new Promise(function(resolve, reject) {
            let socket = sockets.filter(function(socket) {
                return Object.keys(socket.units).indexOf(unitId) !== -1;
            })[0];

            if (!socket) {
                return reject("No socket found with a unitId of " + unitId);
            }

            if (!socket.units[unitId].properties[name]) {
                return reject("No such property " + name + " on unit " + unitId);
            }

            if (socket.units[unitId].properties[name].value === value) {
                return resolve();
            }

            let actionId = new Date().getTime(); // TODO: Make into UUID

            actions[actionId] = { resolve: resolve, reject: reject };
            socket.emit("setProperty", { unitId: unitId, name: name, value: value, actionId: actionId });
        }.bind(this));
    };

    this.getProperty = function(unitId, name) {
        let socket = sockets.filter(function(socket) {
            return Object.keys(socket.units).indexOf(unitId) !== -1;
        })[0];

        if (!socket) {
            logger.warn("No socket found with a unitId of " + unitId);
            return null;
        }

        if (!socket.units[unitId].properties[name]) {
            logger.warn("No such property " + name + " on unit " + unitId);
            return null;
        }

        return socket.units[unitId].properties[name].value;
    };

    this.connectToServers = co(function*() {
        for (let host of config.servers) {
            let socket = require("socket.io-client")(host);

            socket.on("connect", function() {
                socket.emit("getUnits", {}, function(list) {
                    socket.units = list;
                    sockets.push(socket);

                    logger.info("Connected to " + host + " and found unitIds: " + Object.keys(socket.units).join(", "));
                });
            });

            socket.on("propertyChange", this.triggerPropertyChange);
            // TODO: Listen for error and reject action

            socket.on("disconnect", function() {
                logger.info("Disconnected from " + host + ", will try to reconnect...");
                sockets.splice(sockets.indexOf(socket), 1);
            });
        }
    }, this);

    this.loadPolicies = co(function*() {
        let PolicyTypes = config.policies.map(function(path) {
            return require("./policies/" + path);
        });

        for (let PolicyType of PolicyTypes) {
            policies.push(new PolicyType(this));
        }

        logger.info("Loaded policies from: " + config.policies.join(", "));
    }, this);
};
