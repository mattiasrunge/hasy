
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

module.exports = function() {
  var states = [];
  var meta = {};

  this.start = function(port, setFn) {
    server.listen(port);

    app.use(express.static(__dirname + "/public"));

    io.on("connection", function(socket) {
      console.log("A new client connected!");
      
      socket.on("set", function(data) {
        setFn(data.name, data.value);
      });
      
      socket.on("list", function(data, callback) {
        callback(states);
      });
      
      socket.on("meta", function(data, callback) {
        callback(meta);
      });
    });
  };
  
  this.setMeta = function(metadata) {
    meta = metadata;
  };
  
  this.addState = function(name, value, validValues) {
    states.push({
      name: name,
      value: value,
      validValues: validValues
    });
  };
  
  this.setState = function(name, value) {
    for (var n = 0; n < states.length; n++) {
      if (states[n].name === name && states[n].value !== value) {
	console.log("setState", name, states[n].value, value);
        states[n].value = value;
        io.emit("change", { name: name, value: value });
        break;
      }
    }
  };
};
