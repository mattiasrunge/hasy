"use strict";

module.exports = {
    value: "00",
    type: "range",
    min: -800,
    max: 160,
    get: function*(unit) {
        let result = yield unit.read("<Main_Zone><Volume><Lvl>GetParam</Lvl></Volume></Main_Zone>");

        if (result) {
            module.exports.value = result;
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        value = parseInt(value, 10);

        if (value < module.exports.min || value > module.exports.max) {
            throw new Error("Value out of range, " + value);
        }

        yield unit.send("<Main_Zone><Volume><Lvl><Val>" + value + "</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></Main_Zone>");

        module.exports.value = value;
    }
};
