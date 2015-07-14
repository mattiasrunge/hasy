"use strict";

module.exports = function(properties) {
    properties.onEvent(function(event, data) {
        if (event === "propertyChange") {
            console.log(JSON.stringify(data, null, 2));
            if (data.unitId === "button" && data.data.name === "Data") {
                if (data.data.newValue === "KEY_O") {
        //             actions.push(control.setProperty("yamahareceiver", "Source", "HDMI1"));
                    properties.set("livingroom-ceiling", "Value", 0);
        //             actions.push(control.setProperty("vardagsrumstv", "Source", "HDMI2"));
                } else if (data.data.newValue === "KEY_P") {
        //             actions.push(control.setProperty("yamahareceiver", "Source", "AV1"));
                    properties.set("livingroom-ceiling", "Value", 255);
        //             actions.push(control.setProperty("vardagsrumstv", "Source", "DTV"));
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
