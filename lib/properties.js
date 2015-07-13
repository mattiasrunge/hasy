"use strict";

let co = require("bluebird").coroutine;
let Unit = require("./unit");
let logger = require("./logger")(module);

let properties = [];
let eventHandlers = [];

module.exports = {
    register: function(unit, property) {
        properties.push({ unit: unit, property: property });
    },
    set: function(unitId, name, value) {
        let property = properties.filter(function(property) {
            return property.property.unitId === unitId && property.property.name === name;
        })[0];

        if (!property) {
            throw new Error("No property named " + name + " found on unit " + unitId);
        }

        return property.unit.instance.setProperty(name, value);
    },
    list: function() {
        return properties.map(function(property) {
            return property.property;
        });
    },
    handleEvent: function(event, data) {
        eventHandlers.forEach(function(handler) {
            handler(event, data);
        });
    },
    onEvent: function(handler) {
        eventHandlers.push(handler);
    }
};
