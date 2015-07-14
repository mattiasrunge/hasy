"use strict";

let co = require("bluebird").coroutine;
let Unit = require("./unit");
let logger = require("./logger")(module);
let properties = require("./properties");

let units = {};

module.exports = {
    start: co(function*(config) {
        for (let unitId of Object.keys(config.units)) {
            if (!config.units[unitId].type || !config.units[unitId].name) {
                throw new Error("Missing type or name from unit declaration in configuration: " + JSON.stringify(config.units[unitId], null, 2));
            }

            logger.info("Initializing unit " + config.units[unitId].name + " of type " + config.units[unitId].type + "...");

            units[unitId] = {
                unitId: unitId,
                type: config.units[unitId].type,
                name: config.units[unitId].name,
                instance: new Unit(config.units[unitId])
            };
        }

        for (let unitId of Object.keys(units)) {
            logger.info("Setting up unit " + units[unitId].name + "...");
            yield units[unitId].instance.setup();

            units[unitId].instance.onEvent(function(event, data) {
                properties.handleEvent(event, { unitId: unitId, data: data });
            });

            Object.keys(units[unitId].instance.getProperties()).forEach(function(name) {
                let property = {
                    name: name,
                    unitId: unitId,
                    unitType: units[unitId].type,
                    unitName: units[unitId].name
                };

                for (let key in units[unitId].instance.getProperties()[name]) {
                    if (units[unitId].instance.getProperties()[name].hasOwnProperty(key)) {
                        property[key] = units[unitId].instance.getProperties()[name][key];
                    }
                }

                properties.register(module.exports, property);
            });
        }
    }),
    setProperty: function(unitId, name, value) {
        if (!units[unitId]) {
	    throw new Error("No unit with id " + unitId);
	}

        return units[unitId].instance.setProperty(name, value);
    }
};
