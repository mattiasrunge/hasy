"use strict";

module.exports = {
    value: "OFF",
    type: "enum",
    values: [ "OFF", "ON" ],
    get: function*(unit) {
        let result = yield unit.read("<System><Power_Control><Power>GetParam</Power></Power_Control></System>");

        if (result === "On") {
            module.exports.value = "ON";
        } else {
            module.exports.value = "OFF";
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        if (value === "OFF") {
            yield unit.send("<System><Power_Control><Power>Standby</Power></Power_Control></System>");
        } else if (value === "ON") {
            yield unit.send("<System><Power_Control><Power>On</Power></Power_Control></System>");
        } else {
            throw new Error("Unknown value " + value);
        }

        module.exports.value = value;
    }
};
