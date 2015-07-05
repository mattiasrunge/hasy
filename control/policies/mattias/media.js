"use strict";

module.exports = function(control) {
    control.onPropertyChange("pbutton", "Button", function*(event) {
        let actions = [];

        if (event.newValue === "M") {
            actions.push(control.setProperty("yamahareceiver", "Source", "HDMI1"));
            actions.push(control.setProperty("vardagsrumstak", "Value", 0));
        } else if (event.newValue === "T") {
            actions.push(control.setProperty("yamahareceiver", "Source", "AV1"));
            actions.push(control.setProperty("vardagsrumstak", "Value", 255));
        }

        return actions;
    });
};
