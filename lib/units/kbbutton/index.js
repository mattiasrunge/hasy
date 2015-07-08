"use strict";

let Keyboard = require("raw-keyboard");
let co = require("bluebird").coroutine;

module.exports = function(config, unit) {
    this.type = "button";
    this.keyboard = null;
    config.keys = config.keys || [];

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            this.keyboard = new Keyboard();

            this.keyboard.on("keydown", function(code) {
                if (config.keys.indexOf(code) != -1) {
                    unit.setProperty("Button", code, 0);
                }
            });

            this.keyboard.on("keyup", function(code) {
                if (config.keys.indexOf(code) != -1) {
                    unit.setProperty("Button", false, 0)
                }
            });

            this.keyboard.on("error", function(msg) {
                reject(msg);
            });

            this.keyboard.on("ready", function(msg) {
                resolve();
            });

            this.keyboard.open(config.device);
        }.bind(this));
    };
};
