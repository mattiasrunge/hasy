"use strict";

module.exports = {
    value: 0,
    type: "range",
    min: -800,
    max: 160,
    step: 5,
    get: function*(unit) {
        let result = yield unit.read({ Main_Zone: { Volume: { Lvl: "GetParam" } } });

        return this.value = parseInt(result.Main_Zone.Volume.Lvl.Val, 10);
    },
    set: function*(unit, value) {
        value = parseInt(value, 10);

        if (value < this.min || value > this.max) {
            throw new Error("Value out of range, " + value);
        }

        yield unit.send({ Main_Zone: { Volume: { Lvl: { Val: value, Exp: 1, Unit: "dB" } } } });

        this.value = value;
    }
};
