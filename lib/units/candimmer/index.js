"use strict";

let co = require("bluebird").coroutine;
let net = require("net");
let logger = require("../../logger")(module);

module.exports = function(config, unit) {
    this.type = "dimmer";
    this.client = null;
    this.pending = false;

    this.read = co(function*() {
        return yield this.sendCommand("JSON.stringify(Module_GetLastDataNative('" + config.id + "'));");
    }, this);

    this.send = co(function*(data) {
        return yield this.sendCommand("Dimmer_AbsoluteFade('" + config.id + "',135," + data + ");", data);
    }, this);

    this.sendCommand = function(data, value) {
        return new Promise(function(resolve, reject) {
            this.pending = { data: data, value: value, resolve: resolve, reject: reject };

            this.client.write(data + "\n", function(error) {
                if (error) {
                    this.pending = false;
                    return reject(error);
                }
            }.bind(this));
        }.bind(this));
    };

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            this.client = net.connect({ host: config.hostname, port: config.port }, function() {
                logger.info("Connected to Atom at " + config.hostname + ":" + config.port);
                resolve();
            }.bind(this));

            this.client.on("data", function(data) {
                data = JSON.parse(data.toString());

                if (this.pending) {
                    if (typeof data === "boolean") {
                        if (data) {
                            this.pending.resolve(this.pending.value);
                        } else {
                            this.pending.reject("Could not set property");
                        }
                    } else if (data[config.id]) {
                        this.pending.resolve(data[config.id].Level.value);
                    }

                    this.pending = false;
                    return;
                }

                if (data[config.id]) {
                    unit.setProperty("Value", data[config.id].Level.value);
                }
            }.bind(this));

            this.client.on("end", function() {
                logger.info("Disconnected from Atom");
            });
        }.bind(this));
    };
}
