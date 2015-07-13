"use strict";

module.exports = {
    value: false,
    type: "switch",
    get: function*(unit) {
        let value = yield unit.read("<Main_Zone><Volume><Mute>GetParam</Mute></Volume></Main_Zone>");

        if (value === "On") {
            this.value = true;
        } else {
            this.value = false;
        }

        return this.value;
    },
    set: function*(unit, value) {
        if (value === false) {
            yield unit.send("<Main_Zone><Volume><Mute>Off</Mute></Volume></Main_Zone>");
        } else if (value === true) {
            yield unit.send("<Main_Zone><Volume><Mute>On</Mute></Volume></Main_Zone>");
        } else {
            throw new Error("Unknown value " + value);
        }

        this.value = value;
    }
};
