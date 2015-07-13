"use strict";

module.exports = {
    value: "00",
    type: "range",
    min: -800,
    max: 160,
    step: 5,
    get: function*(unit) {
        let result = yield unit.read("<Main_Zone><Volume><Lvl>GetParam</Lvl></Volume></Main_Zone>");

        if (result) {
            this.value = result;
        }

        return this.value;
    },
    set: function*(unit, value) {
        value = parseInt(value, 10);

        if (value < this.min || value > this.max) {
            throw new Error("Value out of range, " + value);
        }

        yield unit.send("<Main_Zone><Volume><Lvl><Val>" + value + "</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></Main_Zone>");

        this.value = value;
    }
};
