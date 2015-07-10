"use strict";

module.exports = {
  value: Math.random().toString(),
    type: "message",
    get: function*(unit) {
      return Math.random().toString();
    },
    set: function*(unit, value) {
        module.exports.value = value;
    }
};
