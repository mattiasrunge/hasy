"use strict";

module.exports = {
    value: "HDMI1",
    type: "enum",
    values: [ "HDMI1", "HDMI2", "HDMI3", "HDMI4", "HDMI6", "AV1", "AV2", "AV3", "AV4", "AV5", "AV6" ],
    get: function*(unit) {
        let result = yield unit.read({ Main_Zone: { Input: { Input_Sel: "GetParam" } } } );

        return this.value = result.Main_Zone.Input.Input_Sel;
    },
    set: function*(unit, value) {
        if (this.values.indexOf(value) === -1) {
            throw new Error("Unknown value " + value);
        }

        yield unit.send({ Main_Zone: { Input: { Input_Sel: value } } });

        this.value = value;
    }
};
