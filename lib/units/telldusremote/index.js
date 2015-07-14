"use strict";

let tellsock = require("tellsock");
let co = require("bluebird").coroutine;
let logger = require("../../logger")(module);

module.exports = function(config, unit) {
    this.type = "nexa-remote";
    this.te = null;

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            this.te = new tellsock.TelldusEvents();

            this.te.on("connect", function () {
                resolve();
            });

            this.te.on("error", function(msg) {
                reject(msg);
            });

            this.te.on("message", function(msg) {
                unit.setProperty("Data", msg);
            });
        }.bind(this));
    };
};

