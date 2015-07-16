"use strict";

module.exports = function(properties) {
    properties.onEvent(function(event, data) {
        if (event === "propertyChange") {
//             console.log(JSON.stringify(data, null, 2));
            if (data.unitId === "keyboard" && data.data.name === "Data") {

                if (data.data.newValue === "KEY_F1") {
                    properties.set("livingroom-ceiling", "Value", 0);
                    properties.set("yamahareceiver", "Power", true);
                    properties.set("yamahareceiver", "Source", "HDMI1");
                    properties.set("livingroom-tv", "Source", "HDMI2");
                } else if (data.data.newValue === "KEY_F2") {
                    properties.set("livingroom-ceiling", "Value", 255);
                    properties.set("livingroom-ceiling", "Value", 255);
                    properties.set("livingroom-vitrine", "Value", 255);
                    properties.set("livingroom-window", "Value", 255);
                    properties.set("livingroom-bar", "Value", 255);
                    properties.set("hall-ceiling", "Value", 255);
                    properties.set("hall-mirror", "Value", 255);
                    properties.set("bedroom-wall", "Value", 255);
                    properties.set("bedroom-ceiling", "Value", 255);
                    properties.set("bedroom-door", "Value", 255);
                    properties.set("yamahareceiver", "Power", true);
                    properties.set("livingroom-tv", "Power", true);
                    properties.set("yamahareceiver", "Source", "AV1");
                    properties.set("livingroom-tv", "Source", "DTV");
                }  else if (data.data.newValue === "KEY_F3") {
                    properties.set("yamahareceiver", "Power", false);
                    properties.set("livingroom-tv", "Power", false);
                    properties.set("livingroom-ceiling", "Value", 0);
                    properties.set("livingroom-window", "Value", 0);
                    properties.set("livingroom-vitrine", "Value", 0);
                    properties.set("livingroom-bar", "Value", 0);
                    properties.set("hall-ceiling", "Value", 0);
                    properties.set("hall-mirror", "Value", 0);
                    properties.set("bedroom-wall", "Value", 0);
                    properties.set("bedroom-ceiling", "Value", 0);
                    properties.set("bedroom-door", "Value", 0);
                }
            } else if (data.unitId === "nexa-remote" && data.data.newValue.payload.protocol === "arctech") {
                let id = data.data.newValue.payload.group + "_" + data.data.newValue.payload.unit;

                if (id === "0_1") {
                    properties.set("livingroom-ceiling", "Value", data.data.newValue.payload.method === "turnon" ? 255 : 0);
                }
            }
        }
    });
};
