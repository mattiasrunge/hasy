
module.exports = function(config) {
  var eventHandler = function() {};
  var properties = {
    power: {
      value: "ON",
      type: "enum"
    },
    volume: {
      value: 0,
      type: "range"
    }
  };
  
  this.setup = function() {
    
  };
  
  this.setProperty = function(name, value) {
    console.log(name + " changed from " + properties[name].value + " to " + value); 
    properties[name].value = value;
    eventHandler(name, value);
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
