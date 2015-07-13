"use strict";

module.exports = {
    value: false,
    type: "button",
    get: function*(unit) {
        return this.value;
    },
    set: function*(unit, value) {
        this.value = value;
    }
};
