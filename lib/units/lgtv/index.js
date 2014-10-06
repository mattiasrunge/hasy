
var serialport = require("serialport");
var properties = require("./properties.json");

module.exports = function(config) {
    var serialPort = null;
    var eventHandler = function() {};

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

    function getPropertyByCommandLetter(letter) {
        for (var name in properties) {
            if (properties.hasOwnProperty(name)) {
                if (properties[name].command[1] === letter) {
                    return { name: name, property: properties[name] };
                }
            }
        }

        return null;
    }

    this.setup = function() {
        console.log("Opening serial port to " + config.device);
        serialPort = new serialport.SerialPort(config.device, {
            baudrate: config.baudrate,
            parser: serialport.parsers.readline("x")
        });

        serialPort.on("open", function() {
            console.log("Serial port is now open!");

            serialPort.on("data", function(data) {
                console.log("Data received: " + data);

                var propertyInfo = getPropertyByCommandLetter(data[0]);

                if (!propertyInfo) {
                    console.error("Got data for unknown property!");
                    return;
                }

                var property = propertyInfo.property;
                var name = propertyInfo.name;

                var info = data.split(" ")[2];

                if (info.substr(0, 2) === "NG") {
                    for (var n = 0; n < property.actions.length; n++) {
                        eventHandler("error", "Failed to set value for property " + name, property.actions[n]);
                    }
                    property.actions = [];
                    return;
                }

                var raw = info.substr(2);
                rawToValue(property, raw, function(error, value) {
                    if (error) {
                        for (var n = 0; n < property.actions.length; n++) {
                            eventHandler("error", "Failed to set new value.", property.actions[n]);
                        }
                    } else {
                        var oldValue = property.value;
                        property.value = value;

                        if (property.actions.length === 0) {
                            eventHandler("propertyChange", { oldValue: oldValue, newValue: value });
                        }

                        for (var n = 0; n < property.actions.length; n++) {
                            eventHandler("propertyChange", { oldValue: oldValue, newValue: value }, property.actions[n]);
                        }

                        console.log("Value updated for property " + property.name + " to " + value + " was " + oldValue);
                    }

                    property.actions = [];
                });
            });
        });
    };

    this.setProperty = function(name, value, actionId) {
        var property = properties[name];

        if (!property) {
            eventHandler("error", "Failed to find property named " + name, actionId);
            return;
        }

        valueToRaw(property, value, function(error, raw) {
            if (error) {
                eventHandler("error", value + " is not a valid value for property " + name, actionId);
                return;
            }

            var command = property.command.replace("%id%", config.id).replace("%value%", raw);

            console.log("Setting property " + name + " to " + value + " is " + property.value);
            console.log("Sending command: " + command);

            serialPort.write(command, function(error, results) {
                if (error) {
                    eventHandler("error", "Failed to send command to serial port", actionId);
                    return;
                }

                property.actions = property.actions || [];
                property.actions.push(actionId);
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
        return "tv";
    };

    this.onEvent = function(callback) {
        eventHandler = callback;
    };
};



/*
var serialport = require("serialport");
var Device = require("./device");

var states = require("./states.json");
var config = {
  id: "00",
  device: "/dev/ttyUSB0",
  baudrate: 9600,
  name: "LG TV",
  port: 3000
};

var device = new Device();
var serialPort = new serialport.SerialPort(config.device, {
  baudrate: config.baudrate,
  parser: serialport.parsers.readline("x")
});

device.setMeta(config);

function getStateByName(name) {
  for (var n = 0; n < states.length; n++) {
    if (states[n].name === name) {
      return states[n];
    }
  }

  return null;
}

function getStateByCommandLetter(letter) {
  for (var n = 0; n < states.length; n++) {
    if (states[n].command[1] === letter) {
      return states[n];
    }
  }

  return null;
}

function updateAllStates() {


  for (var n = 0; n < states.length; n++) {
    commandString = states[n].command.replace("%id%", config.id).replace("%value%", "FF");
    serialPort.write(commandString);
  }
}

function updateAllStatesLoop() {
  setTimeout(function() {
      console.log("Checking states for external changes");
      updateAllStates();
      updateAllStatesLoop();
  }, 5000);
}

function setState(name, value) {
  var state = getStateByName(name);

  if (!state) {
    console.error("No state named \"" + name + "\" found!");
    return false;
  }

  if (!state.validValues[value]) {
    console.error("Value is not valid, \"" + value + "\" for state \"" + name + "\"");
    return false;
  }

  var commandString = state.command.replace("%id%", config.id).replace("%value%", state.validValues[value]);

  console.log("Setting state " + name + " to " + value + "...");
  console.log("Sending command: " + commandString);

  serialPort.write(commandString, function(error, results) {
    if (error) {
      console.error("Failed to send command to serial port, error: " + error);
      return;
    }
  });
}

serialPort.on("open", function() {
  console.log("Serial port is now open!");

  serialPort.on("data", function(data) {
    console.log("Data received: " + data);

    var state = getStateByCommandLetter(data[0]);

    if (!state) {
      console.error("Got data for unknown state!");
      return;
    }

    var info = data.split(" ")[2];

    if (info.substr(0, 2) === "NG") {
      console.error("Command failed, will not update any state!");
      return;
    }

    var rawValue = info.substr(2);

    for (var value in state.validValues) {
      if (rawValue === state.validValues[value]) {
        console.log("Updating state value for state " + state.name + " to " + value + "!");
        state.value = value;
        device.setState(state.name, value);
        break;
      }
    }
  });

  for (var n = 0; n < states.length; n++) {
    device.addState(states[n].name, states[n].value, Object.keys(states[n].validValues));
  }


  var commandString = "kl " + config.id + " 00\r";
  serialPort.write(commandString);

  updateAllStates();

  device.start(config.port, setState);

  updateAllStatesLoop();
});*/
