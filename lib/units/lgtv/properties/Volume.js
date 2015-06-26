"use strict";

module.exports = {
    value: "00",
    type: "range",
    min: 0,
    max: 100,
    get: function*(unit) {
        let result = yield unit.read("k", "f");

        if (result) {
            module.exports.value = parseInt(result, 16);
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        value = parseInt(value, 10);

        if (value < module.exports.min || value > module.exports.max) {
            throw new Error("Value out of range, " + value);
        }

        yield unit.send("k", "f", value.toString(16));

        module.exports.value = value;
    }
};
