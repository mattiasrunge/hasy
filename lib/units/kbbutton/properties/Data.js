"use strict";

module.exports = {
    value: false,
    type: "data",
    get: function*(unit) {
        return this.value;
    },
    set: function*(unit, value) {
        this.value = value;
    }
};
