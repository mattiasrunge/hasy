"use strict";

let tellsock = require("tellsock");
let co = require("bluebird").coroutine;
let logger = require('../../logger')(module);

module.exports = function(config) {
    this.type = "light";
    this.tc = null;

    this.read = co(function*() {
        let cmd = yield this.tc.tdLastSentCommand(config.id, tellsock.DeviceMethods.TURNON | tellsock.DeviceMethods.TURNOFF | tellsock.DeviceMethods.DIM);

        if (cmd === tellsock.DeviceMethods.DIM) {
            return parseInt(yield this.tc.tdLastSentValue(config.id), 10);
        }

        return 0;
    }, this);

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
            resolve();
        }.bind(this));
    };
};
