"use strict";

module.exports = {
    value: "OFF",
    type: "switch",
    get: function*(unit) {
        let result = yield unit.read("k", "a");

        if (result === "01") {
            this.value = "ON";
        } else {
            this.value = "OFF";
        }

        return this.value;
    },
    set: function*(unit, value) {
        if (value === "OFF") {
            yield unit.send("k", "a", "00");
        } else if (value === "ON") {
            yield unit.send("k", "a", "01");
        } else {
            throw new Error("Unknown value " + value);
        }

        this.value = value;
    }
};
