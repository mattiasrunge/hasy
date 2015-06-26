"use strict";

module.exports = {
    value: "OFF",
    type: "enum",
    values: [ "OFF", "ON" ],
    get: function*(unit) {
        let result = yield unit.read("ka 00 FF");
console.log(result);
        if (result === "On") {
            module.exports.value = "ON";
        } else {
            module.exports.value = "OFF";
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        if (value === "OFF") {
            yield unit.send("ka 00 00");
        } else if (value === "ON") {
            yield unit.send("ka 00 01");
        } else {
            throw new Error("Unknown value " + value);
        }

        module.exports.value = value;
    }
};
