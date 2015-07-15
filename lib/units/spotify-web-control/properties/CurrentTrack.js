"use strict";

module.exports = {
    value: null,
    type: "spotify-uri",
    get: function*(unit) {
        return module.exports.value;
    },
    set: function*(unit, value) {
        module.exports.value = value;
    }
};
