"use strict";

let units = {};

function Unit(host) {
    let socket = require("socket.io-client")(host);

    this.setProperty = function(unitId, name, value) {
        socket.emit("setProperty", { unitId: unitId, name: name, value: value, actionId: 0 });
    };

    socket.on("connect", function() {
        socket.emit("getUnits", {}, function(list) {
            for (let id in list) {
                list[id].setProperty = function(name, value) {
                    console.log("setProperty", id, name, value);
                    socket.emit("setProperty", { unitId: id, name: name, value: value, actionId: 0 });
                };

                /*
                list[id].getProperty = function(name, value) {
                    socket.emit("setProperty", { unitId: list[id], name: id, value: value, actionId: 0 });
                });*/

                units[id] = list[id]
            }
        });
    });

    socket.on("propertyChange", function(data) {
        eventHandler("propertyChange", data);
    }.bind(this));

    socket.on("disconnect", function() {
        eventHandler("offline");
    });
}

let server = new Unit("http://localhost:3000");

function eventHandler(event, data) {
    if (event === "propertyChange") {
        if (data.unitId === "pbutton") {
            if (data.data.oldValue === "M" && data.data.newValue === false) {
                units["yamahareceiver"].setProperty("Source", "HDMI1");
            } else if (data.data.oldValue === "T" && data.data.newValue === false) {
                units["yamahareceiver"].setProperty("Source", "AV1");
            }
        }
    }
}
