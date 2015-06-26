"use strict";

module.exports = {
    value: "VIDEO_ON_AUDIO_ON",
    type: "enum",
    values: [ "VIDEO_ON_AUDIO_ON", "VIDEO_OFF_AUDIO_ON", "VIDEO_OFF_AUDIO_OFF" ],
    get: function*(unit) {
        let result = yield unit.read("k", "d");

        if (result === "00") {
            module.exports.value = "VIDEO_ON_AUDIO_ON";
        } else if (result === "01") {
            module.exports.value = "VIDEO_OFF_AUDIO_ON";
        } else if (result === "10") {
            module.exports.value = "VIDEO_OFF_AUDIO_OFF";
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        if (module.exports.values.indexOf(value) === -1) {
            throw new Error("Unknown value " + value);
        }

        if (value === "VIDEO_ON_AUDIO_ON") {
            yield unit.send("k", "d", "00");
        } else if (value === "VIDEO_OFF_AUDIO_ON") {
            yield unit.send("k", "d", "01");
        } else if (value === "VIDEO_OFF_AUDIO_OFF") {
            yield unit.send("k", "d", "10");
        } else {
            throw new Error("Unknown value " + value);
        }

        module.exports.value = value;
    }
};
