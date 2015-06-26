"use strict";

module.exports = {
    value: "OFF",
    type: "enum",
    values: [ "OFF", "ON" ],
    get: function*(unit) {
        let result = yield unit.read("k", "l");

        if (result === "01") {
            module.exports.value = "ON";
        } else {
            module.exports.value = "OFF";
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        if (value === "OFF") {
            yield unit.send("k", "l", "00");
        } else if (value === "ON") {
            yield unit.send("k", "l", "01");
        } else {
            throw new Error("Unknown value " + value);
        }

        module.exports.value = value;
    }
};
