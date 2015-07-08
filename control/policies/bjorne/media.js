"use strict";

var Promise = require("bluebird");
var co = Promise.coroutine;

module.exports = function(control) {
    let lamps = "vardagsrum-fonster-1 vardagsrum-fonster-2 vardagsrum-koksbank vardagsrum-langlampa sovrum-skrivbord sovrum-fonster".split(" ");

    let setLamps = co(function*(value) {
        for (let l of lamps) {
            console.log("jaha", l, new Date().getTime());
            yield control.setProperty(l, "Value", value);
        }
    });

    control.onPropertyChange("pushbullet", "Message", function*(event) {
        if (event.newValue == "enabled") {
            console.log("sleep mode enabled, turning off all");
            yield setLamps(0);
        }

    });

    control.onPropertyChange("mediabutton", "Button", function*(event) {
        if (event.newValue === "KEY_F13") {
            console.log("media button all on");
            yield setLamps(255);
        } else if (event.newValue == "KEY_F14") {
            console.log("media button all off");
            yield setLamps(0);
        }

        // return actions;
    });
};
