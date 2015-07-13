"use strict";

module.exports = {
    value: "JUST_SCAN",
    type: "enum",
    values: [ "4_3", "14_9", "ZOOM", "16_9", "JUST_SCAN", "ORIGINAL" ],
    get: function*(unit) {
        let result = yield unit.read("k", "c");

        if (result === "01") {
            this.value = "4_3";
        } else if (result === "07") {
            this.value = "14_9";
        } else if (result === "04") {
            this.value = "ZOOM";
        } else if (result === "02") {
            this.value = "16_9";
        } else if (result === "09") {
            this.value = "JUST_SCAN";
        } else if (result === "06") {
            this.value = "ORIGINAL";
        }

        return this.value;
    },
    set: function*(unit, value) {
        if (this.values.indexOf(value) === -1) {
            throw new Error("Unknown value " + value);
        }

        if (value === "4_3") {
            yield unit.send("k", "c", "01");
        } else if (value === "14_9") {
            yield unit.send("k", "c", "07");
        } else if (value === "ZOOM") {
            yield unit.send("k", "c", "04");
        } else if (value === "16_9") {
            yield unit.send("k", "c", "02");
        } else if (value === "JUST_SCAN") {
            yield unit.send("k", "c", "09");
        } else if (value === "ORIGINAL") {
            yield unit.send("k", "c", "06");
        } else {
            throw new Error("Unknown value " + value);
        }

        this.value = value;
    }
};
