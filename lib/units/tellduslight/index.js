"use strict";

let tellsock = require("tellsock");
let co = require("bluebird").coroutine;

module.exports = function(config) {
    this.type = "light";
    this.tc = null;

    this.send = co(function*(value) {
        return yield this.sendCommand(value);
    }, this);

    this.sendCommand = function(value) {
        if (value === 0) {
            return this.tc.tdTurnOff(config.id);
        }

        return this.tc.tdDim(config.id, value);
    };

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            this.tc = new tellsock.TelldusClient();

            this.tc.tdLearn(config.id).then(console.log.bind(null, "learn"));
            this.tc.tdLastSentCommand(config.id, tellsock.DeviceMethods.TURNON | tellsock.DeviceMethods.TURNOFF, tellsock.DeviceMethods.DIM).then(console.log.bind(null, "cmd"));

            resolve();
        }.bind(this));
    };
};
