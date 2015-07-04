"use strict";

module.exports = {
    value: 0,
    type: "range",
    min: 0,
    max: 255,
    get: function*(unit) {
        module.exports.value = yield unit.read();
        return module.exports.value;
    },
    set: function*(unit, value) {
        value = parseInt(value, 10);

        if (value < module.exports.min || value > module.exports.max) {
            throw new Error("Value out of range, " + value);
        }

        yield unit.send(value);

        module.exports.value = value;
    }
};
