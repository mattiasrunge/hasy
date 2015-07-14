"use strict";

module.exports = {
    value: false,
    type: "switch",
    get: function*(unit) {
        let result = yield unit.read({ System: { Power_Control: { Power: "GetParam" } } });

        return this.value = result.System.Power_Control.Power === "On";
    },
    set: function*(unit, value) {
        if (value === false) {
            yield unit.send({ System: { Power_Control: { Power: "Standby" } } });
        } else if (value === true) {
            yield unit.send({ System: { Power_Control: { Power: "On" } } });
        } else {
            throw new Error("Unknown value " + value);
        }

        this.value = value;
    }
};
