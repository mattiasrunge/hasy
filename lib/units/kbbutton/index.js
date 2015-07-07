"use strict";

let Keyboard = require("raw-keyboard");
let co = require("bluebird").coroutine;

module.exports = function(config, unit) {
    this.type = "button";
    this.keyboard = null;

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            this.keyboard = new Keyboard(config.device);

            this.keyboard.on("keydown", function(code) {
                unit.setProperty("Button", code, 0);
            });

            this.keyboard.on("keyup", function(code) {
                unit.setProperty("Button", false, 0)
            });

            this.keyboard.on("error", function(msg) {
                reject(msg);
            });

            resolve();
        }.bind(this));
    };
};
