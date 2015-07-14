"use strict";

module.exports = {
    value: false,
    type: "switch",
    get: function*(unit) {
        this.value = yield unit.read();
        return this.value;
    },
    set: function*(unit, value) {
        yield unit.send(value);

        this.value = value;
    }
};
