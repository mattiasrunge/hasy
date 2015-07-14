"use strict";

module.exports = function(properties) {
    control.onPropertyChange("button", "Button", function*(event) {
        let actions = [];

        if (event.newValue === "M") {
//             actions.push(control.setProperty("yamahareceiver", "Source", "HDMI1"));
            actions.push(control.setProperty("vardagsrumstak", "Value", 0));
//             actions.push(control.setProperty("vardagsrumstv", "Source", "HDMI2"));
        } else if (event.newValue === "T") {
//             actions.push(control.setProperty("yamahareceiver", "Source", "AV1"));
            actions.push(control.setProperty("vardagsrumstak", "Value", 255));
//             actions.push(control.setProperty("vardagsrumstv", "Source", "DTV"));
        }

        return actions;
    });
};
