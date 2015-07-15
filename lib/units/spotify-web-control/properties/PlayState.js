"use strict";

module.exports = {
    value: "Paused",
    type: "enum",
    values: [ "Paused", "Playing" ],
    get: function*(unit) {
        return module.exports.value;
    },
    set: function*(unit, value) {
        module.exports.value = value;
    }
};
