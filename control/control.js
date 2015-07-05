"use strict";

let promisifyAll = require("bluebird").promisifyAll;
let co = require("bluebird").coroutine;
let fs = promisifyAll(require("fs"));
let path = require("path");

module.exports = function() {
    let sockets = [];
    let eventHandlers = [];
    let config = {};
    let policies = [];

    this.loadConfiguration = co(function*(file) {
        file = path.resolve(file || path.join(__dirname, "conf", "config.json"));

        config = JSON.parse(yield fs.readFileAsync(file, "utf8"));

        console.log("Configuration loaded successfully from " + file);

        // Default values
        config.hosts = config.hosts || [];
        config.servers = config.servers || [];
    }, this);

    this.start = co(function*(argv) {
        try {
            yield this.loadConfiguration(argv.config);

            yield this.connectToServers();

            yield this.loadPolicies();

            console.log("Hasy Control initialized!");
        } catch (error) {
            console.error(error);
            console.error(error.stack);
            process.exit(255);
        }
    }, this);

    this.triggerPropertyChange = function(data) {
        let handlers = eventHandlers.filter(function(item) {
            return item.unitId === data.unitId && item.name === data.data.name;
        });

        for (let handler of handlers) {
            handler.eventHandler(data.data);
        }
    };

    this.onPropertyChange = function(unitId, name, eventHandler) {
        eventHandlers.push({ unitId: unitId, name: name, eventHandler: eventHandler });
    };

    this.setProperty = function(unitId, name, value, actionId) {
        console.log("setProperty", arguments);
        var socket = sockets.filter(function(socket) {
            return Object.keys(socket.units).indexOf(unitId) !== -1;
        })[0];

        if (!socket) {
            console.log("No socket found with a unitId of " + unitId);
            return;
        }

        socket.emit("setProperty", { unitId: unitId, name: name, value: value, actionId: actionId || 0 });
    };
    /*
     l ist[*id].getProperty = function(name, value) {
     socket.emit("setProperty", { unitId: list[id], name: id, value: value, actionId: 0 });
    });*/

    this.connectToServers = co(function*() {
        for (let host of config.servers) {
            let socket = require("socket.io-client")(host);

            socket.on("connect", function() {
                socket.emit("getUnits", {}, function(list) {
                    socket.units = list;
                    sockets.push(socket);

                    console.log("Connected to " + host + " and found unitIds: " + Object.keys(socket.units).join(", "));
                });
            });

            socket.on("propertyChange", this.triggerPropertyChange.bind(this));

            socket.on("disconnect", function() {
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

        console.log("Loaded policies from: " + config.policies.join(", "));
    }, this);
};
