"use strict";

module.exports = {
    value: true,
    type: "switch",
    get: function*(unit) {
        let result = yield unit.read("k", "m");

        if (result === "01") {
            this.value = false;
        } else {
            this.value = true;
        }

        return this.value;
    },
    set: function*(unit, value) {
        if (value === true) {
            yield unit.send("k", "m", "00");
        } else if (value === false) {
            yield unit.send("k", "m", "01");
        } else {
            throw new Error("Unknown value " + value);
        }

        this.value = value;
    }
};
