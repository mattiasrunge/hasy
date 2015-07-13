"use strict";

module.exports = {
    value: "HDMI1",
    type: "enum",
    values: [ "DTV", "ANALOGUE", "AV", "COMPONENT", "RGB", "HDMI1", "HDMI2", "HDMI3", "HDMI4" ],
    get: function*(unit) {
        let result = yield unit.read("x", "b");

        if (result === "00") {
            this.value = "DTV";
        } else if (result === "10") {
            this.value = "ANALOGUE";
        } else if (result === "20") {
            this.value = "AV";
        } else if (result === "40") {
            this.value = "COMPONENT";
        } else if (result === "60") {
            this.value = "RGB";
        } else if (result === "90") {
            this.value = "HDMI1";
        } else if (result === "91") {
            this.value = "HDMI2";
        } else if (result === "92") {
            this.value = "HDMI3";
        } else if (result === "93") {
            this.value = "HDMI4";
        }

        return this.value;
    },
    set: function*(unit, value) {
        if (this.values.indexOf(value) === -1) {
            throw new Error("Unknown value " + value);
        }

        if (value === "DTV") {
            yield unit.send("x", "b", "00");
        } else if (value === "ANALOGUE") {
            yield unit.send("x", "b", "10");
        } else if (value === "AV") {
            yield unit.send("x", "b", "20");
        } else if (value === "COMPONENT") {
            yield unit.send("x", "b", "30");
        } else if (value === "RGB") {
            yield unit.send("x", "b", "40");
        } else if (value === "HDMI1") {
            yield unit.send("x", "b", "90");
        } else if (value === "HDMI2") {
            yield unit.send("x", "b", "91");
        } else if (value === "HDMI3") {
            yield unit.send("x", "b", "92");
        } else if (value === "HDMI4") {
            yield unit.send("x", "b", "93");
        } else {
            throw new Error("Unknown value " + value);
        }

        this.value = value;
    }
};
