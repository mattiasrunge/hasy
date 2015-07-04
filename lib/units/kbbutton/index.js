"use strict";

let gkm = require("gkm");
let co = require("bluebird").coroutine;
let logger = require('../../logger')(module);

module.exports = function(config, unit) {
    this.type = "button";

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            gkm.events.on("key.*", function(data) {
                let key = data[0].substr(0, 1);;

                if (config.keys.length === 0 || config.keys.indexOf(key) !== -1) {
                    if (this.event === "key.pressed") {
                        logger.info("pressed", key);
                        unit.setProperty("Button", key, 0);
                    } else if (this.event === "key.released") {
                        logger.info("released", key);
                        unit.setProperty("Button", false, 0);
                    }
                }
            });

            resolve();
        }.bind(this));
    };
};
