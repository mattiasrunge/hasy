"use strict";

module.exports = {
    value: false,
    type: "switch",
    get: function*(unit) {
        let result = yield unit.read("k", "l");

        if (result === "01") {
            this.value = true;
        } else {
            this.value = false;
        }

        return this.value;
    },
    set: function*(unit, value) {
        if (value === false) {
            yield unit.send("k", "l", "00");
        } else if (value === true) {
            yield unit.send("k", "l", "01");
        } else {
            throw new Error("Unknown value " + value);
        }

        this.value = value;
    }
};
