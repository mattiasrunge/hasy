"use strict";

let Keyboard = require("raw-keyboard");

module.exports = function(config, unit) {
    this.type = "keyboard-button";
    this.keyboard = null;

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            this.keyboard = new Keyboard();

            this.keyboard.on("keydown", function(code) {
                unit.setProperty("Data", code);
            });

            this.keyboard.on("keyup", function(code) {
                unit.setProperty("Data", false)
            });

            this.keyboard.on("error", function(msg) {
                reject(msg);
            });

            this.keyboard.on("ready", function(msg) {
                resolve();
            });

            this.keyboard.open(config.device, config.keys || []);
        }.bind(this));
    };
};
