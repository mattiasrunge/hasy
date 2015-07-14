"use strict";

module.exports = function(properties) {
    properties.onEvent(function(event, data) {
        if (event === "propertyChange" && data.unitId === "button" && data.data.name === "Data") {
            if (data.data.newValue === "KEY_O") {
    //             actions.push(control.setProperty("yamahareceiver", "Source", "HDMI1"));
                properties.set("livingroom-ceiling", "Value", 0);
    //             actions.push(control.setProperty("vardagsrumstv", "Source", "HDMI2"));
            } else if (data.data.newValue === "KEY_P") {
    //             actions.push(control.setProperty("yamahareceiver", "Source", "AV1"));
                properties.set("livingroom-ceiling", "Value", 255);
    //             actions.push(control.setProperty("vardagsrumstv", "Source", "DTV"));
            }
        }
    });
};
