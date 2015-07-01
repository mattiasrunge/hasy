"use strict";

module.exports = {
    value: false,
    type: "button",
    get: function*(unit) {
        return module.exports.value;
    },
    set: function*(unit, value) {
        module.exports.value = value;
    }
};
