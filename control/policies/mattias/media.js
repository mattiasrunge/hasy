
module.exports = function(control) {
    control.onPropertyChange("pbutton", "Button", function(event) {
        console.log(event);
        if (event.newValue === "M") {
            control.setProperty("yamahareceiver", "Source", "HDMI1");
            control.setProperty("vardagsrumstak", "Value", 0);
        } else if (event.newValue === "T") {
            control.setProperty("yamahareceiver", "Source", "AV1");
            control.setProperty("vardagsrumstak", "Value", 255);
        }
    });
};
