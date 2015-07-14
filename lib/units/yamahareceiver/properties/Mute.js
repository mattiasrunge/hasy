"use strict";

module.exports = {
    value: false,
    type: "switch",
    get: function*(unit) {
        let result = yield unit.read({ Main_Zone: { Volume: { Mute: "GetParam" } } });

        return this.value = result.Main_Zone.Volume.Mute === "On";
    },
    set: function*(unit, value) {
        if (value === false) {
            yield unit.send({ Main_Zone: { Volume: { Mute: "Off" } } });
        } else if (value === true) {
            yield unit.send({ Main_Zone: { Volume: { Mute: "On" } } });
        } else {
            throw new Error("Unknown value " + value);
        }

        this.value = value;
    }
};
