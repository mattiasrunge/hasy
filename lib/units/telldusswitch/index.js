"use strict";

let tellsock = require("tellsock");
let co = require("bluebird").coroutine;
let logger = require("../../logger")(module);

module.exports = function(config) {
    this.type = "light";
    this.tc = null;

    this.read = co(function*() {
        let cmd = yield this.tc.tdLastSentCommand(config.id, tellsock.DeviceMethods.TURNON | tellsock.DeviceMethods.TURNOFF);

        return cmd === tellsock.DeviceMethods.TURNON;
    }, this);

    this.send = co(function*(value) {
        return yield this.sendCommand(value);
    }, this);

    this.sendCommand = function(value) {
        if (value) {
            return this.tc.tdTurnOn(config.id);
        } else {
            return this.tc.tdTurnOff(config.id);
        }
    };

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            this.tc = new tellsock.TelldusClient();
            resolve();
        }.bind(this));
    };
};
