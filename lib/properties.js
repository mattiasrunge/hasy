"use strict";

let co = require("bluebird").coroutine;
let Unit = require("./unit");
let logger = require("./logger")(module);

let properties = [];
let eventHandlers = [];

module.exports = {
    register: function(manager, property) {
        properties.push({ manager: manager, property: property });
    },
    unregister: function(property) {
        properties = properties.filter(function(p) {
            return p.property.unitId === property.unitId && p.property.name === property.name;
        });
    },
    set: function(unitId, name, value) {
        let property = properties.filter(function(property) {
            return property.property.unitId === unitId && property.property.name === name;
        })[0];

        if (!property) {
            logger.error(unitId, name, value);
            throw new Error("No property named " + name + " found on unit " + unitId);
        }

        return property.manager.setProperty(unitId, name, value);
    },
    list: function() {
        return properties.map(function(property) {
            return property.property;
        });
    },
    handleEvent: function(event, data) {
        let property = properties.filter(function(property) {
            return property.property.unitId === data.unitId && property.property.name === data.data.name;
        })[0];

        if (!property) {
            console.log(event, data);
            throw new Error("Got property change for unknown property");
        }

        property.property.value = data.data.newValue;
        //logger.info("Property (" + property.unitId + ", " + property.name + ") set to " + data.data.newValue + ", previous value was " + data.data.oldValue);

        eventHandlers.forEach(function(handler) {
            handler(event, data);
        });
    },
    onEvent: function(handler) {
        eventHandlers.push(handler);
    }
};
