"use strict";

module.exports = {
    value: "ON",
    type: "enum",
    values: [ "OFF", "ON" ],
    get: function*(unit) {
        let result = yield unit.read("k", "m");

        if (result === "01") {
            module.exports.value = "OFF";
        } else {
            module.exports.value = "ON";
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        if (value === "ON") {
            yield unit.send("k", "m", "00");
        } else if (value === "OFF") {
            yield unit.send("k", "m", "01");
        } else {
            throw new Error("Unknown value " + value);
        }

        module.exports.value = value;
    }
};
