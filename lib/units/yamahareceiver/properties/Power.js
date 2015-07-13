"use strict";

module.exports = {
    value: false,
    type: "switch",
    get: function*(unit) {
        let result = yield unit.read("<System><Power_Control><Power>GetParam</Power></Power_Control></System>");

        if (result === "On") {
            this.value = true;
        } else {
            this.value = false;
        }

        return this.value;
    },
    set: function*(unit, value) {
        if (value === false) {
            yield unit.send("<System><Power_Control><Power>Standby</Power></Power_Control></System>");
        } else if (value === true) {
            yield unit.send("<System><Power_Control><Power>On</Power></Power_Control></System>");
        } else {
            throw new Error("Unknown value " + value);
        }

        this.value = value;
    }
};
