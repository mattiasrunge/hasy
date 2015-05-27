
var properties = require("./properties.json");
var request = require("request");

module.exports = function(config) {
    var eventHandler = function() {};

    function sendCommand(data, callback) {
        var options = {
            url: "http://" + config.hostname + "/YamahaRemoteControl/ctrl",
            body: data,
            headers: {
                "Content-Type": "text/xml; charset=UTF-8",
                "Cache-Control": "no-cache"
            }
        };

        console.log(options);

        request.post(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                callback(null, body);
            } else {
                callback(error);
            }
        });
    }

    function valueToRaw(property, value, callback) {
        if (property.type.name === "enum") {
            callback(null, property.type.values[value]);
            return;
        } else if (property.type.name === "range") {
            var newValue = parseInt(value, 10);

            if (isNaN(newValue)) {
                callback("Value is not a number, " + value);
                return;
            }

            if (typeof property.type.min !== "undefined" && newValue < property.type.min) {
                callback("Value must be larger than or equal to " + property.type.min);
                return;
            }

            if (typeof property.type.min !== "undefined" && newValue > property.type.max) {
                callback("Value must be smaller than or equal to " + property.type.max);
                return;
            }

            callback(null, value.toString(16).toUpperCase());
            return;
        }

        callback("Property does not define a valid type");
    }

    function rawToValue(property, raw, callback) {
        if (property.type.name === "enum") {
            for (var name in property.type.values) {
                if (property.type.values.hasOwnProperty(name)) {
                    if (property.type.values[name] === raw) {
                        callback(null, name);
                        return;
                    }
                }
            }

            callback(raw + " did not match any known values");
            return;
        } else if (property.type.name === "range") {
            var value = parseInt(raw, 16);

            if (isNaN(value)) {
                callback(raw + " is not a number");
                return;
            }

            callback(null, value);
            return;
        }

        callback("Property does not define a valid type");
    }

    this.setup = function() {
    };

    this.setProperty = function(name, value, actionId) {
        var property = properties[name];

        if (!property) {
            eventHandler("error", "Failed to find property named " + name, actionId);
            return;
        }

        valueToRaw(property, value, function(error, raw) {
            if (error) {
                eventHandler("error", value + " is not a valid value for property " + name, actionId ? [ actionId ] : []);
                return;
            }

            var command = raw;

            console.log("Setting property " + name + " to " + value + " is " + property.value);
            console.log("Sending command: " + command);

            property.actions = property.actions || [];
            if (actionId) {
                property.actions.push(actionId);
            }

            sendCommand(command, function(error, results) {
                if (error) {
                    eventHandler("error", "Failed to send command to receiver", actionId ? [ actionId ] : []);
                    return;
                }
            });
        });
    };

    this.getProperties = function() {
        return properties;
    };

    this.getName = function() {
        return config.name;
    };

    this.getType = function() {
        return "receiver";
    };

    this.onEvent = function(callback) {
        eventHandler = callback;
    };
};
