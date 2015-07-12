"use strict";

var Promise = require("bluebird");
var co = Promise.coroutine;
let logger = require('../../../lib/logger')(module);

module.exports = function(control) {
    let lamps = "vardagsrum-fonster-1 vardagsrum-fonster-2 vardagsrum-koksbank sovrum-skrivbord sovrum-fonster hall".split(" ");
    let current = 0;
    let lampMap = {
        default: [0, 255, 255],
        hall: [0, 100, 255],
        "sovrum-skrivbord": [0, 100, 255],
        "sovrum-fonster": [0, 100, 255],
        "vardagsrum-koksbank": [0, 200, 255],
    };

    let setLamps = co(function*(value) {
        for (let l of lamps) {
            console.log("mmm", l, lampMap[l], value);
            yield control.setProperty(l, "Value", (lampMap[l] || lampMap["default"])[value]);
        }
    });

    control.onPropertyChange("ifttt", "Message", function*(event) {
        if (event.newValue.match(/lights toggle/)) {
            let newCurrent = (current + 1) % 3;
            logger.info("IFTTT lights toggle, leaving %s and entering %s", current, newCurrent);
            current = newCurrent;
            yield setLamps(current);
            yield control.setProperty("yamahareceiver", "Power", current == 0 ? "OFF" : "ON");
        }

    });

    control.onPropertyChange("mediabutton", "Button", function*(event) {
        if (event.newValue === "KEY_F13") {
            logger.info("media button all on");
            yield setLamps(255);
            yield control.setProperty("yamahareceiver", "Volume", -255);
        } else if (event.newValue == "KEY_F14") {
            logger.info("media button all off");
            yield setLamps(0);
            yield control.setProperty("yamahareceiver", "Volume", -485);
        }

        // return actions;
    });
};
