
var path = require("path");
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var LgTV = require("./units/lgtv/index");

module.exports = function() {
  var units = {};
  
  this.start = function(port) {
    server.listen(port || 3000);

    app.use(express.static(path.join(__dirname, "..", "public")));

    io.on("connection", function(socket) {
      console.log("A new client connected!");
      
      socket.on("setProperty", function(data) {
        units[data.unit].setProperty(data.name, data.value);
      });
      
      socket.on("getUnits", function(data, callback) {
        var list = {};
        
        Object.keys(units).forEach(function(key) {
          list[key] = {
            id: key,
            name: units[key].getName(),
            type: units[key].getType()
          };
          
          list[key].properties = {};
          
          Object.keys(units[key].getProperties()).forEach(function(name) {
            list[key].properties[name] = {
              name: name,
              value: units[key].getProperties()[name].value,
              type: units[key].getProperties()[name].type
            };
          });
        });
            
        callback(list);
      });
    });
    
    units["lgtv"] = new LgTV({ 
      device: "/dev/ttyUSB0",
      baudrate: 9600,
      name: "LG TV"
    });
    
    Object.keys(units).forEach(function(key) {
      units[key].setup();
      
      units[key].onEvent(function(event, data) {
        io.emit(event, { unit: key, data: data });
      });
    });
  };
};
