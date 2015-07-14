"use strict";

module.exports = {
    value: 0,
    type: "range",
    min: 0,
    max: 255,
    get: function*(unit) {
        this.value = yield unit.read();
        return this.value;
    },
    set: function*(unit, value) {
        value = parseInt(value, 10);

        if (value < this.min || value > this.max) {
            throw new Error("Value out of range, " + value);
        }

        yield unit.send(value);

        this.value = value;
    }
};
