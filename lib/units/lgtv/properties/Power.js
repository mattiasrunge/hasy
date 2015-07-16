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
        if (value) {
            yield unit.send("k", "a", "01");
        } else {
            yield unit.send("k", "a", "00");
        }

        this.value = value;
    }
};
