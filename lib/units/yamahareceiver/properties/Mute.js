"use strict";

module.exports = {
    value: "OFF",
    type: "enum",
    values: [ "OFF", "ON" ],
    get: function*(unit) {
        let value = yield unit.read("<Main_Zone><Volume><Mute>GetParam</Mute></Volume></Main_Zone>");

        if (value === "On") {
            module.exports.value = "ON";
        } else {
            module.exports.value = "OFF";
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        if (value === "OFF") {
            yield unit.send("<Main_Zone><Volume><Mute>Off</Mute></Volume></Main_Zone>");
        } else if (value === "ON") {
            yield unit.send("<Main_Zone><Volume><Mute>On</Mute></Volume></Main_Zone>");
        } else {
            throw new Error("Unknown value " + value);
        }

        module.exports.value = value;
    }
};
